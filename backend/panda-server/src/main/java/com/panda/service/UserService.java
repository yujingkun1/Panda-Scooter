package com.panda.service;

import com.panda.dto.UserBillOperateDTO;
import com.panda.dto.UserDeleteDTO;
import com.panda.dto.UserLoginDTO;
import com.panda.dto.UserRegisterDTO;
import com.panda.dto.UserResetPasswordDTO;
import com.panda.vo.UserBillVO;
import com.panda.vo.UserLoginVO;
import com.panda.vo.UserWalletVO;

import java.util.List;

public interface UserService {

    void register(UserRegisterDTO userRegisterDTO);

    UserLoginVO login(UserLoginDTO userLoginDTO);

    void logout();

    void delete(UserDeleteDTO userDeleteDTO);

    String sendVerificationCode(String email);

    void resetPassword(UserResetPasswordDTO userResetPasswordDTO);

    UserWalletVO getWallet();

    void operateBill(UserBillOperateDTO userBillOperateDTO);

    List<UserBillVO> listBills();
}
