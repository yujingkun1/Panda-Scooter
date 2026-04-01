package com.panda.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Dispatcher {
    private Long id;
    private String name;
    private String password;
    private String email;
    private Long areaId;
    private Integer status;
    private LocalDateTime createTime;
}
