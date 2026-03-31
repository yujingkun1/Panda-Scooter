package com.panda.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoParkingArea {
    private Long id;
    private String name;
    private String polygon;
    private Integer status;
    private LocalDateTime createTime;
}
