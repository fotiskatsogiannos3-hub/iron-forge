package com.ironforge.backend.service;

import com.ironforge.backend.domain.membership.SubscriptionPlan;
import com.ironforge.backend.domain.membership.valueobject.Money;
import com.ironforge.backend.dto.subscriptionplan.SubscriptionPlanReadOnlyDTO;
import com.ironforge.backend.exception.EntityNotFoundException;
import com.ironforge.backend.mapper.Mapper;
import com.ironforge.backend.repository.SubscriptionPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionPlanServiceImplTest {

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    private final Mapper mapper = new Mapper();

    private SubscriptionPlanServiceImpl planService;

    @BeforeEach
    void setUp() {
        planService = new SubscriptionPlanServiceImpl(subscriptionPlanRepository, mapper);
    }

    @Test
    void retirePlan_flipsTheActiveFlag_ratherThanDeletingTheRow() {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setId(1L);
        plan.setName("Monthly");
        plan.setDurationDays(30);
        plan.setPrice(new Money(BigDecimal.valueOf(25), "EUR"));
        plan.setActive(true);

        when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(plan));

        planService.retirePlan(1L);

        assertThat(plan.isActive()).isFalse();
        // retiring must never remove the row: past subscriptions still reference this
        // plan by foreign key
        verify(subscriptionPlanRepository, never()).delete(any());
        verify(subscriptionPlanRepository, never()).deleteById(any());
    }

    @Test
    void retirePlan_throwsNotFound_whenPlanDoesNotExist() {
        when(subscriptionPlanRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> planService.retirePlan(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getActivePlans_onlyReturnsPlansMarkedActive() {
        SubscriptionPlan active = new SubscriptionPlan();
        active.setId(1L);
        active.setName("Monthly");
        active.setDurationDays(30);
        active.setPrice(new Money(BigDecimal.valueOf(25), "EUR"));
        active.setActive(true);

        when(subscriptionPlanRepository.findAllByActiveTrue()).thenReturn(List.of(active));

        List<SubscriptionPlanReadOnlyDTO> result = planService.getActivePlans();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).active()).isTrue();
        assertThat(result.get(0).name()).isEqualTo("Monthly");
    }
}
