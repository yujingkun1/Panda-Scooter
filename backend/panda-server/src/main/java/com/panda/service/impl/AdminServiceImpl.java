package com.panda.service.impl;

import com.panda.context.BaseContext;
import com.panda.dto.AdminLoginDTO;
import com.panda.dto.DataOverviewDTO;
import com.panda.dto.LiveDataDTO;
import com.panda.entity.Admin;
import com.panda.exception.BaseException;
import com.panda.mapper.*;
import com.panda.properties.JwtProperties;
import com.panda.service.AdminService;
import com.panda.vo.AdminLoginVO;
import com.panda.utils.JwtUtil;
import com.panda.vo.DataOverviewVO;
import com.panda.vo.LiveDataVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminMapper adminMapper;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private RentalOrderMapper rentalOrderMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ScooterMapper scooterMapper;

    @Autowired
    private UserBillMapper userBillMapper;

    @Override
    public AdminLoginVO login(AdminLoginDTO adminLoginDTO) {
        // 1. 查询管理员
        Admin admin = adminMapper.getByEmail(adminLoginDTO.getEmail());
        if (admin == null) {
            throw new BaseException("账号不存在");
        }

        // 2. 校验密码
        if (!admin.getPassword().equals(encrypt(adminLoginDTO.getPassword()))) {
            throw new BaseException("密码错误");
        }

        // 3. 生成 token
        Map<String, Object> claims = new HashMap<>();
        claims.put("adminId", admin.getId());
        String token = JwtUtil.createJWT(jwtProperties.getSecretKey(), jwtProperties.getTtl(), claims);

        // 4. 返回 VO
        return AdminLoginVO.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .email(admin.getEmail())
                .token(token)
                .build();
    }

    @Override
    public void logout() {
        Long adminId = BaseContext.getCurrentId();
        if (adminId == null) {
            throw new BaseException("未登录");
        }
        log.info("管理员登出，adminId: {}", adminId);

        BaseContext.removeCurrentId();
    }

    @Override
    public DataOverviewVO getOverview(DataOverviewDTO overviewDTO) {
        // 设置默认日期范围（最近30天）
        if (overviewDTO.getStartDate() == null) {
            overviewDTO.setStartDate(LocalDate.now().minusDays(30));
        }
        if (overviewDTO.getEndDate() == null) {
            overviewDTO.setEndDate(LocalDate.now());
        }

        // 1. 订单统计
        DataOverviewVO.OrderStatVO orderStat = getOrderStat(overviewDTO);

        // 2. 收入统计
        DataOverviewVO.RevenueStatVO revenueStat = getRevenueStat(overviewDTO);

        // 3. 用户统计
        DataOverviewVO.UserStatVO userStat = getUserStat(overviewDTO);

        // 4. 车辆统计
        DataOverviewVO.ScooterStatVO scooterStat = getScooterStat();

        // 5. 趋势数据
        List<DataOverviewVO.TrendDataVO> trendData = getTrendData(overviewDTO);

        return DataOverviewVO.builder()
                .orderStat(orderStat)
                .revenueStat(revenueStat)
                .userStat(userStat)
                .scooterStat(scooterStat)
                .trendData(trendData)
                .build();
    }

    @Override
    public LiveDataVO getLiveData(LiveDataDTO liveDataDTO) {
        // 设置默认日期为今天
        LocalDate targetDate = liveDataDTO.getDate();
        if (targetDate == null) {
            targetDate = LocalDate.now();
        }

        Integer areaId = liveDataDTO.getAreaId();

        // 1. 今日订单数
        Integer todayOrders = rentalOrderMapper.countByDateRange(targetDate, targetDate, areaId);

        // 2. 今日总收入
        BigDecimal todayRevenue = userBillMapper.sumAmountByDate(targetDate, areaId);

        // 3. 在线车辆数量（可用车辆，fault_status = 0）
        Integer onlineScooters = scooterMapper.countByStatus(0);

        // 4. 故障车辆数量（fault_status = 2）
        Integer faultScooters = scooterMapper.countByStatus(2);

        return LiveDataVO.builder()
                .updatedAt(java.time.LocalDateTime.now())
                .todayOrders(todayOrders != null ? todayOrders : 0)
                .todayRevenue(todayRevenue != null ? todayRevenue.toString() : "0")
                .onlineScooters(onlineScooters != null ? onlineScooters : 0)
                .faultScooters(faultScooters != null ? faultScooters : 0)
                .areaId(areaId)
                .build();
    }
    /**
     * 获取订单统计
     */
    private DataOverviewVO.OrderStatVO getOrderStat(DataOverviewDTO dto) {
        Integer totalOrders = rentalOrderMapper.countByDateRange(dto.getStartDate(), dto.getEndDate(), dto.getAreaId());
        Integer completedOrders = rentalOrderMapper.countCompletedByDateRange(dto.getStartDate(), dto.getEndDate(), dto.getAreaId());
        Integer cancelledOrders = rentalOrderMapper.countCancelledByDateRange(dto.getStartDate(), dto.getEndDate(), dto.getAreaId());
        Integer ongoingOrders = rentalOrderMapper.countOngoing();

        return DataOverviewVO.OrderStatVO.builder()
                .totalOrders(totalOrders != null ? totalOrders : 0)
                .completedOrders(completedOrders != null ? completedOrders : 0)
                .cancelledOrders(cancelledOrders != null ? cancelledOrders : 0)
                .ongoingOrders(ongoingOrders != null ? ongoingOrders : 0)
                .build();
    }

    /**
     * 获取收入统计
     */
    private DataOverviewVO.RevenueStatVO getRevenueStat(DataOverviewDTO dto) {
        BigDecimal totalRevenue = userBillMapper.sumAmountByDateRange(dto.getStartDate(), dto.getEndDate(), dto.getAreaId());
        Integer orderCount = rentalOrderMapper.countCompletedByDateRange(dto.getStartDate(), dto.getEndDate(), dto.getAreaId());
        BigDecimal avgOrderAmount = BigDecimal.ZERO;
        if (orderCount != null && orderCount > 0 && totalRevenue != null) {
            avgOrderAmount = totalRevenue.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP);
        }
        BigDecimal todayRevenue = userBillMapper.sumAmountByDate(LocalDate.now(), dto.getAreaId());

        return DataOverviewVO.RevenueStatVO.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .avgOrderAmount(avgOrderAmount)
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .build();
    }

    /**
     * 获取用户统计
     */
    private DataOverviewVO.UserStatVO getUserStat(DataOverviewDTO dto) {
        Integer totalUsers = userMapper.countTotal();
        Integer newUsers = userMapper.countByDateRange(dto.getStartDate(), dto.getEndDate());
        Integer activeUsers = rentalOrderMapper.countActiveUsersByDateRange(dto.getStartDate(), dto.getEndDate());

        return DataOverviewVO.UserStatVO.builder()
                .totalUsers(totalUsers != null ? totalUsers : 0)
                .newUsers(newUsers != null ? newUsers : 0)
                .activeUsers(activeUsers != null ? activeUsers : 0)
                .build();
    }

    /**
     * 获取车辆统计
     */
    private DataOverviewVO.ScooterStatVO getScooterStat() {
        Integer totalScooters = scooterMapper.countTotal();
        Integer availableScooters = scooterMapper.countByStatus(0);  // 0-空闲
        Integer inUseScooters = scooterMapper.countByStatus(1);      // 1-使用中
        Integer faultScooters = scooterMapper.countByStatus(2);      // 2-故障

        return DataOverviewVO.ScooterStatVO.builder()
                .totalScooters(totalScooters != null ? totalScooters : 0)
                .availableScooters(availableScooters != null ? availableScooters : 0)
                .inUseScooters(inUseScooters != null ? inUseScooters : 0)
                .faultScooters(faultScooters != null ? faultScooters : 0)
                .build();
    }

    /**
     * 获取趋势数据
     */
    private List<DataOverviewVO.TrendDataVO> getTrendData(DataOverviewDTO dto) {
        List<Map<String, Object>> results = rentalOrderMapper.getTrendData(
                dto.getStartDate(), dto.getEndDate(), dto.getGranularity(), dto.getAreaId()
        );

        List<DataOverviewVO.TrendDataVO> trendData = new ArrayList<>();
        if (results != null) {
            for (Map<String, Object> row : results) {
                trendData.add(DataOverviewVO.TrendDataVO.builder()
                        .date(row.get("date").toString())
                        .orderCount(((Number) row.get("order_count")).intValue())
                        .revenue((BigDecimal) row.get("revenue"))
                        .build());
            }
        }
        return trendData;
    }

    private String encrypt(String value) {
        return DigestUtils.md5DigestAsHex(value.getBytes(StandardCharsets.UTF_8));
    }
}