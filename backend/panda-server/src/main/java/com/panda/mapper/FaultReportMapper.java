package com.panda.mapper;

import com.panda.entity.FaultReport;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FaultReportMapper {

    int insert(FaultReport faultReport);

    List<FaultReport> listByUserId(@Param("userId") Long userId);
}
