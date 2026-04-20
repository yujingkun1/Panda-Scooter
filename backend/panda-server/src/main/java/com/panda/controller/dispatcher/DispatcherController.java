package com.panda.controller.dispatcher;

import com.panda.dto.DispatcherDeleteDTO;
import com.panda.dto.DispatcherLockScooterDTO;
import com.panda.dto.DispatcherLoginDTO;
import com.panda.dto.DispatcherRegisterDTO;
import com.panda.dto.DispatcherResetPasswordDTO;
import com.panda.dto.DispatcherUnlockScooterDTO;
import com.panda.result.Result;
import com.panda.service.DispatcherService;
import com.panda.vo.DispatcherLoginVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/dispatcher")
@RequiredArgsConstructor
public class DispatcherController {

    private final DispatcherService dispatcherService;

    @PostMapping("/user/signin")
    public Result<Void> register(@Valid @RequestBody DispatcherRegisterDTO dispatcherRegisterDTO) {
        dispatcherService.register(dispatcherRegisterDTO);
        return Result.success();
    }

    @PostMapping("/user/login")
    public Result<DispatcherLoginVO> login(@Valid @RequestBody DispatcherLoginDTO dispatcherLoginDTO) {
        return Result.success(dispatcherService.login(dispatcherLoginDTO));
    }

    @PostMapping("/user/logout")
    public Result<Void> logout() {
        dispatcherService.logout();
        return Result.success();
    }

    @DeleteMapping("/user/delete")
    public Result<Void> delete(@Valid @RequestBody DispatcherDeleteDTO dispatcherDeleteDTO) {
        dispatcherService.delete(dispatcherDeleteDTO);
        return Result.success();
    }

    @GetMapping("/user/verification")
    public Result<Map<String, Object>> verification(@RequestParam String email) {
        String code = dispatcherService.sendVerificationCode(email);
        Map<String, Object> data = new HashMap<>();
        data.put("verificationCode", code);
        return Result.success(data);
    }

    @PostMapping("/user/password")
    public Result<Void> resetPassword(@Valid @RequestBody DispatcherResetPasswordDTO dispatcherResetPasswordDTO) {
        dispatcherService.resetPassword(dispatcherResetPasswordDTO);
        return Result.success();
    }

    @GetMapping("/user/info")
    public Result<Object> info() {
        return Result.success(dispatcherService.info());
    }

    @GetMapping("/user/dispatch-history")
    public Result<Map<String, Object>> dispatchHistory() {
        Map<String, Object> data = new HashMap<>();
        data.put("history", dispatcherService.dispatchHistory());
        return Result.success(data);
    }

    @GetMapping("/map")
    public Result<Object> map(@RequestParam BigDecimal longitude,
                              @RequestParam BigDecimal latitude,
                              @RequestParam(required = false) Integer scale) {
        return Result.success(dispatcherService.mapData(longitude, latitude, scale));
    }

    @PostMapping("/scooter/unlock")
    public Result<Object> unlock(@Valid @RequestBody DispatcherUnlockScooterDTO dispatcherUnlockScooterDTO) {
        return Result.success(dispatcherService.unlockScooter(dispatcherUnlockScooterDTO));
    }

    @PostMapping("/scooter/lock")
    public Result<Void> lock(@Valid @RequestBody DispatcherLockScooterDTO dispatcherLockScooterDTO) {
        dispatcherService.lockScooter(dispatcherLockScooterDTO);
        return Result.success();
    }

    @GetMapping("/scooter/info")
    public Result<Object> scooterInfo(@RequestParam String code) {
        return Result.success(dispatcherService.scooterInfo(code));
    }
}
