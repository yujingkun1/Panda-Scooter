package com.panda.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBillVO {
    private Long id;
    private Integer type;
    private BigDecimal amount;
    private String remark;
    private LocalDateTime createTime;
}
