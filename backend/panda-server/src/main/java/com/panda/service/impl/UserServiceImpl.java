package com.panda.service.impl;

import com.panda.context.BaseContext;
import com.panda.dto.UserBillOperateDTO;
import com.panda.dto.UserDeleteDTO;
import com.panda.dto.UserLoginDTO;
import com.panda.dto.UserRegisterDTO;
import com.panda.dto.UserResetPasswordDTO;
import com.panda.entity.User;
import com.panda.entity.UserBill;
import com.panda.entity.UserWallet;
import com.panda.exception.BaseException;
import com.panda.mapper.UserBillMapper;
import com.panda.mapper.UserMapper;
import com.panda.mapper.UserWalletMapper;
import com.panda.properties.JwtProperties;
import com.panda.service.UserService;
import com.panda.utils.JwtUtil;
import com.panda.vo.UserBillVO;
import com.panda.vo.UserLoginVO;
import com.panda.vo.UserWalletVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final long VERIFICATION_CODE_EXPIRE_MINUTES = 5L;
    private static final String VERIFICATION_CODE_KEY_PREFIX = "panda:verification:email:";

    private final UserMapper userMapper;
    private final UserWalletMapper userWalletMapper;
    private final UserBillMapper userBillMapper;
    private final JwtProperties jwtProperties;
    private final JavaMailSender javaMailSender;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    @Transactional
    public void register(UserRegisterDTO userRegisterDTO) {
        log.info("用户注册开始，email={}", userRegisterDTO.getEmail());
        validateVerificationCode(userRegisterDTO.getEmail(), userRegisterDTO.getVerificationCode());
        User existUser = userMapper.getByEmail(userRegisterDTO.getEmail());
        if (existUser != null) {
            log.warn("用户注册失败，邮箱已存在，email={}", userRegisterDTO.getEmail());
            throw new BaseException("邮箱已注册");
        }

        User user = new User();
        user.setUsername(buildUsername(userRegisterDTO.getEmail()));
        user.setEmail(userRegisterDTO.getEmail());
        user.setPassword(encrypt(userRegisterDTO.getPassword()));
        user.setCreateTime(LocalDateTime.now());
        userMapper.insert(user);

        UserWallet userWallet = new UserWallet();
        userWallet.setUserId(user.getId());
        userWallet.setBalance(BigDecimal.ZERO);
        userWallet.setUpdateTime(LocalDateTime.now());
        userWalletMapper.insert(userWallet);
        clearVerificationCode(userRegisterDTO.getEmail());
        log.info("用户注册成功，userId={}, email={}, username={}", user.getId(), userRegisterDTO.getEmail(), user.getUsername());
    }

    @Override
    public UserLoginVO login(UserLoginDTO userLoginDTO) {
        log.info("用户登录开始，email={}", userLoginDTO.getEmail());
        User user = userMapper.getByEmail(userLoginDTO.getEmail());
        if (user == null) {
            log.warn("用户登录失败，用户不存在，email={}", userLoginDTO.getEmail());
            throw new BaseException("用户不存在");
        }
        if (!user.getPassword().equals(encrypt(userLoginDTO.getPassword()))) {
            log.warn("用户登录失败，密码错误，userId={}", user.getId());
            throw new BaseException("密码错误");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        String token = JwtUtil.createJWT(jwtProperties.getSecretKey(), jwtProperties.getTtl(), claims);
        log.info("用户登录成功，userId={}", user.getId());

        return UserLoginVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .token(token)
                .build();
    }

    @Override
    public void logout() {
        Long userId = BaseContext.getCurrentId();
        log.info("用户登出，userId={}", userId);
    }

    @Override
    @Transactional
    public void delete(UserDeleteDTO userDeleteDTO) {
        Long userId = currentUserId();
        User user = userMapper.getById(userId);
        if (user == null) {
            log.warn("用户注销失败，用户不存在，userId={}", userId);
            throw new BaseException("用户不存在");
        }
        log.info("用户注销开始，userId={}, email={}", userId, user.getEmail());
        validateVerificationCode(user.getEmail(), userDeleteDTO.getVerificationCode());
        if (!user.getPassword().equals(encrypt(userDeleteDTO.getPassword()))) {
            log.warn("用户注销失败，密码错误，userId={}", userId);
            throw new BaseException("密码错误");
        }
        userMapper.deleteById(userId);
        clearVerificationCode(user.getEmail());
        log.info("用户注销成功，userId={}", userId);
    }

    @Override
    public String sendVerificationCode(String email) {
        if (!StringUtils.hasText(email)) {
            log.warn("发送验证码失败，邮箱为空");
            throw new BaseException("邮箱不能为空");
        }
        String code = buildVerificationCode();
        log.info("开始发送邮箱验证码，email={}", email);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("1105554311@qq.com");
        message.setTo(email);
        message.setSubject("Panda Scooter 邮箱验证码");
        message.setText("您的验证码为：" + code + "，" + VERIFICATION_CODE_EXPIRE_MINUTES + "分钟内有效。");
        javaMailSender.send(message);
        stringRedisTemplate.opsForValue().set(buildVerificationCodeKey(email), code, Duration.ofMinutes(VERIFICATION_CODE_EXPIRE_MINUTES));
        log.info("邮箱验证码发送成功，email={}", email);
        return code;
    }

    @Override
    public void resetPassword(UserResetPasswordDTO userResetPasswordDTO) {
        Long userId = currentUserId();
        User user = userMapper.getById(userId);
        if (user == null) {
            log.warn("重置密码失败，用户不存在，userId={}", userId);
            throw new BaseException("用户不存在");
        }
        log.info("用户重置密码开始，userId={}", userId);
        validateVerificationCode(user.getEmail(), userResetPasswordDTO.getVerificationCode());
        userMapper.updatePasswordById(userId, encrypt(userResetPasswordDTO.getNewPassword()));
        clearVerificationCode(user.getEmail());
        log.info("用户重置密码成功，userId={}", userId);
    }

    @Override
    public UserWalletVO getWallet() {
        Long userId = currentUserId();
        log.info("查询钱包信息，userId={}", userId);
        UserWallet userWallet = userWalletMapper.getByUserId(userId);
        return UserWalletVO.builder()
                .balance(userWallet == null ? BigDecimal.ZERO : userWallet.getBalance())
                .packages(Collections.emptyList())
                .build();
    }

    @Override
    @Transactional
    public void operateBill(UserBillOperateDTO userBillOperateDTO) {
        Long userId = currentUserId();
        log.info("处理用户账单开始，userId={}, type={}, amount={}", userId, userBillOperateDTO.getType(), userBillOperateDTO.getAmount());
        UserWallet userWallet = userWalletMapper.getByUserId(userId);
        if (userWallet == null) {
            log.warn("处理用户账单失败，钱包不存在，userId={}", userId);
            throw new BaseException("钱包不存在");
        }

        BigDecimal changeAmount = userBillOperateDTO.getAmount();
        if (userBillOperateDTO.getType() == 1 || userBillOperateDTO.getType() == 4) {
            changeAmount = changeAmount.negate();
        }
        BigDecimal newBalance = userWallet.getBalance().add(changeAmount);
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            log.warn("处理用户账单失败，余额不足，userId={}, balance={}, changeAmount={}", userId, userWallet.getBalance(), changeAmount);
            throw new BaseException("余额不足");
        }

        userWalletMapper.updateBalanceByUserId(userId, newBalance);

        UserBill userBill = new UserBill();
        userBill.setUserId(userId);
        userBill.setType(userBillOperateDTO.getType());
        userBill.setAmount(changeAmount);
        userBill.setBalanceAfter(newBalance);
        userBill.setRemark(userBillOperateDTO.getRemark());
        userBill.setCreateTime(LocalDateTime.now());
        userBillMapper.insert(userBill);
        log.info("处理用户账单成功，userId={}, newBalance={}", userId, newBalance);
    }

    @Override
    public List<UserBillVO> listBills() {
        Long userId = currentUserId();
        log.info("查询用户账单列表，userId={}", userId);
        return userBillMapper.listByUserId(userId).stream().map(item -> UserBillVO.builder()
                .id(item.getId())
                .type(item.getType())
                .amount(item.getAmount())
                .remark(item.getRemark())
                .createTime(item.getCreateTime())
                .build()).toList();
    }

    private Long currentUserId() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            log.warn("获取当前用户失败，未登录");
            throw new BaseException("未登录");
        }
        return userId;
    }

    private void validateVerificationCode(String email, String verificationCode) {
        String cacheCode = stringRedisTemplate.opsForValue().get(buildVerificationCodeKey(email));
        if (!StringUtils.hasText(cacheCode)) {
            log.warn("验证码校验失败，邮箱未发送验证码或已过期，email={}", email);
            throw new BaseException("请先获取验证码");
        }
        if (!cacheCode.equals(verificationCode)) {
            log.warn("验证码校验失败，验证码错误，email={}", email);
            throw new BaseException("验证码错误");
        }
    }

    private void clearVerificationCode(String email) {
        stringRedisTemplate.delete(buildVerificationCodeKey(email));
    }

    private String buildVerificationCodeKey(String email) {
        return VERIFICATION_CODE_KEY_PREFIX + email;
    }

    private String buildUsername(String email) {
        String emailPrefix = email.substring(0, email.indexOf("@"));
        String uuidSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return emailPrefix + uuidSuffix;
    }

    private String buildVerificationCode() {
        int code = (int) ((Math.random() * 9 + 1) * 100000);
        return String.valueOf(code);
    }

    private String encrypt(String value) {
        return DigestUtils.md5DigestAsHex(value.getBytes(StandardCharsets.UTF_8));
    }
}
