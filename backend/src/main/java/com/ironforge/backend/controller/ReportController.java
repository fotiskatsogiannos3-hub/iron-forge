package com.ironforge.backend.controller;

import com.ironforge.backend.dto.report.ReportJobStatusDTO;
import com.ironforge.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/revenue")
    public Map<String, String> startRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        String jobId = reportService.startRevenueReport(from, to);
        return Map.of("jobId", jobId);
    }

    @GetMapping("/{jobId}")
    public ReportJobStatusDTO getJobStatus(@PathVariable String jobId) {
        return reportService.getJobStatus(jobId);
    }
}
