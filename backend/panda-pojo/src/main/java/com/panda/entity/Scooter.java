package com.panda.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Scooter {
    private Long id;
    private String code;
    private Integer battery;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer rideStatus;
    private Integer faultStatus;
    private LocalDateTime createTime;
}
