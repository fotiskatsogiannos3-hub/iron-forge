package com.ironforge.backend.dto.subscription;

import com.ironforge.backend.domain.membership.enums.SubscriptionStatus;

import java.time.LocalDate;

public record SubscriptionReadOnlyDTO(
        Long id,
        Long memberId,
        String memberFullName,
        Long planId,
        String planName,
        LocalDate startDate,
        LocalDate endDate,
        SubscriptionStatus status
) {
}
