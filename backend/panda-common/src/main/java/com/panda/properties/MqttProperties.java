package com.panda.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "panda.mqtt")
public class MqttProperties {

    private Boolean enabled = true;

    private String serverUri = "tcp://172.20.10.2:1883";

    private String clientId = "panda-server";

    private String username;

    private String password;

    private Integer qos = 1;

    private String telemetryTopic = "panda/scooter/+/telemetry";

    private String commandTopicPrefix = "panda/scooter";

    private Integer connectionTimeout = 10;

    private Integer keepAliveInterval = 30;
}
