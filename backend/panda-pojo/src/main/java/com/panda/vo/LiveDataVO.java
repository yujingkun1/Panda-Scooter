package com.panda.vo;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class LiveDataVO {

    private LocalDateTime updatedAt;

    private Integer todayOrders;

    private String todayRevenue;

    private Integer onlineScooters;

    private Integer faultScooters;

    private Integer areaId;
}