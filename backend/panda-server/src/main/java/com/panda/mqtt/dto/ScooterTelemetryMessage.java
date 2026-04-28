package com.panda.mqtt.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ScooterTelemetryMessage {

    private String code;

    private Long orderId;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private Integer battery;

    private Integer rideStatus;

    private Integer faultStatus;

    private String timestamp;
}
