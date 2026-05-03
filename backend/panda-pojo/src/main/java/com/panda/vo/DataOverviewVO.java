package com.panda.vo;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DataOverviewVO {
    private String startDate;
    private String endDate;
    private String granularity;
    private String areaID;
    private List<SeriesItem> series;

    @Data
    @Builder
    public static class SeriesItem {
        private String time;
        private String orderCount;
        private String revenue;
    }
}