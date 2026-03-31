package com.panda.mapper;

import com.panda.entity.UserWallet;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserWalletMapper {

    UserWallet getByUserId(@Param("userId") Long userId);

    int insert(UserWallet userWallet);

    int updateBalanceByUserId(@Param("userId") Long userId, @Param("balance") java.math.BigDecimal balance);
}
