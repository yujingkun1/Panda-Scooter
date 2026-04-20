package com.panda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DispatcherLockScooterDTO {

    @NotBlank
    private String code;

    @NotNull
    private Integer battery;

    @NotNull
    private BigDecimal latitude;

    @NotNull
    private BigDecimal longitude;
}
