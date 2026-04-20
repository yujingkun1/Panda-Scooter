package com.panda.test.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.panda.test.model.TestCase;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * 测试工具集合：配置读取、JSON 数据加载、日志输出。
 */
public final class TestUtils {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private TestUtils() {
    }

    public static Properties loadProperties(String resourcePath) {
        try (InputStream inputStream = getResourceAsStream(resourcePath)) {
            Properties properties = new Properties();
            properties.load(inputStream);
            return properties;
        } catch (IOException e) {
            throw new IllegalStateException("加载配置文件失败: " + resourcePath, e);
        }
    }

    public static List<TestCase> loadTestCases(String resourcePath) {
        try (InputStream inputStream = getResourceAsStream(resourcePath)) {
            return OBJECT_MAPPER.readValue(inputStream, new TypeReference<List<TestCase>>() {
            });
        } catch (IOException e) {
            throw new IllegalStateException("加载测试数据失败: " + resourcePath, e);
        }
    }

    public static Map<String, Object> loadJsonAsMap(String resourcePath) {
        try (InputStream inputStream = getResourceAsStream(resourcePath)) {
            return OBJECT_MAPPER.readValue(inputStream, new TypeReference<Map<String, Object>>() {
            });
        } catch (IOException e) {
            throw new IllegalStateException("加载 JSON 数据失败: " + resourcePath, e);
        }
    }

    public static void logCaseStart(TestCase testCase) {
        System.out.printf("[TEST-START] case=%s, method=%s, path=%s%n",
                testCase.getCaseName(), testCase.getMethod(), testCase.getPath());
    }

    public static void logCaseResult(TestCase testCase, int statusCode, String code, String msg) {
        System.out.printf("[TEST-END] case=%s, httpStatus=%d, code=%s, msg=%s%n",
                testCase.getCaseName(), statusCode, code, msg);
    }

    private static InputStream getResourceAsStream(String resourcePath) {
        InputStream inputStream = Thread.currentThread()
                .getContextClassLoader()
                .getResourceAsStream(resourcePath);
        if (inputStream == null) {
            throw new IllegalArgumentException("资源不存在: " + resourcePath);
        }
        return inputStream;
    }
}
