package com.panda.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FaultReport {
    private Long id;
    private Long userId;
    private Long scooterId;
    private String description;
    private String imageUrl;
    private Integer status;
    private LocalDateTime createTime;
}
