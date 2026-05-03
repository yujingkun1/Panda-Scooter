package com.panda.mapper;

import com.panda.entity.Admin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AdminMapper {
    @Select("SELECT * FROM admin WHERE email = #{email}")
    Admin getByEmail(String email);
}
