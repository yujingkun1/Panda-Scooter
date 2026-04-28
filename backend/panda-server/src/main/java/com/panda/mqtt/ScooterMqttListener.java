package com.panda.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.panda.entity.Scooter;
import com.panda.mapper.ScooterMapper;
import com.panda.mqtt.dto.ScooterTelemetryMessage;
import com.panda.properties.MqttProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScooterMqttListener implements ApplicationRunner, MqttCallbackExtended {

    private final MqttClient mqttClient;
    private final MqttConnectOptions mqttConnectOptions;
    private final MqttProperties mqttProperties;
    private final ObjectMapper objectMapper;
    private final ScooterMapper scooterMapper;

    @Override
    public void run(ApplicationArguments args) {
        if (!Boolean.TRUE.equals(mqttProperties.getEnabled())) {
            log.info("MQTT is disabled");
            return;
        }

        try {
            mqttClient.setCallback(this);
            mqttClient.connect(mqttConnectOptions);
            subscribeTelemetryTopic();
        } catch (Exception ex) {
            log.warn("Failed to connect MQTT broker, serverUri={}", mqttProperties.getServerUri(), ex);
        }
    }

    @Override
    public void connectComplete(boolean reconnect, String serverURI) {
        log.info("MQTT connected, reconnect={}, serverURI={}", reconnect, serverURI);
        if (reconnect) {
            subscribeTelemetryTopic();
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        log.warn("MQTT connection lost", cause);
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
        try {
            ScooterTelemetryMessage telemetry = objectMapper.readValue(payload, ScooterTelemetryMessage.class);
            String scooterCode = resolveScooterCode(topic, telemetry);
            if (scooterCode == null || scooterCode.isBlank()) {
                log.warn("Ignore scooter telemetry because code is empty, topic={}, payload={}", topic, payload);
                return;
            }

            Scooter scooter = scooterMapper.getByCode(scooterCode);
            if (scooter == null) {
                log.warn("Ignore scooter telemetry because scooter does not exist, code={}, payload={}", scooterCode, payload);
                return;
            }

            scooterMapper.updateStatusAndLocation(
                    scooter.getId(),
                    resolveRideStatus(telemetry, scooter),
                    resolveFaultStatus(telemetry, scooter),
                    resolveBattery(telemetry, scooter),
                    resolveLatitude(telemetry, scooter),
                    resolveLongitude(telemetry, scooter)
            );
            log.info("Updated scooter telemetry, code={}, orderId={}, latitude={}, longitude={}, battery={}",
                    scooterCode, telemetry.getOrderId(), telemetry.getLatitude(), telemetry.getLongitude(), telemetry.getBattery());
        } catch (Exception ex) {
            log.warn("Failed to handle scooter telemetry, topic={}, payload={}", topic, payload, ex);
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // Server command publishing is logged by ScooterMqttPublisher.
    }

    private void subscribeTelemetryTopic() {
        try {
            if (mqttClient.isConnected()) {
                mqttClient.subscribe(mqttProperties.getTelemetryTopic(), mqttProperties.getQos());
                log.info("Subscribed MQTT telemetry topic, topic={}", mqttProperties.getTelemetryTopic());
            }
        } catch (Exception ex) {
            log.warn("Failed to subscribe MQTT telemetry topic, topic={}", mqttProperties.getTelemetryTopic(), ex);
        }
    }

    private String resolveScooterCode(String topic, ScooterTelemetryMessage telemetry) {
        if (telemetry.getCode() != null && !telemetry.getCode().isBlank()) {
            return telemetry.getCode();
        }
        String[] segments = topic.split("/");
        if (segments.length >= 4
                && "panda".equals(segments[0])
                && "scooter".equals(segments[1])
                && "telemetry".equals(segments[3])) {
            return segments[2];
        }
        return null;
    }

    private Integer resolveRideStatus(ScooterTelemetryMessage telemetry, Scooter scooter) {
        return telemetry.getRideStatus() == null ? scooter.getRideStatus() : telemetry.getRideStatus();
    }

    private Integer resolveFaultStatus(ScooterTelemetryMessage telemetry, Scooter scooter) {
        return telemetry.getFaultStatus() == null ? scooter.getFaultStatus() : telemetry.getFaultStatus();
    }

    private Integer resolveBattery(ScooterTelemetryMessage telemetry, Scooter scooter) {
        if (telemetry.getBattery() == null) {
            return scooter.getBattery();
        }
        return Math.max(0, Math.min(100, telemetry.getBattery()));
    }

    private BigDecimal resolveLatitude(ScooterTelemetryMessage telemetry, Scooter scooter) {
        return telemetry.getLatitude() == null ? scooter.getLatitude() : telemetry.getLatitude();
    }

    private BigDecimal resolveLongitude(ScooterTelemetryMessage telemetry, Scooter scooter) {
        return telemetry.getLongitude() == null ? scooter.getLongitude() : telemetry.getLongitude();
    }
}
