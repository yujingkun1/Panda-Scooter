package com.panda.mapper;

import com.panda.entity.Dispatcher;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DispatcherMapper {

    int insert(Dispatcher dispatcher);

    Dispatcher getByEmail(@Param("email") String email);

    Dispatcher getById(@Param("id") Long id);

    int updatePasswordById(@Param("id") Long id, @Param("password") String password);

    int deleteById(@Param("id") Long id);
}
