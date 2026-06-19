package com.whippt.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QueueStatusResponse {
    private int activeJobs;
    private int waitingJobs;
}
