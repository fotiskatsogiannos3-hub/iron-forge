package com.ironforge.backend.dto.payment;

import com.ironforge.backend.domain.membership.enums.PaymentMethod;
import com.ironforge.backend.domain.membership.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentReadOnlyDTO(
        Long id,
        Long subscriptionId,
        Long memberId,
        BigDecimal amount,
        String currency,
        LocalDateTime paymentDate,
        PaymentMethod method,
        PaymentStatus status
) {
}
