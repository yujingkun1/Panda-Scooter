package com.panda.service;

import com.panda.dto.AdminLoginDTO;
import com.panda.dto.DataOverviewDTO;
import com.panda.dto.LiveDataDTO;
import com.panda.dto.PricingRuleEditDTO;
import com.panda.vo.AdminLoginVO;
import com.panda.vo.DataOverviewVO;
import com.panda.vo.LiveDataVO;
import com.panda.vo.PricingRuleVO;

import java.util.List;

public interface AdminService {

    AdminLoginVO login(AdminLoginDTO loginDTO);

    void logout();

    DataOverviewVO getOverview(DataOverviewDTO overviewDTO);

    LiveDataVO getLiveData(LiveDataDTO liveDataDTO);

    PricingRuleVO getPricingRules();

    void editRules(PricingRuleEditDTO editDTO);
}
