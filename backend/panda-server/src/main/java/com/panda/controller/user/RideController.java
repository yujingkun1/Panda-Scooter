package com.panda.controller.user;

import com.panda.dto.LockScooterDTO;
import com.panda.dto.PayUnpaidOrderDTO;
import com.panda.result.Result;
import com.panda.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @GetMapping("/scooter")
    public Result<Object> getScooter(@RequestParam String code) {
        return Result.success(rideService.getScooterByCode(code));
    }

    @PostMapping("/scooter/unlock")
    public Result<Object> unlock(@RequestParam String code) {
        return Result.success(rideService.unlockScooter(code));
    }

    @PostMapping("/scooter/lock")
    public Result<Object> lock(@Valid @RequestBody LockScooterDTO lockScooterDTO) {
        return Result.success(rideService.lockScooter(lockScooterDTO));
    }

    @PostMapping("/unpaid-order")
    public Result<Object> payUnpaidOrder(@Valid @RequestBody PayUnpaidOrderDTO payUnpaidOrderDTO) {
        return Result.success(rideService.payUnpaidOrder(payUnpaidOrderDTO));
    }

    @GetMapping("/ride-history")
    public Result<Object> rideHistory() {
        return Result.success(rideService.rideHistory());
    }

    @GetMapping("/user/info")
    public Result<Object> userInfo() {
        return Result.success(rideService.userInfo());
    }

    @GetMapping("/map")
    public Result<Object> map(@RequestParam BigDecimal longitude,
                              @RequestParam BigDecimal latitude,
                              @RequestParam(required = false) Integer scale) {
        return Result.success(rideService.mapData(longitude, latitude, scale));
    }
}
