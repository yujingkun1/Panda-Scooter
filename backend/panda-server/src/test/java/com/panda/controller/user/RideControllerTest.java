package com.panda.controller.user;

import com.panda.test.base.BaseTest;
import com.panda.test.model.TestCase;
import com.panda.test.utils.TestUtils;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

/**
 * 骑行接口测试占位类。
 * 后续可按登录测试模式继续扩展其它接口场景。
 */
@Disabled("待补充具体骑行接口测试数据后启用")
class RideControllerTest extends BaseTest {

    @Test
    void placeholder() {
        TestCase testCase = new TestCase();
        testCase.setCaseName("ride-placeholder");
        testCase.setMethod("POST");
        testCase.setPath("/user/ride/unlock");
        TestUtils.logCaseStart(testCase);
        System.out.println("[INFO] RideControllerTest 作为扩展示例保留");
    }
}
