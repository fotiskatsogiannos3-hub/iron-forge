package com.ironforge.backend.dto.subscriptionplan;

import java.math.BigDecimal;

public record SubscriptionPlanReadOnlyDTO(
        Long id,
        String name,
        Integer durationDays,
        BigDecimal price,
        String currency,
        String description,
        boolean active
) {
}
