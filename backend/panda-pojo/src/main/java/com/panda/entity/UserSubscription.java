package com.panda.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserSubscription {
    private Long id;
    private Long userId;
    private Long packageId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;
    private LocalDateTime createTime;
}
