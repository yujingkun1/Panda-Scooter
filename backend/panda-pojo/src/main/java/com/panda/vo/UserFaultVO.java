package com.panda.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserFaultVO {
    private Long id;
    private String code;
    private String description;
    private LocalDateTime createTime;
}
