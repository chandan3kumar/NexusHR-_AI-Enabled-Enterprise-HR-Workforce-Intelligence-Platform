package com.nexus_hr.nexus.dto;

import com.nexus_hr.nexus.entity.PerformanceStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceResponse {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private String goal;

    private Integer rating;

    private String comments;

    private String reviewerName;

    private LocalDate reviewDate;

    private PerformanceStatus status;
}