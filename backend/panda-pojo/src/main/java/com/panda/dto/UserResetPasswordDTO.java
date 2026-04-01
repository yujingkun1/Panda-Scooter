package com.panda.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserResetPasswordDTO {

    @NotBlank
    private String verificationCode;

    @NotBlank
    private String newPassword;
}
