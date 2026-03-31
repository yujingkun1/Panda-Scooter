package com.panda.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SubscriptionPackage {
    private Long id;
    private String title;
    private String description;
    private java.math.BigDecimal price;
    private Integer type;
    private LocalDateTime createTime;
}
