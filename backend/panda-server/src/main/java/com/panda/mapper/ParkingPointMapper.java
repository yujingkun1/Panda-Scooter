package com.panda.mapper;

import com.panda.entity.ParkingPoint;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ParkingPointMapper {

    List<ParkingPoint> listEnabled();
}
