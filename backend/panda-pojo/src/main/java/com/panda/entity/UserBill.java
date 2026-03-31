package com.panda.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UserBill {
    private Long id;
    private Long userId;
    private Integer type;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private Long orderId;
    private String remark;
    private LocalDateTime createTime;
}
