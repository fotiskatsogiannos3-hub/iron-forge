package com.ironforge.backend.service;

import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanInsertDTO;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanReadOnlyDTO;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanUpdateDTO;

import java.util.List;

public interface SubscriptionPlanService {

    SubscriptionPlanReadOnlyDTO createPlan(SubscriptionPlanInsertDTO dto);

    SubscriptionPlanReadOnlyDTO updatePlan(Long id, SubscriptionPlanUpdateDTO dto);

    SubscriptionPlanReadOnlyDTO getPlan(Long id);

    List<SubscriptionPlanReadOnlyDTO> getAllPlans();

    List<SubscriptionPlanReadOnlyDTO> getActivePlans();

    void retirePlan(Long id);
}
