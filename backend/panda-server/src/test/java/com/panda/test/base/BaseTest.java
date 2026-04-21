package com.panda.test.base;

import com.panda.test.utils.ConfigManager;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.BeforeAll;

/**
 * 接口测试基类。
 * 统一初始化 RestAssured 基础配置，子类直接复用请求规范。
 */
public abstract class BaseTest {

    protected static RequestSpecification requestSpec;

    @BeforeAll
    static void initRestAssured() {
        RestAssured.baseURI = ConfigManager.getBaseUrl();
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails(LogDetail.ALL);

        requestSpec = new RequestSpecBuilder()
                .setBaseUri(RestAssured.baseURI)
                .setContentType(ContentType.JSON)
                .addHeader("Accept", "application/json")
                .log(LogDetail.URI)
                .build();
    }
}
