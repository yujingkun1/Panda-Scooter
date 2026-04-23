package com.panda.mapper;

import com.panda.entity.PackageOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PackageOrderMapper {

    int insert(PackageOrder packageOrder);
}
