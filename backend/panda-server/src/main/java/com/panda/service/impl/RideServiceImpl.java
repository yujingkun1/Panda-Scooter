package com.panda.service.impl;

import com.panda.context.BaseContext;
import com.panda.dto.LockScooterDTO;
import com.panda.entity.RentalOrder;
import com.panda.entity.Scooter;
import com.panda.entity.UserBill;
import com.panda.entity.UserWallet;
import com.panda.exception.BaseException;
import com.panda.mapper.RentalOrderMapper;
import com.panda.mapper.ScooterMapper;
import com.panda.mapper.UserBillMapper;
import com.panda.mapper.UserMapper;
import com.panda.mapper.UserWalletMapper;
import com.panda.service.RideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RideServiceImpl implements RideService {

    private final ScooterMapper scooterMapper;
    private final RentalOrderMapper rentalOrderMapper;
    private final UserMapper userMapper;
    private final UserWalletMapper userWalletMapper;
    private final UserBillMapper userBillMapper;

    @Override
    @Transactional
    public Map<String, Object> unlockScooter(String code) {
        Long userId = currentUserId();
        log.info("开始解锁单车，userId={}, code={}", userId, code);
        RentalOrder unpaidOrder = rentalOrderMapper.getUnpaidOrderByUserId(userId);
        if (unpaidOrder != null) {
            log.warn("解锁失败，存在未支付订单，userId={}, orderId={}", userId, unpaidOrder.getId());
            throw new BaseException("存在未支付订单，请先完成支付");
        }
        RentalOrder ridingOrder = rentalOrderMapper.getRidingOrderByUserId(userId);
        if (ridingOrder != null) {
            log.warn("解锁失败，存在进行中订单，userId={}, orderId={}", userId, ridingOrder.getId());
            throw new BaseException("已有进行中的订单");
        }

        Scooter scooter = scooterMapper.getByCode(code);
        if (scooter == null) {
            log.warn("解锁失败，车辆不存在，code={}", code);
            throw new BaseException("车辆不存在");
        }
        if (Integer.valueOf(1).equals(scooter.getFaultStatus())) {
            log.warn("解锁失败，车辆故障中，code={}, scooterId={}", code, scooter.getId());
            throw new BaseException("车辆故障中");
        }
        if (Integer.valueOf(1).equals(scooter.getRideStatus())) {
            log.warn("解锁失败，车辆使用中，code={}, scooterId={}", code, scooter.getId());
            throw new BaseException("车辆使用中");
        }

        RentalOrder rentalOrder = new RentalOrder();
        rentalOrder.setUserId(userId);
        rentalOrder.setScooterId(scooter.getId());
        rentalOrder.setStartTime(LocalDateTime.now());
        rentalOrder.setTotalTime(0);
        rentalOrder.setOrderStatus(0);
        rentalOrder.setPayStatus(0);
        rentalOrder.setAmount(BigDecimal.ZERO);
        rentalOrder.setTotalKilometer(BigDecimal.ZERO);
        rentalOrder.setCreateTime(LocalDateTime.now());
        rentalOrderMapper.insert(rentalOrder);

        scooterMapper.updateRideStatus(scooter.getId(), 1);
        log.info("解锁成功，userId={}, scooterId={}, orderId={}", userId, scooter.getId(), rentalOrder.getId());

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", rentalOrder.getId());
        data.put("scooterId", scooter.getId());
        return data;
    }

    @Override
    @Transactional
    public Map<String, Object> lockScooter(LockScooterDTO lockScooterDTO) {
        Long userId = currentUserId();
        log.info("开始结束骑行，userId={}, orderId={}", userId, lockScooterDTO.getOrderId());
        RentalOrder rentalOrder = rentalOrderMapper.getById(lockScooterDTO.getOrderId());
        if (rentalOrder == null || !userId.equals(rentalOrder.getUserId())) {
            log.warn("结束骑行失败，订单不存在，userId={}, orderId={}", userId, lockScooterDTO.getOrderId());
            throw new BaseException("订单不存在");
        }
        if (!Integer.valueOf(0).equals(rentalOrder.getOrderStatus())) {
            log.warn("结束骑行失败，订单已结束，orderId={}", rentalOrder.getId());
            throw new BaseException("订单已结束");
        }

        LocalDateTime startTime = lockScooterDTO.getStartTime() == null ? rentalOrder.getStartTime() : lockScooterDTO.getStartTime();
        LocalDateTime endTime = lockScooterDTO.getEndTime() == null ? LocalDateTime.now() : lockScooterDTO.getEndTime();
        long seconds = Duration.between(startTime, endTime).getSeconds();
        int totalMinutes = (int) Math.max(1, Math.ceil(Math.max(0, seconds) / 60.0));
        BigDecimal amount = lockScooterDTO.getAmount() == null
                ? BigDecimal.valueOf(totalMinutes).multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP)
                : lockScooterDTO.getAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalKilometer = lockScooterDTO.getTotalKilometer() == null ? BigDecimal.ZERO : lockScooterDTO.getTotalKilometer();

        UserWallet userWallet = userWalletMapper.getByUserId(userId);
        if (userWallet == null) {
            log.warn("结束骑行失败，钱包不存在，userId={}", userId);
            throw new BaseException("钱包不存在");
        }

        boolean paid = userWallet.getBalance().compareTo(amount) >= 0;
        BigDecimal balanceAfter = userWallet.getBalance();
        if (paid) {
            balanceAfter = userWallet.getBalance().subtract(amount).setScale(2, RoundingMode.HALF_UP);
            userWalletMapper.updateBalanceByUserId(userId, balanceAfter);
            saveRideBill(userId, rentalOrder.getId(), amount.negate(), balanceAfter);
        }

        rentalOrder.setStartTime(startTime);
        rentalOrder.setEndTime(endTime);
        rentalOrder.setTotalTime(totalMinutes);
        rentalOrder.setOrderStatus(paid ? 2 : 1);
        rentalOrder.setPayStatus(paid ? 1 : 0);
        rentalOrder.setAmount(amount);
        rentalOrder.setTotalKilometer(totalKilometer);
        rentalOrderMapper.updateFinishInfo(rentalOrder);

        Scooter scooter = scooterMapper.getByCode(lockScooterDTO.getCode());
        if (scooter != null) {
            scooterMapper.updateStatusAndLocation(
                    scooter.getId(),
                    0,
                    scooter.getFaultStatus(),
                    lockScooterDTO.getBattery() == null ? scooter.getBattery() : lockScooterDTO.getBattery(),
                    lockScooterDTO.getLatitude() == null ? scooter.getLatitude() : lockScooterDTO.getLatitude(),
                    lockScooterDTO.getLongitude() == null ? scooter.getLongitude() : lockScooterDTO.getLongitude()
            );
        }
        log.info("结束骑行成功，orderId={}, totalMinutes={}, amount={}, totalKilometer={}, paid={}", rentalOrder.getId(), totalMinutes, amount, totalKilometer, paid);

        Map<String, Object> data = new HashMap<>();
        data.put("id", rentalOrder.getId());
        data.put("startTime", startTime);
        data.put("payStatus", rentalOrder.getPayStatus());
        data.put("amount", rentalOrder.getAmount());
        data.put("totalTime", totalMinutes + "分钟");
        data.put("totalKilometer", rentalOrder.getTotalKilometer());
        data.put("balanceAfter", balanceAfter);
        data.put("message", paid ? "扣费成功" : "余额不足，订单待支付");
        return data;
    }

    @Override
    public Object getScooterByCode(String code) {
        log.info("扫码查询单车，code={}", code);
        return scooterMapper.getByCode(code);
    }

    @Override
    public Map<String, Object> rideHistory() {
        Long userId = currentUserId();
        log.info("查询骑行历史，userId={}", userId);
        List<RentalOrder> history = rentalOrderMapper.listByUserId(userId);
        Map<String, Object> data = new HashMap<>();
        data.put("history", history);
        return data;
    }

    @Override
    public Map<String, Object> userInfo() {
        Long userId = currentUserId();
        log.info("查询用户骑行信息，userId={}", userId);
        var user = userMapper.getById(userId);
        Long totalTime = rentalOrderMapper.sumTotalTimeByUserId(userId);
        BigDecimal totalKilometer = rentalOrderMapper.sumTotalKilometerByUserId(userId);
        Map<String, Object> data = new HashMap<>();
        data.put("username", user.getUsername());
        data.put("email", user.getEmail());
        data.put("totalKilometer", totalKilometer == null ? "0" : totalKilometer.toPlainString());
        data.put("totalTime", String.valueOf(totalTime == null ? 0 : totalTime));
        return data;
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

        log.info("地图查车，longitude={}, latitude={}, scale={}, radiusInMeters={}, minLongitude={}, maxLongitude={}, minLatitude={}, maxLatitude={}",
                longitude, latitude, mapScale, radiusInMeters, minLongitude, maxLongitude, minLatitude, maxLatitude);

        Map<String, Object> data = new HashMap<>();
        data.put("scooters", scooterMapper.listNearby(minLongitude, maxLongitude, minLatitude, maxLatitude));
        data.put("noParkingAreas", List.of());
        data.put("parkingPoints", List.of());
        return data;
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

    private void saveRideBill(Long userId, Long orderId, BigDecimal amount, BigDecimal balanceAfter) {
        UserBill userBill = new UserBill();
        userBill.setUserId(userId);
        userBill.setType(1);
        userBill.setAmount(amount);
        userBill.setBalanceAfter(balanceAfter);
        userBill.setOrderId(orderId);
        userBill.setRemark("骑行消费");
        userBill.setCreateTime(LocalDateTime.now());
        userBillMapper.insert(userBill);
    }

    private Long currentUserId() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            log.warn("获取当前用户失败，未登录");
            throw new BaseException("未登录");
        }
        return userId;
    }
}
