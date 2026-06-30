package com.nexus_hr.nexus.dto;

import com.nexus_hr.nexus.entity.LeaveStatus;
import com.nexus_hr.nexus.entity.LeaveType;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveResponse {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private LeaveType leaveType;

    private LocalDate startDate;

    private LocalDate endDate;

    private Long totalDays;

    private String reason;

    private LeaveStatus status;

    private LocalDate appliedDate;

    private LocalDate approvedDate;
}