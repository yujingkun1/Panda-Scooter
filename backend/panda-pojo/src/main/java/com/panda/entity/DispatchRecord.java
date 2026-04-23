package com.panda.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DispatchRecord {
    private Long id;
    private Long dispatcherId;
    private Long scooterId;
    private Integer status;
    private LocalDateTime endTime;
    private LocalDateTime createTime;
}
