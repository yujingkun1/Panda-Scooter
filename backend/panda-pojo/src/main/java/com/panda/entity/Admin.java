package com.panda.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Admin {
    private Long id;
    private String username;
    private String password;
    private String email;
    private LocalDateTime createTime;
}
