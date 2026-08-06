package com.ironforge.backend.service;

import com.ironforge.backend.dto.report.ReportJobStatusDTO;

import java.time.LocalDate;

public interface ReportService {

    String startRevenueReport(LocalDate from, LocalDate to);

    ReportJobStatusDTO getJobStatus(String jobId);
}
