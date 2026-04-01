package com.panda.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PackageOrder {
    private Long id;
    private Long userId;
    private Long packageId;
    private BigDecimal price;
    private Integer orderStatus;
    private Integer payStatus;
    private LocalDateTime createTime;
}
