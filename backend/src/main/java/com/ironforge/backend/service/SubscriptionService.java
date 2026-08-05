package com.ironforge.backend.service;

import com.ironforge.backend.dto.subscription.SubscriptionInsertDTO;
import com.ironforge.backend.dto.subscription.SubscriptionReadOnlyDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SubscriptionService {

    SubscriptionReadOnlyDTO createSubscription(SubscriptionInsertDTO dto);

    Page<SubscriptionReadOnlyDTO> getSubscriptions(Pageable pageable);

    List<SubscriptionReadOnlyDTO> getSubscriptionsForMember(Long memberId);
}
