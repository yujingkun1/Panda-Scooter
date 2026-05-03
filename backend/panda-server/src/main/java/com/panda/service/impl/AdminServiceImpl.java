package com.panda.service.impl;

import com.panda.context.BaseContext;
import com.panda.dto.AdminLoginDTO;
import com.panda.dto.DataOverviewDTO;
import com.panda.dto.LiveDataDTO;
import com.panda.dto.PricingRuleEditDTO;
import com.panda.entity.Admin;
import com.panda.entity.PricingRule;
import com.panda.exception.BaseException;
import com.panda.mapper.*;
import com.panda.properties.JwtProperties;
import com.panda.service.AdminService;
import com.panda.vo.AdminLoginVO;
import com.panda.utils.JwtUtil;
import com.panda.vo.DataOverviewVO;
import com.panda.vo.LiveDataVO;
import com.panda.vo.PricingRuleVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.math.BigDecimal;
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

    @Autowired
    private PricingRuleMapper pricingRuleMapper;

    @Override
    public AdminLoginVO login(AdminLoginDTO adminLoginDTO) {
        Admin admin = adminMapper.getByEmail(adminLoginDTO.getEmail());
        if (admin == null) {
            throw new BaseException("账号不存在");
        }
        if (!admin.getPassword().equals(encrypt(adminLoginDTO.getPassword()))) {
            throw new BaseException("密码错误");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("adminId", admin.getId());
        String token = JwtUtil.createJWT(jwtProperties.getSecretKey(), jwtProperties.getTtl(), claims);

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
        if (overviewDTO.getStartDate() == null) {
            overviewDTO.setStartDate(LocalDate.now().minusDays(30));
        }
        if (overviewDTO.getEndDate() == null) {
            overviewDTO.setEndDate(LocalDate.now());
        }

        List<Map<String, Object>> trendResults = rentalOrderMapper.getTrendData(
                overviewDTO.getStartDate(),
                overviewDTO.getEndDate(),
                overviewDTO.getGranularity(),
                overviewDTO.getAreaId()
        );

        List<DataOverviewVO.SeriesItem> series = new ArrayList<>();
        if (trendResults != null) {
            for (Map<String, Object> row : trendResults) {
                series.add(DataOverviewVO.SeriesItem.builder()
                        .time(row.get("date").toString())
                        .orderCount(String.valueOf(((Number) row.get("order_count")).intValue()))
                        .revenue(row.get("revenue") != null ? row.get("revenue").toString() : "0")
                        .build());
            }
        }

        return DataOverviewVO.builder()
                .startDate(overviewDTO.getStartDate().toString())
                .endDate(overviewDTO.getEndDate().toString())
                .granularity(overviewDTO.getGranularity() != null ? overviewDTO.getGranularity() : "day")
                .areaID(overviewDTO.getAreaId() != null ? overviewDTO.getAreaId().toString() : null)
                .series(series)
                .build();
    }

    @Override
    public LiveDataVO getLiveData(LiveDataDTO liveDataDTO) {
        LocalDate targetDate = liveDataDTO.getDate();
        if (targetDate == null) {
            targetDate = LocalDate.now();
        }

        Integer areaId = liveDataDTO.getAreaId();

        Integer todayOrders = rentalOrderMapper.countByDateRange(targetDate, targetDate, areaId);
        BigDecimal todayRevenue = userBillMapper.sumAmountByDate(targetDate, areaId);
        Integer onlineScooters = scooterMapper.countByStatus(0);
        Integer faultScooters = scooterMapper.countByStatus(2);

        return LiveDataVO.builder()
                .updatedAt(java.time.LocalDateTime.now())
                .todayOrders(todayOrders != null ? todayOrders.toString() : "0")
                .todayRevenue(todayRevenue != null ? todayRevenue.toString() : "0")
                .onlineScooters(onlineScooters != null ? onlineScooters.toString() : "0")
                .faultScooters(faultScooters != null ? faultScooters.toString() : "0")
                .areaId(areaId != null ? areaId.toString() : null)
                .build();
    }

    @Override
    public PricingRuleVO getPricingRules() {
        List<PricingRule> rules = pricingRuleMapper.getAllRules();
        if (rules == null || rules.isEmpty()) {
            return PricingRuleVO.builder().build();
        }
        PricingRule rule = rules.get(0);
        return PricingRuleVO.builder()
                .id(rule.getId())
                .pricePerMin(rule.getPricePerMin())
                .basePrice(rule.getBasePrice())
                .billingInterval(rule.getBillingInterval())
                .build();
    }

    @Override
    public void editRules(PricingRuleEditDTO editDTO) {
        if (editDTO.getPricePerMin() == null && editDTO.getBasePrice() == null
                && editDTO.getBillingInterval() == null) {
            throw new BaseException("没有需要修改的数据");
        }
        int rows = pricingRuleMapper.updateRule(editDTO);
        if (rows == 0) {
            pricingRuleMapper.insertRule(editDTO);
        }
    }

    private String encrypt(String value) {
        return DigestUtils.md5DigestAsHex(value.getBytes(StandardCharsets.UTF_8));
    }
}