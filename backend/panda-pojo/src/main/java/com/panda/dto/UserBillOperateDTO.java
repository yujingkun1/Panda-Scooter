package com.panda.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserBillOperateDTO {

    @NotNull
    private Integer type;

    private BigDecimal amount;

    private String remark;

    private Long packageId;
}
