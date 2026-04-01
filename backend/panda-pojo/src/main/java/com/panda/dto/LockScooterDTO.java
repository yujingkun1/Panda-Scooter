package com.panda.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LockScooterDTO {

    @NotNull
    private Long orderId;

    private java.time.LocalDateTime startTime;

    private java.time.LocalDateTime endTime;

    private BigDecimal amount;

    private BigDecimal totalKilometer;

    @NotBlank
    private String code;

    private Integer battery;

    private BigDecimal latitude;

    private BigDecimal longitude;
}
