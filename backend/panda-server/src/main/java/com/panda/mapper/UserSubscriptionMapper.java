package com.panda.mapper;

import com.panda.entity.UserSubscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface UserSubscriptionMapper {

    int insert(UserSubscription userSubscription);

    int expireByUserIdAndEndTimeBefore(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    List<UserSubscription> listActiveByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
