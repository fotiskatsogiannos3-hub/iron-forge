package com.ironforge.backend.repository;

import com.ironforge.backend.domain.membership.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    List<SubscriptionPlan> findAllByActiveTrue();
}
