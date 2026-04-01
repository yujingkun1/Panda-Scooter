package com.panda.mapper;

import com.panda.entity.SubscriptionPackage;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SubscriptionPackageMapper {

    List<SubscriptionPackage> listAll();

    SubscriptionPackage getById(Long id);
}
