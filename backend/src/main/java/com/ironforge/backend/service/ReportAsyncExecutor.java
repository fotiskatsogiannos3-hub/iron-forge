package com.ironforge.backend.service;

import com.ironforge.backend.dto.report.RevenueReportDTO;
import com.ironforge.backend.job.ReportJobStore;
import com.ironforge.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

// @Async must be on a separate bean so Spring's proxy is used.
@Component
@RequiredArgsConstructor
class ReportAsyncExecutor {

    private final PaymentRepository paymentRepository;
    private final ReportJobStore jobStore;

    @Async("reportTaskExecutor")
    void generate(String jobId, LocalDate from, LocalDate to) {
        try {
            var payments = paymentRepository.findAllByPaymentDateBetween(from.atStartOfDay(), to.atTime(LocalTime.MAX));

            BigDecimal total = payments.stream()
                    .map(p -> p.getAmount().getAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String currency = payments.isEmpty() ? "EUR" : payments.get(0).getAmount().getCurrency();

            RevenueReportDTO report = new RevenueReportDTO(from, to, payments.size(), total, currency);
            jobStore.markDone(jobId, report);
        } catch (Exception e) {
            jobStore.markFailed(jobId, e.getMessage());
        }
    }
}
