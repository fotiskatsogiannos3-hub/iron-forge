package com.ironforge.backend.controller;

import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanInsertDTO;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanReadOnlyDTO;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanUpdateDTO;
import com.ironforge.backend.service.SubscriptionPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscription-plans")
@RequiredArgsConstructor
public class SubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionPlanReadOnlyDTO createPlan(@Valid @RequestBody SubscriptionPlanInsertDTO dto) {
        return subscriptionPlanService.createPlan(dto);
    }

    @PutMapping("/{id}")
    public SubscriptionPlanReadOnlyDTO updatePlan(@PathVariable Long id, @Valid @RequestBody SubscriptionPlanUpdateDTO dto) {
        return subscriptionPlanService.updatePlan(id, dto);
    }

    @GetMapping("/{id}")
    public SubscriptionPlanReadOnlyDTO getPlan(@PathVariable Long id) {
        return subscriptionPlanService.getPlan(id);
    }

    @GetMapping
    public List<SubscriptionPlanReadOnlyDTO> getPlans(@RequestParam(defaultValue = "false") boolean activeOnly) {
        return activeOnly ? subscriptionPlanService.getActivePlans() : subscriptionPlanService.getAllPlans();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> retirePlan(@PathVariable Long id) {
        subscriptionPlanService.retirePlan(id);
        return ResponseEntity.noContent().build();
    }
}
