package com.panda.service.impl;

import com.panda.context.BaseContext;
import com.panda.dto.UserBillOperateDTO;
import com.panda.dto.UserDeleteDTO;
import com.panda.dto.UserLoginDTO;
import com.panda.dto.UserRegisterDTO;
import com.panda.dto.UserResetPasswordDTO;
import com.panda.entity.FaultReport;
import com.panda.entity.RentalOrder;
import com.panda.entity.User;
import com.panda.entity.UserBill;
import com.panda.entity.UserWallet;
import com.panda.exception.BaseException;
import com.panda.mapper.FaultReportMapper;
import com.panda.mapper.RentalOrderMapper;
import com.panda.mapper.ScooterMapper;
import com.panda.mapper.SubscriptionPackageMapper;
import com.panda.mapper.UserBillMapper;
import com.panda.mapper.UserMapper;
import com.panda.mapper.UserWalletMapper;
import com.panda.properties.JwtProperties;
import com.panda.properties.MinioProperties;
import com.panda.service.UserService;
import com.panda.utils.JwtUtil;
import com.panda.vo.UserBillVO;
import com.panda.vo.UserFaultVO;
import com.panda.vo.UserLoginVO;
import com.panda.vo.UserWalletVO;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private static final List<String> IMAGE_SUFFIXES = List.of(".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp");

    private final UserMapper userMapper;
    private final UserWalletMapper userWalletMapper;
    private final UserBillMapper userBillMapper;
    private final FaultReportMapper faultReportMapper;
    private final ScooterMapper scooterMapper;
    private final SubscriptionPackageMapper subscriptionPackageMapper;
    private final RentalOrderMapper rentalOrderMapper;
    private final JwtProperties jwtProperties;
    private final MinioProperties minioProperties;
    private final MinioClient minioClient;
    private final JavaMailSender javaMailSender;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    @Transactional
    public void register(UserRegisterDTO userRegisterDTO) {
        validateVerificationCode(userRegisterDTO.getEmail(), userRegisterDTO.getVerificationCode());
        User existUser = userMapper.getByEmail(userRegisterDTO.getEmail());
        if (existUser != null) {
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
    }

    @Override
    public UserLoginVO login(UserLoginDTO userLoginDTO) {
        User user = userMapper.getByEmail(userLoginDTO.getEmail());
        if (user == null) {
            throw new BaseException("用户不存在");
        }
        if (!user.getPassword().equals(encrypt(userLoginDTO.getPassword()))) {
            throw new BaseException("密码错误");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        String token = JwtUtil.createJWT(jwtProperties.getSecretKey(), jwtProperties.getTtl(), claims);

        return UserLoginVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .token(token)
                .build();
    }

    @Override
    public void logout() {
        log.info("user logout, userId={}", BaseContext.getCurrentId());
    }

    @Override
    @Transactional
    public void delete(UserDeleteDTO userDeleteDTO) {
        Long userId = currentUserId();
        User user = userMapper.getById(userId);
        if (user == null) {
            throw new BaseException("用户不存在");
        }
        validateVerificationCode(user.getEmail(), userDeleteDTO.getVerificationCode());
        if (!user.getPassword().equals(encrypt(userDeleteDTO.getPassword()))) {
            throw new BaseException("密码错误");
        }
        userMapper.deleteById(userId);
        clearVerificationCode(user.getEmail());
    }

    @Override
    public String sendVerificationCode(String email) {
        if (!StringUtils.hasText(email)) {
            throw new BaseException("邮箱不能为空");
        }
        String code = buildVerificationCode();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("1105554311@qq.com");
        message.setTo(email);
        message.setSubject("Panda Scooter 验证码");
        message.setText("您的验证码为：" + code + "，" + VERIFICATION_CODE_EXPIRE_MINUTES + "分钟内有效。");
        javaMailSender.send(message);
        stringRedisTemplate.opsForValue().set(buildVerificationCodeKey(email), code, Duration.ofMinutes(VERIFICATION_CODE_EXPIRE_MINUTES));
        return code;
    }

    @Override
    public void resetPassword(UserResetPasswordDTO userResetPasswordDTO) {
        Long userId = currentUserId();
        User user = userMapper.getById(userId);
        if (user == null) {
            throw new BaseException("用户不存在");
        }
        validateVerificationCode(user.getEmail(), userResetPasswordDTO.getVerificationCode());
        userMapper.updatePasswordById(userId, encrypt(userResetPasswordDTO.getNewPassword()));
        clearVerificationCode(user.getEmail());
    }

    @Override
    public UserWalletVO getWallet() {
        Long userId = currentUserId();
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
        UserWallet userWallet = userWalletMapper.getByUserId(userId);
        if (userWallet == null) {
            throw new BaseException("钱包不存在");
        }

        BigDecimal changeAmount = userBillOperateDTO.getAmount();
        if (userBillOperateDTO.getType() == 1 || userBillOperateDTO.getType() == 4) {
            changeAmount = changeAmount.negate();
        }
        BigDecimal newBalance = userWallet.getBalance().add(changeAmount);
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
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
    }

    @Override
    public List<UserBillVO> listBills() {
        Long userId = currentUserId();
        return userBillMapper.listByUserId(userId).stream().map(item -> UserBillVO.builder()
                .id(item.getId())
                .type(item.getType())
                .amount(item.getAmount())
                .remark(item.getRemark())
                .createTime(item.getCreateTime())
                .build()).toList();
    }

    @Override
    public List<UserFaultVO> listFaults() {
        Long userId = currentUserId();
        return faultReportMapper.listByUserId(userId).stream().map(item -> {
            UserFaultVO vo = new UserFaultVO();
            vo.setId(item.getId());
            var scooter = scooterMapper.getById(item.getScooterId());
            vo.setCode(scooter == null ? String.valueOf(item.getScooterId()) : scooter.getCode());
            vo.setDescription(item.getDescription());
            vo.setCreateTime(item.getCreateTime());
            return vo;
        }).toList();
    }

    @Override
    @Transactional
    public Map<String, Object> reportFault(Long scooterId, String description, MultipartFile image) {
        Long userId = currentUserId();
        var scooter = scooterMapper.getById(scooterId);
        if (scooter == null) {
            throw new BaseException("车辆不存在");
        }

        FaultReport faultReport = new FaultReport();
        faultReport.setUserId(userId);
        faultReport.setScooterId(scooterId);
        faultReport.setDescription(description);
        faultReport.setImageUrl(resolveImageUrl(image));
        faultReport.setStatus(0);
        faultReport.setCreateTime(LocalDateTime.now());
        faultReportMapper.insert(faultReport);

        scooterMapper.updateStatusAndLocation(
                scooter.getId(),
                scooter.getRideStatus(),
                1,
                scooter.getBattery(),
                scooter.getLatitude(),
                scooter.getLongitude()
        );

        Map<String, Object> data = new HashMap<>();
        data.put("fault_status", 1);
        if (Integer.valueOf(1).equals(scooter.getRideStatus())) {
            RentalOrder ridingOrder = rentalOrderMapper.getRidingOrderByScooterId(scooterId);
            data.put("orderId", ridingOrder == null ? null : ridingOrder.getId());
        } else {
            data.put("orderId", null);
        }
        return data;
    }

    @Override
    public Map<String, Object> listSubscriptions() {
        Map<String, Object> data = new HashMap<>();
        data.put("packages", subscriptionPackageMapper.listAll());
        return data;
    }

    private Long currentUserId() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            throw new BaseException("未登录");
        }
        return userId;
    }

    private void validateVerificationCode(String email, String verificationCode) {
        String cacheCode = stringRedisTemplate.opsForValue().get(buildVerificationCodeKey(email));
        if (!StringUtils.hasText(cacheCode)) {
            throw new BaseException("请先获取验证码");
        }
        if (!cacheCode.equals(verificationCode)) {
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

    private String resolveImageUrl(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }
        try {
            String suffix = resolveImageSuffix(image.getOriginalFilename());
            String objectName = "faults/" + UUID.randomUUID().toString().replace("-", "") + suffix;

            ensureBucketExists();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .object(objectName)
                            .stream(image.getInputStream(), image.getSize(), -1)
                            .contentType(image.getContentType())
                            .build()
            );
            return buildObjectUrl(objectName);
        } catch (IOException e) {
            throw new BaseException("图片读取失败");
        } catch (Exception e) {
            throw new BaseException("图片上传失败");
        }
    }

    private String resolveImageSuffix(String originalFilename) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) {
            throw new BaseException("图片后缀不合法");
        }

        String suffix = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!IMAGE_SUFFIXES.contains(suffix)) {
            throw new BaseException("仅支持图片类型后缀上传");
        }
        return suffix;
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder()
                        .bucket(minioProperties.getBucketName())
                        .build()
        );
        if (!exists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .build()
            );
        }
    }

    private String buildObjectUrl(String objectName) {
        String endpoint = minioProperties.getEndpoint();
        if (endpoint.endsWith("/")) {
            endpoint = endpoint.substring(0, endpoint.length() - 1);
        }
        return endpoint + "/" + minioProperties.getBucketName() + "/" + objectName;
    }
}
