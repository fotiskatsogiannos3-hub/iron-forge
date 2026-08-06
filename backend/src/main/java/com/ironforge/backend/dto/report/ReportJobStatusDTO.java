package com.ironforge.backend.dto.report;

public record ReportJobStatusDTO(
        String jobId,
        String status,
        RevenueReportDTO result,
        String error
) {
}
