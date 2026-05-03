package com.panda.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@Data
public class LiveDataDTO {

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private Integer areaId;
}