package com.panda.controller.user;

import com.panda.dto.UserBillOperateDTO;
import com.panda.dto.UserDeleteDTO;
import com.panda.dto.UserLoginDTO;
import com.panda.dto.UserRegisterDTO;
import com.panda.dto.UserResetPasswordDTO;
import com.panda.result.Result;
import com.panda.service.UserService;
import com.panda.vo.UserLoginVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/user/signin")
    public Result<Void> register(@Valid @RequestBody UserRegisterDTO userRegisterDTO) {
        userService.register(userRegisterDTO);
        return Result.success();
    }

    @PostMapping("/user/login")
    public Result<UserLoginVO> login(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        return Result.success(userService.login(userLoginDTO));
    }

    @PostMapping("/user/logout")
    public Result<Void> logout() {
        userService.logout();
        return Result.success();
    }

    @DeleteMapping("/user/delete")
    public Result<Void> delete(@Valid @RequestBody UserDeleteDTO userDeleteDTO) {
        userService.delete(userDeleteDTO);
        return Result.success();
    }

    @GetMapping("/user/verification")
    public Result<Map<String, Object>> verification(@RequestParam String email) {
        String code = userService.sendVerificationCode(email);
        Map<String, Object> data = new HashMap<>();
        data.put("verificationCode", code);
        return Result.success(data);
    }

    @PostMapping("/user/password")
    public Result<Void> resetPassword(@Valid @RequestBody UserResetPasswordDTO userResetPasswordDTO) {
        userService.resetPassword(userResetPasswordDTO);
        return Result.success();
    }

    @GetMapping("/user/wallet")
    public Result<Object> wallet() {
        return Result.success(userService.getWallet());
    }

    @PostMapping("/user/bill")
    public Result<Void> bill(@Valid @RequestBody UserBillOperateDTO userBillOperateDTO) {
        userService.operateBill(userBillOperateDTO);
        return Result.success();
    }

    @GetMapping("/user/bills")
    public Result<Map<String, Object>> bills() {
        Map<String, Object> data = new HashMap<>();
        data.put("bills", userService.listBills());
        return Result.success(data);
    }

    @GetMapping("/faults")
    public Result<Map<String, Object>> faults() {
        Map<String, Object> data = new HashMap<>();
        data.put("faults", userService.listFaults());
        return Result.success(data);
    }

    @PostMapping(value = "/fault", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Object> fault(@RequestPart("scooterId") Long scooterId,
                                @RequestPart(value = "description", required = false) String description,
                                @RequestPart(value = "image", required = false) MultipartFile image) {
        return Result.success(userService.reportFault(scooterId, description, image));
    }

    @GetMapping("/subscription")
    public Result<Object> subscription() {
        return Result.success(userService.listSubscriptions());
    }
}
