package com.panda.mapper;

import com.panda.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {

    User getById(@Param("id") Long id);

    User getByEmail(@Param("email") String email);

    int insert(User user);

    int updatePasswordById(@Param("id") Long id, @Param("password") String password);

    int deleteById(@Param("id") Long id);
}
