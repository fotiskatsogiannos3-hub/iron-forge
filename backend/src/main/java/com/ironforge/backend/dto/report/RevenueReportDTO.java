package com.ironforge.backend.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenueReportDTO(
        LocalDate from,
        LocalDate to,
        long paymentCount,
        BigDecimal totalRevenue,
        String currency
) {
}
