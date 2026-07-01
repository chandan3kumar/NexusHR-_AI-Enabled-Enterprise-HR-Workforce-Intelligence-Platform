package com.nexus_hr.nexus.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private long totalEmployees;
    private long activeEmployees;
    private long inactiveEmployees;

    private long totalDepartments;

    private long presentToday;
    private long pendingLeaves;
    private long approvedLeaves;

    private double monthlyPayroll;
    private double averagePerformanceRating;
}