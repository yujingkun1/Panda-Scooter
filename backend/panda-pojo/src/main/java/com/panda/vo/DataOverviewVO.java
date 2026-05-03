package com.panda.vo;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DataOverviewVO {

    // 订单统计
    private OrderStatVO orderStat;

    // 收入统计
    private RevenueStatVO revenueStat;

    // 用户统计
    private UserStatVO userStat;

    // 车辆统计
    private ScooterStatVO scooterStat;

    // 趋势数据（用于图表）
    private List<TrendDataVO> trendData;

    @Data
    @Builder
    public static class OrderStatVO {
        private Integer totalOrders;      // 总订单数
        private Integer completedOrders;  // 完成订单数
        private Integer cancelledOrders;  // 取消订单数
        private Integer ongoingOrders;    // 进行中订单数
    }

    @Data
    @Builder
    public static class RevenueStatVO {
        private BigDecimal totalRevenue;   // 总收入
        private BigDecimal avgOrderAmount; // 平均订单金额
        private BigDecimal todayRevenue;   // 今日收入
    }

    @Data
    @Builder
    public static class UserStatVO {
        private Integer totalUsers;        // 总用户数
        private Integer newUsers;          // 新增用户数
        private Integer activeUsers;       // 活跃用户数
    }

    @Data
    @Builder
    public static class ScooterStatVO {
        private Integer totalScooters;
        private Integer availableScooters;
        private Integer inUseScooters;
        private Integer faultScooters;
    }

    @Data
    @Builder
    public static class TrendDataVO {
        private String date;
        private Integer orderCount;
        private BigDecimal revenue;
    }
}