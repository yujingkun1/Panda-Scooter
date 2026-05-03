package com.panda.mapper;

import com.panda.entity.UserBill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface UserBillMapper {

    int insert(UserBill userBill);

    List<UserBill> listByUserId(@Param("userId") Long userId);

    /**
     * 统计日期范围内的收入总额
     */
    @Select("SELECT SUM(amount) FROM user_bill WHERE type = 1 AND DATE(create_time) BETWEEN #{startDate} AND #{endDate}")
    BigDecimal sumAmountByDateRange(@Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate,
                                    @Param("areaId") Integer areaId);

    /**
     * 统计某天的收入总额
     */
    @Select("SELECT SUM(amount) FROM user_bill WHERE type = 1 AND DATE(create_time) = #{date}")
    BigDecimal sumAmountByDate(@Param("date") LocalDate date,
                               @Param("areaId") Integer areaId);
}
