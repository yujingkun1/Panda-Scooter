package com.panda.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DispatcherDeleteDTO {

    @NotBlank
    private String password;

    @NotBlank
    private String verificationCode;
}
