package com.panda.service;

import com.panda.dto.LockScooterDTO;
import com.panda.dto.PayUnpaidOrderDTO;

import java.math.BigDecimal;
import java.util.Map;

public interface RideService {

    Map<String, Object> unlockScooter(String code);

    Map<String, Object> lockScooter(LockScooterDTO lockScooterDTO);

    Map<String, Object> payUnpaidOrder(PayUnpaidOrderDTO payUnpaidOrderDTO);

    Object getScooterByCode(String code);

    Map<String, Object> rideHistory();

    Map<String, Object> userInfo();

    Map<String, Object> mapData(BigDecimal longitude, BigDecimal latitude, Integer scale);
}
