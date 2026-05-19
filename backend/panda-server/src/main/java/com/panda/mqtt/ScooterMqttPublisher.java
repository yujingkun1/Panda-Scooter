package com.panda.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.panda.entity.ScooterCommand;
import com.panda.mapper.ScooterCommandMapper;
import com.panda.mqtt.dto.ScooterCommandMessage;
import com.panda.properties.MqttProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScooterMqttPublisher {

    private final MqttClient mqttClient;
    private final MqttProperties mqttProperties;
    private final ObjectMapper objectMapper;
    private final ScooterCommandMapper scooterCommandMapper;

    public void publishUnlock(String scooterCode, Long orderId) {
        publishCommand(scooterCode, "UNLOCK", orderId);
    }

    public void publishLock(String scooterCode, Long orderId) {
        publishCommand(scooterCode, "LOCK", orderId);
    }

    public boolean retryCommand(ScooterCommand scooterCommand) {
        if (scooterCommand == null || scooterCommand.getCommandId() == null) {
            return false;
        }
        if (!Boolean.TRUE.equals(mqttProperties.getEnabled())) {
            log.warn("Skip retry scooter command because MQTT is disabled, commandId={}", scooterCommand.getCommandId());
            scooterCommandMapper.markRetryError(scooterCommand.getCommandId(), "MQTT is disabled");
            return false;
        }
        if (!mqttClient.isConnected()) {
            log.warn("Skip retry scooter command because MQTT is not connected, commandId={}, scooterCode={}",
                    scooterCommand.getCommandId(), scooterCommand.getScooterCode());
            scooterCommandMapper.markRetryError(scooterCommand.getCommandId(), "MQTT is not connected");
            return false;
        }

        try {
            publishRawPayload(scooterCommand.getScooterCode(), scooterCommand.getPayload());
            scooterCommandMapper.markRetrySent(scooterCommand.getCommandId(), LocalDateTime.now());
            log.info("Retried scooter command, commandId={}, scooterCode={}, retryCount={}",
                    scooterCommand.getCommandId(), scooterCommand.getScooterCode(), scooterCommand.getRetryCount() + 1);
            return true;
        } catch (Exception ex) {
            log.warn("Failed to retry scooter command, commandId={}, scooterCode={}",
                    scooterCommand.getCommandId(), scooterCommand.getScooterCode(), ex);
            scooterCommandMapper.markRetryError(scooterCommand.getCommandId(), truncate(ex.getMessage()));
            return false;
        }
    }

    private void publishCommand(String scooterCode, String command, Long orderId) {
        if (scooterCode == null || scooterCode.isBlank()) {
            log.warn("Skip scooter command because scooterCode is empty, command={}", command);
            return;
        }

        String commandId = buildCommandId();
        ScooterCommandMessage commandMessage = new ScooterCommandMessage(commandId, command, orderId);
        String payload = writePayload(commandMessage);

        if (!Boolean.TRUE.equals(mqttProperties.getEnabled())) {
            markFailed(commandId, "MQTT is disabled");
            return;
        }
        if (!mqttClient.isConnected()) {
            log.warn("Skip scooter command because MQTT is not connected, scooterCode={}, command={}",
                    scooterCode, command);
            markFailed(commandId, "MQTT is not connected");
            return;
        }

        try {
            String topic = publishRawPayload(scooterCode, payload);
            markSent(commandId);
            log.info("Published scooter command, commandId={}, topic={}, payload={}", commandId, topic, payload);
        } catch (Exception ex) {
            log.warn("Failed to publish scooter command, scooterCode={}, command={}",
                    scooterCode, command, ex);
            markFailed(commandId, ex.getMessage());
        }
    }

    private String publishRawPayload(String scooterCode, String payload) throws Exception {
        String topic = mqttProperties.getCommandTopicPrefix() + "/" + scooterCode + "/command";
        byte[] payloadBytes = payload.getBytes(StandardCharsets.UTF_8);
        MqttMessage mqttMessage = new MqttMessage(payloadBytes);
        mqttMessage.setQos(mqttProperties.getQos());
        mqttMessage.setRetained(false);
        mqttClient.publish(topic, mqttMessage);
        return topic;
    }

    private void markSent(String commandId) {
        try {
            scooterCommandMapper.markSent(commandId, LocalDateTime.now());
        } catch (Exception ex) {
            log.warn("Failed to mark scooter command sent, commandId={}", commandId, ex);
        }
    }

    private void markFailed(String commandId, String errorMessage) {
        try {
            scooterCommandMapper.markFailed(commandId, truncate(errorMessage));
        } catch (Exception ex) {
            log.warn("Failed to mark scooter command failed, commandId={}", commandId, ex);
        }
    }

    private String writePayload(ScooterCommandMessage commandMessage) {
        try {
            return objectMapper.writeValueAsString(commandMessage);
        } catch (Exception ex) {
            log.warn("Failed to serialize scooter command, commandId={}, command={}",
                    commandMessage.getCommandId(), commandMessage.getCommand(), ex);
            return "{}";
        }
    }

    private String buildCommandId() {
        return "cmd_" + UUID.randomUUID().toString().replace("-", "");
    }

    private String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= 512 ? value : value.substring(0, 512);
    }
}
