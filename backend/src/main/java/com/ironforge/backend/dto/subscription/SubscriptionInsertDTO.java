package com.ironforge.backend.dto.subscription;

import com.ironforge.backend.domain.membership.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record SubscriptionInsertDTO(
        @NotNull Long memberId,
        @NotNull Long planId,
        @NotNull PaymentMethod paymentMethod
) {
}
