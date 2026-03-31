package com.panda.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWalletVO {
    private BigDecimal balance;
    private List<PackageItem> packages;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageItem {
        private Long id;
        private String title;
        private String description;
        private Integer type;
        private LocalDateTime expireDate;
        private Integer restDay;
    }
}
