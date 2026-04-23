package com.panda.service.impl;

import com.panda.context.BaseContext;
import com.panda.dto.DispatcherDeleteDTO;
import com.panda.dto.DispatcherLockScooterDTO;
import com.panda.dto.DispatcherLoginDTO;
import com.panda.dto.DispatcherRegisterDTO;
import com.panda.dto.DispatcherResetPasswordDTO;
import com.panda.dto.DispatcherUnlockScooterDTO;
import com.panda.entity.DispatchRecord;
import com.panda.entity.Dispatcher;
import com.panda.entity.Scooter;
import com.panda.exception.BaseException;
import com.panda.mapper.AreaMapper;
import com.panda.mapper.DispatchRecordMapper;
import com.panda.mapper.DispatcherMapper;
import com.panda.mapper.NoParkingAreaMapper;
import com.panda.mapper.ParkingPointMapper;
import com.panda.mapper.ScooterMapper;
import com.panda.properties.JwtProperties;
import com.panda.service.DispatcherService;
import com.panda.utils.JwtUtil;
import com.panda.vo.DispatchHistoryVO;
import com.panda.vo.DispatcherLoginVO;
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
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DispatcherServiceImpl implements DispatcherService {

    private static final long VERIFICATION_CODE_EXPIRE_MINUTES = 5L;
    private static final String VERIFICATION_CODE_KEY_PREFIX = "panda:verification:dispatcher:";

    private final DispatcherMapper dispatcherMapper;
    private final DispatchRecordMapper dispatchRecordMapper;
    private final ScooterMapper scooterMapper;
    private final AreaMapper areaMapper;
    private final NoParkingAreaMapper noParkingAreaMapper;
    private final ParkingPointMapper parkingPointMapper;
    private final JwtProperties jwtProperties;
    private final JavaMailSender javaMailSender;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    @Transactional
    public void register(DispatcherRegisterDTO dispatcherRegisterDTO) {
        validateVerificationCode(dispatcherRegisterDTO.getEmail(), dispatcherRegisterDTO.getVerificationCode());
        Dispatcher existed = dispatcherMapper.getByEmail(dispatcherRegisterDTO.getEmail());
        if (existed != null) {
            throw new BaseException("邮箱已注册");
        }

        Dispatcher dispatcher = new Dispatcher();
        dispatcher.setName(dispatcherRegisterDTO.getName().trim());
        dispatcher.setEmail(dispatcherRegisterDTO.getEmail());
        dispatcher.setPassword(encrypt(dispatcherRegisterDTO.getPassword()));
        dispatcher.setStatus(0);
        dispatcher.setCreateTime(LocalDateTime.now());
        dispatcherMapper.insert(dispatcher);
        clearVerificationCode(dispatcherRegisterDTO.getEmail());
    }

    @Override
    public DispatcherLoginVO login(DispatcherLoginDTO dispatcherLoginDTO) {
        Dispatcher dispatcher = dispatcherMapper.getByEmail(dispatcherLoginDTO.getEmail());
        if (dispatcher == null) {
            throw new BaseException("调度员不存在");
        }
        if (!dispatcher.getPassword().equals(encrypt(dispatcherLoginDTO.getPassword()))) {
            throw new BaseException("密码错误");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("dispatcherId", dispatcher.getId());
        String token = JwtUtil.createJWT(jwtProperties.getSecretKey(), jwtProperties.getTtl(), claims);
        return DispatcherLoginVO.builder()
                .id(dispatcher.getId())
                .name(dispatcher.getName())
                .email(dispatcher.getEmail())
                .token(token)
                .build();
    }

    @Override
    public void logout() {
        log.info("dispatcher logout, dispatcherId={}", BaseContext.getCurrentId());
    }

    @Override
    @Transactional
    public void delete(DispatcherDeleteDTO dispatcherDeleteDTO) {
        Long dispatcherId = currentDispatcherId();
        Dispatcher dispatcher = dispatcherMapper.getById(dispatcherId);
        if (dispatcher == null) {
            throw new BaseException("调度员不存在");
        }
        validateVerificationCode(dispatcher.getEmail(), dispatcherDeleteDTO.getVerificationCode());
        if (!dispatcher.getPassword().equals(encrypt(dispatcherDeleteDTO.getPassword()))) {
            throw new BaseException("密码错误");
        }
        dispatcherMapper.deleteById(dispatcherId);
        clearVerificationCode(dispatcher.getEmail());
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
        message.setSubject("Panda Scooter 调度端验证码");
        message.setText("您的验证码为：" + code + "，" + VERIFICATION_CODE_EXPIRE_MINUTES + "分钟内有效。");
        javaMailSender.send(message);
        stringRedisTemplate.opsForValue().set(buildVerificationCodeKey(email), code, Duration.ofMinutes(VERIFICATION_CODE_EXPIRE_MINUTES));
        return code;
    }

    @Override
    public void resetPassword(DispatcherResetPasswordDTO dispatcherResetPasswordDTO) {
        Long dispatcherId = currentDispatcherId();
        Dispatcher dispatcher = dispatcherMapper.getById(dispatcherId);
        if (dispatcher == null) {
            throw new BaseException("调度员不存在");
        }
        validateVerificationCode(dispatcher.getEmail(), dispatcherResetPasswordDTO.getVerificationCode());
        dispatcherMapper.updatePasswordById(dispatcherId, encrypt(dispatcherResetPasswordDTO.getNewPassword()));
        clearVerificationCode(dispatcher.getEmail());
    }

    @Override
    public Map<String, Object> info() {
        Long dispatcherId = currentDispatcherId();
        Dispatcher dispatcher = dispatcherMapper.getById(dispatcherId);
        if (dispatcher == null) {
            throw new BaseException("调度员不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("name", dispatcher.getName());
        data.put("email", dispatcher.getEmail());
        data.put("areaName", resolveAreaName(dispatcher.getAreaId()));
        data.put("todayDispatchedNum", String.valueOf(resolveTodayDispatchCount(dispatcherId)));
        return data;
    }

    @Override
    public List<DispatchHistoryVO> dispatchHistory() {
        return dispatchRecordMapper.listHistoryByDispatcherId(currentDispatcherId());
    }

    @Override
    public Map<String, Object> mapData(BigDecimal longitude, BigDecimal latitude, Integer scale) {
        int mapScale = scale == null ? 16 : Math.max(3, Math.min(20, scale));
        int radiusInMeters = resolveRadiusByScale(mapScale);

        BigDecimal latitudeOffset = metersToLatitudeDegrees(radiusInMeters);
        BigDecimal longitudeOffset = metersToLongitudeDegrees(radiusInMeters, latitude);
        BigDecimal minLongitude = longitude.subtract(longitudeOffset);
        BigDecimal maxLongitude = longitude.add(longitudeOffset);
        BigDecimal minLatitude = latitude.subtract(latitudeOffset);
        BigDecimal maxLatitude = latitude.add(latitudeOffset);

        Map<String, Object> data = new HashMap<>();
        data.put("scooters", scooterMapper.listNearby(minLongitude, maxLongitude, minLatitude, maxLatitude).stream()
                .map(item -> {
                    Map<String, Object> scooter = new HashMap<>();
                    scooter.put("id", item.getId());
                    scooter.put("code", item.getCode());
                    scooter.put("rideStatus", item.getRideStatus());
                    scooter.put("faultStatus", item.getFaultStatus());
                    scooter.put("battery", item.getBattery());
                    scooter.put("latitude", item.getLatitude());
                    scooter.put("longitude", item.getLongitude());
                    return scooter;
                }).toList());
        data.put("noParkingAreas", noParkingAreaMapper.listEnabled().stream()
                .map(item -> {
                    Map<String, Object> area = new HashMap<>();
                    area.put("id", item.getId());
                    area.put("polygon", item.getPolygon());
                    area.put("status", item.getStatus());
                    area.put("center", resolvePolygonCenter(item.getPolygon()));
                    return area;
                }).toList());
        data.put("parkingPoints", parkingPointMapper.listEnabled().stream()
                .map(item -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("name", item.getName());
                    point.put("latitude", item.getLatitude());
                    point.put("longitude", item.getLongitude());
                    return point;
                }).toList());
        return data;
    }

    @Override
    @Transactional
    public Map<String, Object> unlockScooter(DispatcherUnlockScooterDTO dispatcherUnlockScooterDTO) {
        Long dispatcherId = currentDispatcherId();
        Scooter scooter = scooterMapper.getByCode(dispatcherUnlockScooterDTO.getCode());
        if (scooter == null) {
            throw new BaseException("车辆不存在");
        }
        if (Integer.valueOf(1).equals(scooter.getRideStatus())) {
            throw new BaseException("车辆使用中");
        }
        if (dispatchRecordMapper.getActiveRecordByScooterId(scooter.getId()) != null) {
            throw new BaseException("车辆调度中");
        }

        scooterMapper.updateStatusAndLocation(
                scooter.getId(),
                1,
                1,
                scooter.getBattery(),
                scooter.getLatitude(),
                scooter.getLongitude()
        );

        DispatchRecord record = new DispatchRecord();
        record.setDispatcherId(dispatcherId);
        record.setScooterId(scooter.getId());
        record.setStatus(0);
        record.setCreateTime(LocalDateTime.now());
        dispatchRecordMapper.insert(record);

        Map<String, Object> data = new HashMap<>();
        data.put("scooterId", scooter.getId());
        return data;
    }

    @Override
    @Transactional
    public void lockScooter(DispatcherLockScooterDTO dispatcherLockScooterDTO) {
        Long dispatcherId = currentDispatcherId();
        Scooter scooter = scooterMapper.getByCode(dispatcherLockScooterDTO.getCode());
        if (scooter == null) {
            throw new BaseException("车辆不存在");
        }

        DispatchRecord record = dispatchRecordMapper.getActiveRecord(dispatcherId, scooter.getId());
        if (record == null) {
            throw new BaseException("未找到进行中的调度记录");
        }

        scooterMapper.updateStatusAndLocation(
                scooter.getId(),
                0,
                0,
                dispatcherLockScooterDTO.getBattery(),
                dispatcherLockScooterDTO.getLatitude(),
                dispatcherLockScooterDTO.getLongitude()
        );
        dispatchRecordMapper.finishRecord(record.getId());
    }

    @Override
    public Object scooterInfo(String code) {
        return scooterMapper.getByCode(code);
    }

    private Long currentDispatcherId() {
        Long dispatcherId = BaseContext.getCurrentId();
        if (dispatcherId == null) {
            throw new BaseException("未登录");
        }
        return dispatcherId;
    }

    private String resolveAreaName(Long areaId) {
        if (areaId == null) {
            return "";
        }
        var area = areaMapper.getById(areaId);
        return area == null ? "" : area.getName();
    }

    private Integer resolveTodayDispatchCount(Long dispatcherId) {
        Integer count = dispatchRecordMapper.countByDispatcherAndDate(dispatcherId, LocalDate.now());
        return count == null ? 0 : count;
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

    private String buildVerificationCode() {
        int code = (int) ((Math.random() * 9 + 1) * 100000);
        return String.valueOf(code);
    }

    private String encrypt(String value) {
        return DigestUtils.md5DigestAsHex(value.getBytes(StandardCharsets.UTF_8));
    }

    private int resolveRadiusByScale(int scale) {
        if (scale >= 20) {
            return 50;
        }
        if (scale >= 18) {
            return 100;
        }
        if (scale >= 16) {
            return 200;
        }
        if (scale >= 14) {
            return 500;
        }
        if (scale >= 12) {
            return 1000;
        }
        return 0;
    }

    private BigDecimal metersToLatitudeDegrees(int meters) {
        if (meters <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(meters)
                .divide(new BigDecimal("111320"), 10, RoundingMode.HALF_UP);
    }

    private BigDecimal metersToLongitudeDegrees(int meters, BigDecimal latitude) {
        if (meters <= 0) {
            return BigDecimal.ZERO;
        }

        double latitudeRadians = Math.toRadians(latitude.doubleValue());
        double metersPerDegree = 111320D * Math.cos(latitudeRadians);
        if (Math.abs(metersPerDegree) < 1e-6) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(meters)
                .divide(BigDecimal.valueOf(metersPerDegree), 10, RoundingMode.HALF_UP);
    }

    private String resolvePolygonCenter(String polygon) {
        if (polygon == null || polygon.isBlank()) {
            return null;
        }

        String normalized = polygon.replace("[", "").replace("]", "").trim();
        if (normalized.isEmpty()) {
            return null;
        }

        String[] values = normalized.split(",");
        if (values.length < 2) {
            return null;
        }

        BigDecimal latitudeSum = BigDecimal.ZERO;
        BigDecimal longitudeSum = BigDecimal.ZERO;
        int pointCount = 0;
        for (int i = 0; i + 1 < values.length; i += 2) {
            try {
                latitudeSum = latitudeSum.add(new BigDecimal(values[i].trim()));
                longitudeSum = longitudeSum.add(new BigDecimal(values[i + 1].trim()));
                pointCount++;
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        if (pointCount == 0) {
            return null;
        }

        BigDecimal centerLatitude = latitudeSum.divide(BigDecimal.valueOf(pointCount), 6, RoundingMode.HALF_UP);
        BigDecimal centerLongitude = longitudeSum.divide(BigDecimal.valueOf(pointCount), 6, RoundingMode.HALF_UP);
        return centerLatitude.toPlainString() + "," + centerLongitude.toPlainString();
    }
}
