package com.panda.mapper;

import com.panda.entity.NoParkingArea;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface NoParkingAreaMapper {

    List<NoParkingArea> listEnabled();
}
