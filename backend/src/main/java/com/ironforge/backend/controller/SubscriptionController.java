package com.ironforge.backend.controller;

import com.ironforge.backend.dto.subscription.SubscriptionInsertDTO;
import com.ironforge.backend.dto.subscription.SubscriptionReadOnlyDTO;
import com.ironforge.backend.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionReadOnlyDTO createSubscription(@Valid @RequestBody SubscriptionInsertDTO dto) {
        return subscriptionService.createSubscription(dto);
    }

    @GetMapping
    public Page<SubscriptionReadOnlyDTO> getSubscriptions(@ParameterObject Pageable pageable) {
        return subscriptionService.getSubscriptions(pageable);
    }

    @GetMapping("/member/{memberId}")
    public List<SubscriptionReadOnlyDTO> getSubscriptionsForMember(@PathVariable Long memberId) {
        return subscriptionService.getSubscriptionsForMember(memberId);
    }
}
