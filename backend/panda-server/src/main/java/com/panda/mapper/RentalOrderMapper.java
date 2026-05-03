package com.panda.mapper;

import com.panda.entity.RentalOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface RentalOrderMapper {

    int insert(RentalOrder rentalOrder);

    RentalOrder getById(@Param("id") Long id);

    RentalOrder getRidingOrderByUserId(@Param("userId") Long userId);

    RentalOrder getRidingOrderByScooterId(@Param("scooterId") Long scooterId);

    RentalOrder getUnpaidOrderByUserId(@Param("userId") Long userId);

    int updateFinishInfo(RentalOrder rentalOrder);

    List<RentalOrder> listByUserId(@Param("userId") Long userId);

    Long sumTotalTimeByUserId(@Param("userId") Long userId);

    java.math.BigDecimal sumTotalKilometerByUserId(@Param("userId") Long userId);

    /**
     * 统计日期范围内的订单总数
     */
    @Select("SELECT COUNT(*) FROM rental_order WHERE DATE(create_time) BETWEEN #{startDate} AND #{endDate}")
    Integer countByDateRange(@Param("startDate") LocalDate startDate,
                             @Param("endDate") LocalDate endDate,
                             @Param("areaId") Integer areaId);

    /**
     * 统计日期范围内已完成的订单数
     */
    @Select("SELECT COUNT(*) FROM rental_order WHERE order_status = 1 AND DATE(create_time) BETWEEN #{startDate} AND #{endDate}")
    Integer countCompletedByDateRange(@Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate,
                                      @Param("areaId") Integer areaId);

    /**
     * 统计日期范围内已取消的订单数
     */
    @Select("SELECT COUNT(*) FROM rental_order WHERE order_status = 2 AND DATE(create_time) BETWEEN #{startDate} AND #{endDate}")
    Integer countCancelledByDateRange(@Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate,
                                      @Param("areaId") Integer areaId);

    /**
     * 统计进行中的订单数
     */
    @Select("SELECT COUNT(*) FROM rental_order WHERE order_status = 0")
    Integer countOngoing();

    /**
     * 统计日期范围内的活跃用户数
     */
    @Select("SELECT COUNT(DISTINCT user_id) FROM rental_order WHERE DATE(create_time) BETWEEN #{startDate} AND #{endDate}")
    Integer countActiveUsersByDateRange(@Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);

    /**
     * 获取趋势数据（按日/周/月分组）
     */
    @Select("SELECT DATE(create_time) as date, COUNT(*) as order_count, SUM(amount) as revenue " +
            "FROM rental_order WHERE DATE(create_time) BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY DATE(create_time) ORDER BY date")
    List<Map<String, Object>> getTrendData(@Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate,
                                           @Param("granularity") String granularity,
                                           @Param("areaId") Integer areaId);

}
