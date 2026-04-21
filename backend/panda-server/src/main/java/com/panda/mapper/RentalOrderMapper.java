package com.panda.mapper;

import com.panda.entity.RentalOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

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
}
