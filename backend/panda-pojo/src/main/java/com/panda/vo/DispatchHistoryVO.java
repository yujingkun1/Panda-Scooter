package com.panda.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DispatchHistoryVO {
    private Long id;
    private String scooterCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;
    private Integer rideStatus;
    private Integer faultStatus;
    private Integer battery;
}
