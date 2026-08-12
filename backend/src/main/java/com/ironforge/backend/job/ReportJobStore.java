package com.ironforge.backend.job;

import com.ironforge.backend.dto.report.RevenueReportDTO;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// In-memory job store (single-instance deployment).
@Component
public class ReportJobStore {

    public enum Status { PENDING, DONE, FAILED }

    private record Job(Status status, RevenueReportDTO result, String error) {
    }

    private final Map<String, Job> jobs = new ConcurrentHashMap<>();

    public void markPending(String jobId) {
        jobs.put(jobId, new Job(Status.PENDING, null, null));
    }

    public void markDone(String jobId, RevenueReportDTO result) {
        jobs.put(jobId, new Job(Status.DONE, result, null));
    }

    public void markFailed(String jobId, String error) {
        jobs.put(jobId, new Job(Status.FAILED, null, error));
    }

    public Status statusOf(String jobId) {
        Job job = jobs.get(jobId);
        return job == null ? null : job.status();
    }

    public RevenueReportDTO resultOf(String jobId) {
        Job job = jobs.get(jobId);
        return job == null ? null : job.result();
    }

    public String errorOf(String jobId) {
        Job job = jobs.get(jobId);
        return job == null ? null : job.error();
    }

    public boolean exists(String jobId) {
        return jobs.containsKey(jobId);
    }
}
