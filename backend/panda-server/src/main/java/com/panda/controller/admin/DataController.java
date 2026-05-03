package com.panda.controller.admin;

import com.panda.dto.DataOverviewDTO;
import com.panda.dto.LiveDataDTO;
import com.panda.result.Result;
import com.panda.service.AdminService;
import com.panda.vo.DataOverviewVO;
import com.panda.vo.LiveDataVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/data")
@Slf4j
public class DataController {

    @Autowired
    private AdminService adminService;

    /**
     * 获取数据概览
     */
    @GetMapping("/overview")
    public Result<DataOverviewVO> getOverview(DataOverviewDTO overviewDTO) {
        log.info("获取数据概览，参数：{}", overviewDTO);
        DataOverviewVO dataOverviewVO = adminService.getOverview(overviewDTO);
        return Result.success(dataOverviewVO);
    }

    /**
     * 获取实时数据
     */
    @GetMapping("/liveData")
    public Result<LiveDataVO> getLiveData(LiveDataDTO liveDataDTO) {
        log.info("获取实时数据，参数：{}", liveDataDTO);
        LiveDataVO liveDataVO = adminService.getLiveData(liveDataDTO);
        return Result.success(liveDataVO);
    }
}