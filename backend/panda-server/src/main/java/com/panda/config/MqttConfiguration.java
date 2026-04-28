package com.panda.config;

import com.panda.properties.MqttProperties;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MqttConfiguration {

    @Bean
    public MqttClient mqttClient(MqttProperties mqttProperties) throws Exception {
        String clientId = mqttProperties.getClientId() + "-" + MqttClient.generateClientId();
        return new MqttClient(mqttProperties.getServerUri(), clientId, new MemoryPersistence());
    }

    @Bean
    public MqttConnectOptions mqttConnectOptions(MqttProperties mqttProperties) {
        MqttConnectOptions options = new MqttConnectOptions();
        options.setAutomaticReconnect(true);
        options.setCleanSession(true);
        options.setConnectionTimeout(mqttProperties.getConnectionTimeout());
        options.setKeepAliveInterval(mqttProperties.getKeepAliveInterval());
        if (mqttProperties.getUsername() != null && !mqttProperties.getUsername().isBlank()) {
            options.setUserName(mqttProperties.getUsername());
        }
        if (mqttProperties.getPassword() != null && !mqttProperties.getPassword().isBlank()) {
            options.setPassword(mqttProperties.getPassword().toCharArray());
        }
        return options;
    }
}
