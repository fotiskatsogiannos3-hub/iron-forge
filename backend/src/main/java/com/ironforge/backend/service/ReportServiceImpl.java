package com.ironforge.backend.service;

import com.ironforge.backend.dto.report.ReportJobStatusDTO;
import com.ironforge.backend.exception.EntityNotFoundException;
import com.ironforge.backend.job.ReportJobStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

// Async report jobs: controller returns a job id, client polls for the result.
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportJobStore jobStore;
    private final ReportAsyncExecutor asyncExecutor;

    @Override
    public String startRevenueReport(LocalDate from, LocalDate to) {
        String jobId = UUID.randomUUID().toString();
        jobStore.markPending(jobId);
        asyncExecutor.generate(jobId, from, to);
        return jobId;
    }

    @Override
    public ReportJobStatusDTO getJobStatus(String jobId) {
        if (!jobStore.exists(jobId)) {
            throw new EntityNotFoundException("ReportJob", "No report job with id " + jobId);
        }

        ReportJobStore.Status status = jobStore.statusOf(jobId);
        return new ReportJobStatusDTO(
                jobId,
                status.name(),
                jobStore.resultOf(jobId),
                jobStore.errorOf(jobId)
        );
    }
}
