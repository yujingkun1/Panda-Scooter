package com.panda.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ParkingPoint {
    private Long id;
    private String name;
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private Integer status;
    private LocalDateTime createTime;
}
