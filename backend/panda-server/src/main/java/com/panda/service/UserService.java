package com.panda.service;

import com.panda.dto.UserBillOperateDTO;
import com.panda.dto.UserDeleteDTO;
import com.panda.dto.UserLoginDTO;
import com.panda.dto.UserRegisterDTO;
import com.panda.dto.UserResetPasswordDTO;
import com.panda.vo.UserBillVO;
import com.panda.vo.UserFaultVO;
import com.panda.vo.UserLoginVO;
import com.panda.vo.UserWalletVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

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

    List<UserFaultVO> listFaults();

    Map<String, Object> reportFault(Long scooterId, String description, MultipartFile image);

    Map<String, Object> listSubscriptions();
}
