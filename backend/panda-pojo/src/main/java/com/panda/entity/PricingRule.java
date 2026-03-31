package com.panda.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PricingRule {
    private Long id;
    private BigDecimal pricePerMin;
    private BigDecimal basePrice;
    private Integer billingInterval;
    private LocalDateTime createTime;
}
