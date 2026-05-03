package com.panda.controller.admin;

import com.panda.dto.AdminLoginDTO;
import com.panda.result.Result;
import com.panda.service.AdminService;
import com.panda.vo.AdminLoginVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/admin/log")
@Slf4j
public class LogController {
    @Autowired
    private AdminService adminService;

    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public Result<AdminLoginVO> login(@RequestBody AdminLoginDTO loginDTO) {
        log.info("管理员登录请求，邮箱：{}", loginDTO.getEmail());
        AdminLoginVO adminLoginVO = adminService.login(loginDTO);
        return Result.success(adminLoginVO);
    }

    /**
     * 管理员登出
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        log.info("管理员登出请求");
        adminService.logout();
        return Result.success();
    }


}
