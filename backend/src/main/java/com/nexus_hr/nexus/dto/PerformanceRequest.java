package com.nexus_hr.nexus.dto;

import com.nexus_hr.nexus.entity.PerformanceStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceRequest {

    @NotBlank(message = "Goal is required")
    private String goal;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private String comments;

    @NotBlank(message = "Reviewer name is required")
    private String reviewerName;

    private PerformanceStatus status;
}