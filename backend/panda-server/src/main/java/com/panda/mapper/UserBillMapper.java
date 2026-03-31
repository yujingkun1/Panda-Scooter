package com.panda.mapper;

import com.panda.entity.UserBill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserBillMapper {

    int insert(UserBill userBill);

    List<UserBill> listByUserId(@Param("userId") Long userId);
}
