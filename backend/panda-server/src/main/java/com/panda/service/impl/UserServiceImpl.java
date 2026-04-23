package com.panda.service.impl;

import com.panda.context.BaseContext;
import com.panda.dto.UserBillOperateDTO;
import com.panda.dto.UserDeleteDTO;
import com.panda.dto.UserLoginDTO;
import com.panda.dto.UserRegisterDTO;
import com.panda.dto.UserResetPasswordDTO;
import com.panda.entity.FaultReport;
import com.panda.entity.PackageOrder;
import com.panda.entity.RentalOrder;
import com.panda.entity.SubscriptionPackage;
import com.panda.entity.User;
import com.panda.entity.UserBill;
import com.panda.entity.UserSubscription;
import com.panda.entity.UserWallet;
import com.panda.exception.BaseException;
import com.panda.mapper.FaultReportMapper;
import com.panda.mapper.PackageOrderMapper;
import com.panda.mapper.RentalOrderMapper;
import com.panda.mapper.ScooterMapper;
import com.panda.mapper.SubscriptionPackageMapper;
import com.panda.mapper.UserBillMapper;
import com.panda.mapper.UserMapper;
import com.panda.mapper.UserSubscriptionMapper;
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
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    private final PackageOrderMapper packageOrderMapper;
    private final UserSubscriptionMapper userSubscriptionMapper;
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
            throw new BaseException("邮箱已存在");
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
        message.setText("您的验证码为：" + code + "，有效期 " + VERIFICATION_CODE_EXPIRE_MINUTES + " 分钟。");
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
        LocalDateTime now = LocalDateTime.now();
        userSubscriptionMapper.expireByUserIdAndEndTimeBefore(userId, now);
        List<UserWalletVO.PackageItem> packages = userSubscriptionMapper.listActiveByUserId(userId, now).stream()
                .map(item -> buildPackageItem(item, now))
                .filter(Objects::nonNull)
                .toList();
        return UserWalletVO.builder()
                .balance(userWallet == null ? BigDecimal.ZERO : userWallet.getBalance())
                .packages(packages)
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

        if (Integer.valueOf(4).equals(userBillOperateDTO.getType())) {
            purchaseSubscription(userId, userWallet, userBillOperateDTO);
            return;
        }

        BigDecimal changeAmount = requirePositiveAmount(userBillOperateDTO.getAmount());
        if (Integer.valueOf(1).equals(userBillOperateDTO.getType())) {
            changeAmount = changeAmount.negate();
        }
        BigDecimal newBalance = userWallet.getBalance().add(changeAmount).setScale(2, RoundingMode.HALF_UP);
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new BaseException("余额不足");
        }

        userWalletMapper.updateBalanceByUserId(userId, newBalance);

        UserBill userBill = new UserBill();
        userBill.setUserId(userId);
        userBill.setType(userBillOperateDTO.getType());
        userBill.setAmount(changeAmount);
        userBill.setBalanceAfter(newBalance);
        userBill.setRemark(resolveBillRemark(userBillOperateDTO));
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
            throw new BaseException("用户未登录");
        }
        return userId;
    }

    private void validateVerificationCode(String email, String verificationCode) {
        String cacheCode = stringRedisTemplate.opsForValue().get(buildVerificationCodeKey(email));
        if (!StringUtils.hasText(cacheCode)) {
            throw new BaseException("验证码已过期");
        }
        if (!cacheCode.equals(verificationCode)) {
            throw new BaseException("验证码错误");
        }
    }

    private void clearVerificationCode(String email) {
        stringRedisTemplate.delete(buildVerificationCodeKey(email));
    }

    private void purchaseSubscription(Long userId, UserWallet userWallet, UserBillOperateDTO userBillOperateDTO) {
        if (userBillOperateDTO.getPackageId() == null) {
            throw new BaseException("套餐ID不能为空");
        }

        SubscriptionPackage subscriptionPackage = subscriptionPackageMapper.getById(userBillOperateDTO.getPackageId());
        if (subscriptionPackage == null) {
            throw new BaseException("套餐不存在");
        }

        BigDecimal packagePrice = subscriptionPackage.getPrice().setScale(2, RoundingMode.HALF_UP);
        if (userBillOperateDTO.getAmount() != null) {
            BigDecimal requestAmount = userBillOperateDTO.getAmount().setScale(2, RoundingMode.HALF_UP);
            if (requestAmount.compareTo(packagePrice) != 0) {
                throw new BaseException("支付金额与套餐价格不一致");
            }
        }
        if (userWallet.getBalance().compareTo(packagePrice) < 0) {
            throw new BaseException("余额不足");
        }

        BigDecimal balanceAfter = userWallet.getBalance().subtract(packagePrice).setScale(2, RoundingMode.HALF_UP);
        userWalletMapper.updateBalanceByUserId(userId, balanceAfter);

        LocalDateTime now = LocalDateTime.now();

        PackageOrder packageOrder = new PackageOrder();
        packageOrder.setUserId(userId);
        packageOrder.setPackageId(subscriptionPackage.getId());
        packageOrder.setPrice(packagePrice);
        packageOrder.setOrderStatus(1);
        packageOrder.setPayStatus(1);
        packageOrder.setCreateTime(now);
        packageOrderMapper.insert(packageOrder);

        UserSubscription userSubscription = new UserSubscription();
        userSubscription.setUserId(userId);
        userSubscription.setPackageId(subscriptionPackage.getId());
        userSubscription.setStartTime(now);
        userSubscription.setEndTime(resolveSubscriptionEndTime(now, subscriptionPackage.getType()));
        userSubscription.setStatus(1);
        userSubscription.setCreateTime(now);
        userSubscriptionMapper.insert(userSubscription);

        UserBill userBill = new UserBill();
        userBill.setUserId(userId);
        userBill.setType(4);
        userBill.setAmount(packagePrice.negate());
        userBill.setBalanceAfter(balanceAfter);
        userBill.setOrderId(packageOrder.getId());
        userBill.setRemark(resolvePackageRemark(subscriptionPackage));
        userBill.setCreateTime(now);
        userBillMapper.insert(userBill);
    }

    private String buildVerificationCodeKey(String email) {
        return VERIFICATION_CODE_KEY_PREFIX + email;
    }

    private BigDecimal requirePositiveAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BaseException("金额必须大于0");
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private String resolveBillRemark(UserBillOperateDTO userBillOperateDTO) {
        if (StringUtils.hasText(userBillOperateDTO.getRemark())) {
            return userBillOperateDTO.getRemark().trim();
        }
        return switch (userBillOperateDTO.getType()) {
            case 1 -> "骑行消费";
            case 2 -> "账户充值";
            case 3 -> "退款";
            default -> "账单变动";
        };
    }

    private String resolvePackageRemark(SubscriptionPackage subscriptionPackage) {
        return "购买" + subscriptionPackage.getTitle();
    }

    private LocalDateTime resolveSubscriptionEndTime(LocalDateTime startTime, Integer packageType) {
        if (packageType == null) {
            return startTime.plusMonths(1);
        }
        return switch (packageType) {
            case 1 -> startTime.plusMonths(1);
            case 2 -> startTime.plusMonths(3);
            case 3 -> startTime.plusYears(1);
            default -> startTime.plusMonths(1);
        };
    }

    private UserWalletVO.PackageItem buildPackageItem(UserSubscription userSubscription, LocalDateTime now) {
        SubscriptionPackage subscriptionPackage = subscriptionPackageMapper.getById(userSubscription.getPackageId());
        if (subscriptionPackage == null) {
            return null;
        }

        long restDays = userSubscription.getEndTime() == null
                ? 0
                : Math.max(0, ChronoUnit.DAYS.between(now.toLocalDate(), userSubscription.getEndTime().toLocalDate()));
        return UserWalletVO.PackageItem.builder()
                .id(subscriptionPackage.getId())
                .title(subscriptionPackage.getTitle())
                .description(subscriptionPackage.getDescription())
                .type(subscriptionPackage.getType())
                .expireDate(userSubscription.getEndTime())
                .restDay((int) restDays)
                .build();
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
            throw new BaseException("图片文件名不合法");
        }

        String suffix = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!IMAGE_SUFFIXES.contains(suffix)) {
            throw new BaseException("图片格式不支持");
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
