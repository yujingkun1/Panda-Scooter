package com.panda.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DispatcherUnlockScooterDTO {

    @NotBlank
    private String code;
}
