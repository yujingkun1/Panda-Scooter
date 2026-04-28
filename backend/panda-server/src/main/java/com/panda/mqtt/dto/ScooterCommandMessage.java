package com.panda.mqtt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ScooterCommandMessage {

    private String command;

    private Long orderId;
}
