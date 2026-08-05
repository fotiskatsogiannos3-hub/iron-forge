package com.ironforge.backend.controller;

import com.ironforge.backend.domain.membership.Payment;
import com.ironforge.backend.dto.payment.PaymentReadOnlyDTO;
import com.ironforge.backend.mapper.Mapper;
import com.ironforge.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final Mapper mapper;

    // No POST here on purpose. Payments are only ever created as a side-effect
    // of SubscriptionService.createSubscription, never directly through the API.
    @GetMapping("/member/{memberId}")
    public List<PaymentReadOnlyDTO> getPaymentsForMember(@PathVariable Long memberId) {
        List<Payment> payments = paymentRepository.findAllByMember_IdOrderByPaymentDateDesc(memberId);
        return payments.stream().map(mapper::mapToPaymentReadOnlyDTO).toList();
    }
}
