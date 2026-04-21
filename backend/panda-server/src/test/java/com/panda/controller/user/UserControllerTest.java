package com.panda.controller.user;

import com.panda.test.base.BaseTest;
import com.panda.test.model.TestCase;
import com.panda.test.utils.ConfigManager;
import com.panda.test.utils.TestUtils;
import io.restassured.response.Response;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

import static io.restassured.RestAssured.given;

/**
 * 用户登录接口自动化测试。
 */
class UserControllerTest extends BaseTest {

    static Stream<TestCase> loginCases() {
        List<TestCase> cases = TestUtils.loadTestCases("testdata/login-cases.json");
        return cases.stream();
    }

    @DisplayName("/login 接口测试")
    @ParameterizedTest(name = "[{index}] {arguments}")
    @MethodSource("loginCases")
    void shouldTestLoginApi(TestCase testCase) {
        Assumptions.assumeTrue(isServerAvailable(),
                () -> "测试跳过：目标服务不可达，请先启动服务 -> " + ConfigManager.getBaseUrl());

        TestUtils.logCaseStart(testCase);

        Response response = given()
                .spec(requestSpec)
                .body(testCase.getRequestBody())
                .when()
                .post(resolvePath(testCase));

        int actualStatusCode = response.getStatusCode();
        String actualCode = response.jsonPath().getString("code");
        String actualMsg = response.jsonPath().getString("msg");

        TestUtils.logCaseResult(testCase, actualStatusCode, actualCode, actualMsg);

        Assertions.assertAll(
                () -> Assertions.assertEquals(testCase.getExpectedStatusCode(), actualStatusCode,
                        "HTTP 状态码断言失败"),
                () -> Assertions.assertEquals(String.valueOf(testCase.getExpectedCode()), actualCode,
                        "业务码断言失败"),
                () -> Assertions.assertTrue(actualMsg.contains(testCase.getExpectedMsg()),
                        "业务消息断言失败")
        );

        if (Boolean.TRUE.equals(testCase.getExtractToken()) && Objects.equals("0", actualCode)) {
            String token = response.jsonPath().getString("data.token");
            Assertions.assertNotNull(token, "登录成功后 token 不应为空");
            System.out.printf("[TOKEN] case=%s, token=%s%n", testCase.getCaseName(), token);
        }
    }

    private String resolvePath(TestCase testCase) {
        if (testCase.getPath() == null || testCase.getPath().isBlank()) {
            return ConfigManager.getLoginPath();
        }
        return testCase.getPath();
    }

    private boolean isServerAvailable() {
        try {
            URL url = new URL(ConfigManager.getBaseUrl());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(1000);
            connection.setReadTimeout(1000);
            connection.setRequestMethod("GET");
            connection.connect();
            connection.disconnect();
            return true;
        } catch (Exception e) {
            System.out.printf("[TEST-SKIP] baseUrl=%s, reason=%s%n", ConfigManager.getBaseUrl(), e.getMessage());
            return false;
        }
    }
}
