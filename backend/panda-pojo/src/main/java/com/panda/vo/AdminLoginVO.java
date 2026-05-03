package com.panda.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminLoginVO {
    private Long id;
    private String username;
    private String token;
    private String email;
}
