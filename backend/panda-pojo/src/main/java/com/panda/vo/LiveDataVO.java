package com.panda.vo;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class LiveDataVO {
    private LocalDateTime updatedAt;
    private String todayOrders;
    private String todayRevenue;
    private String onlineScooters;
    private String faultScooters;
    private String areaId;
}