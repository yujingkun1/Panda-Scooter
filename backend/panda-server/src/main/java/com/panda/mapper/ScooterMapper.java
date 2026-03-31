package com.panda.mapper;

import com.panda.entity.Scooter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface ScooterMapper {

    Scooter getByCode(@Param("code") String code);

    Scooter getById(@Param("id") Long id);

    List<Scooter> listNearby(@Param("minLongitude") BigDecimal minLongitude,
                             @Param("maxLongitude") BigDecimal maxLongitude,
                             @Param("minLatitude") BigDecimal minLatitude,
                             @Param("maxLatitude") BigDecimal maxLatitude);

    int updateRideStatus(@Param("id") Long id, @Param("rideStatus") Integer rideStatus);

    int updateStatusAndLocation(@Param("id") Long id,
                                @Param("rideStatus") Integer rideStatus,
                                @Param("faultStatus") Integer faultStatus,
                                @Param("battery") Integer battery,
                                @Param("latitude") BigDecimal latitude,
                                @Param("longitude") BigDecimal longitude);
}
