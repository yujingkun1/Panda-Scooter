package com.panda.mapper;

import com.panda.entity.Area;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AreaMapper {

    Area getById(@Param("id") Long id);

    List<Area> listAll();
}
