package com.panda.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DispatchHistoryVO {
    private Long id;
    private String scooterCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal distance;
    private Integer status;
}
