package com.panda.test.model;

import java.util.Map;

/**
 * 测试用例模型。
 * 用于承载 JSON 数据文件中的单条测试场景。
 */
public class TestCase {

    private String caseName;
    private String path;
    private String method;
    private int expectedStatusCode;
    private int expectedCode;
    private String expectedMsg;
    private Map<String, Object> requestBody;
    private Boolean extractToken;

    public String getCaseName() {
        return caseName;
    }

    public void setCaseName(String caseName) {
        this.caseName = caseName;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public int getExpectedStatusCode() {
        return expectedStatusCode;
    }

    public void setExpectedStatusCode(int expectedStatusCode) {
        this.expectedStatusCode = expectedStatusCode;
    }

    public int getExpectedCode() {
        return expectedCode;
    }

    public void setExpectedCode(int expectedCode) {
        this.expectedCode = expectedCode;
    }

    public String getExpectedMsg() {
        return expectedMsg;
    }

    public void setExpectedMsg(String expectedMsg) {
        this.expectedMsg = expectedMsg;
    }

    public Map<String, Object> getRequestBody() {
        return requestBody;
    }

    public void setRequestBody(Map<String, Object> requestBody) {
        this.requestBody = requestBody;
    }

    public Boolean getExtractToken() {
        return extractToken;
    }

    public void setExtractToken(Boolean extractToken) {
        this.extractToken = extractToken;
    }
}
