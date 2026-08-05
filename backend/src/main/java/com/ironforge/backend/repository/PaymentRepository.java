package com.ironforge.backend.repository;

import com.ironforge.backend.domain.membership.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findAllByMember_IdOrderByPaymentDateDesc(Long memberId);

    List<Payment> findAllByPaymentDateBetween(LocalDateTime from, LocalDateTime to);
}
