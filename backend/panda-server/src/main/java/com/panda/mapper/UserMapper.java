package com.panda.mapper;

import com.panda.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;

@Mapper
public interface UserMapper {

    User getById(@Param("id") Long id);

    User getByEmail(@Param("email") String email);

    int insert(User user);

    int updatePasswordById(@Param("id") Long id, @Param("password") String password);

    int deleteById(@Param("id") Long id);

    /**
     * 统计用户总数
     */
    @Select("SELECT COUNT(*) FROM user")
    Integer countTotal();

    /**
     * 统计指定日期范围内新增用户数
     */
    @Select("SELECT COUNT(*) FROM user WHERE DATE(create_time) BETWEEN #{startDate} AND #{endDate}")
    Integer countByDateRange(@Param("startDate") LocalDate startDate,
                             @Param("endDate") LocalDate endDate);
}
