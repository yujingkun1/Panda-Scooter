package com.panda.test.utils;

import java.util.Properties;

/**
 * 环境配置管理。
 * 通过 `-Dtest.env=dev|test` 切换环境，默认使用 dev。
 */
public final class ConfigManager {

    private static final String DEFAULT_ENV = "dev";
    private static final String ENV_KEY = "test.env";
    private static final Properties PROPERTIES;

    static {
        String env = System.getProperty(ENV_KEY, DEFAULT_ENV);
        PROPERTIES = TestUtils.loadProperties("config/" + env + ".properties");
    }

    private ConfigManager() {
    }

    public static String getEnv() {
        return System.getProperty(ENV_KEY, DEFAULT_ENV);
    }

    public static String getBaseUrl() {
        return PROPERTIES.getProperty("base.url");
    }

    public static String getLoginPath() {
        return PROPERTIES.getProperty("api.login.path", "/user/user/login");
    }

    public static String getProperty(String key) {
        return PROPERTIES.getProperty(key);
    }
}
