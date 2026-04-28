package com.panda.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.panda.mqtt.dto.ScooterCommandMessage;
import com.panda.properties.MqttProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScooterMqttPublisher {

    private final MqttClient mqttClient;
    private final MqttProperties mqttProperties;
    private final ObjectMapper objectMapper;

    public void publishUnlock(String scooterCode, Long orderId) {
        publishCommand(scooterCode, new ScooterCommandMessage("UNLOCK", orderId));
    }

    public void publishLock(String scooterCode, Long orderId) {
        publishCommand(scooterCode, new ScooterCommandMessage("LOCK", orderId));
    }

    private void publishCommand(String scooterCode, ScooterCommandMessage commandMessage) {
        if (!Boolean.TRUE.equals(mqttProperties.getEnabled())) {
            return;
        }
        if (scooterCode == null || scooterCode.isBlank()) {
            log.warn("Skip scooter command because scooterCode is empty, command={}", commandMessage.getCommand());
            return;
        }
        if (!mqttClient.isConnected()) {
            log.warn("Skip scooter command because MQTT is not connected, scooterCode={}, command={}",
                    scooterCode, commandMessage.getCommand());
            return;
        }

        try {
            String topic = mqttProperties.getCommandTopicPrefix() + "/" + scooterCode + "/command";
            byte[] payload = objectMapper.writeValueAsBytes(commandMessage);
            MqttMessage mqttMessage = new MqttMessage(payload);
            mqttMessage.setQos(mqttProperties.getQos());
            mqttMessage.setRetained(false);
            mqttClient.publish(topic, mqttMessage);
            log.info("Published scooter command, topic={}, payload={}", topic, new String(payload, StandardCharsets.UTF_8));
        } catch (Exception ex) {
            log.warn("Failed to publish scooter command, scooterCode={}, command={}",
                    scooterCode, commandMessage.getCommand(), ex);
        }
    }
}
