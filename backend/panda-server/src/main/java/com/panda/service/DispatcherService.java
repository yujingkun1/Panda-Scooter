package com.panda.service;

import com.panda.dto.DispatcherDeleteDTO;
import com.panda.dto.DispatcherLockScooterDTO;
import com.panda.dto.DispatcherLoginDTO;
import com.panda.dto.DispatcherRegisterDTO;
import com.panda.dto.DispatcherResetPasswordDTO;
import com.panda.dto.DispatcherUnlockScooterDTO;
import com.panda.vo.DispatchHistoryVO;
import com.panda.vo.DispatcherLoginVO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface DispatcherService {

    void register(DispatcherRegisterDTO dispatcherRegisterDTO);

    DispatcherLoginVO login(DispatcherLoginDTO dispatcherLoginDTO);

    void logout();

    void delete(DispatcherDeleteDTO dispatcherDeleteDTO);

    String sendVerificationCode(String email);

    void resetPassword(DispatcherResetPasswordDTO dispatcherResetPasswordDTO);

    Map<String, Object> info();

    List<DispatchHistoryVO> dispatchHistory();

    Map<String, Object> mapData(BigDecimal longitude, BigDecimal latitude, Integer scale);

    Map<String, Object> unlockScooter(DispatcherUnlockScooterDTO dispatcherUnlockScooterDTO);

    void lockScooter(DispatcherLockScooterDTO dispatcherLockScooterDTO);

    Object scooterInfo(String code);
}
