package com.panda.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Area {
    private Long id;
    private String name;
    private String polygon;
    private LocalDateTime createTime;
}
