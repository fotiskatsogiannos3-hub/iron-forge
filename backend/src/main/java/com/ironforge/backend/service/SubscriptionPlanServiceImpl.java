package com.ironforge.backend.service;

import com.ironforge.backend.domain.membership.SubscriptionPlan;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanInsertDTO;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanReadOnlyDTO;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanUpdateDTO;
import com.ironforge.backend.exception.EntityNotFoundException;
import com.ironforge.backend.mapper.Mapper;
import com.ironforge.backend.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final Mapper mapper;

    @Override
    @Transactional
    public SubscriptionPlanReadOnlyDTO createPlan(SubscriptionPlanInsertDTO dto) {
        SubscriptionPlan plan = mapper.mapToSubscriptionPlanEntity(dto);
        return mapper.mapToSubscriptionPlanReadOnlyDTO(subscriptionPlanRepository.save(plan));
    }

    @Override
    @Transactional
    public SubscriptionPlanReadOnlyDTO updatePlan(Long id, SubscriptionPlanUpdateDTO dto) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SubscriptionPlan", id));

        mapper.updateSubscriptionPlanFromDTO(plan, dto);
        return mapper.mapToSubscriptionPlanReadOnlyDTO(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionPlanReadOnlyDTO getPlan(Long id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SubscriptionPlan", id));
        return mapper.mapToSubscriptionPlanReadOnlyDTO(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanReadOnlyDTO> getAllPlans() {
        return subscriptionPlanRepository.findAll().stream()
                .map(mapper::mapToSubscriptionPlanReadOnlyDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanReadOnlyDTO> getActivePlans() {
        return subscriptionPlanRepository.findAllByActiveTrue().stream()
                .map(mapper::mapToSubscriptionPlanReadOnlyDTO)
                .toList();
    }

    @Override
    @Transactional
    public void retirePlan(Long id) {
        // Soft delete: keep the row for historical subscriptions.
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SubscriptionPlan", id));
        plan.setActive(false);
    }
}
