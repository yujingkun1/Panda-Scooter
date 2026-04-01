package com.panda.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RentalOrder {
    private Long id;
    private Long userId;
    private Long scooterId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalTime;
    private Integer orderStatus;
    private Integer payStatus;
    private BigDecimal amount;
    private BigDecimal totalKilometer;
    private LocalDateTime createTime;
}
