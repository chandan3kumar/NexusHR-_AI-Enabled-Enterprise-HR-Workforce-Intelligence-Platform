package com.nexus_hr.nexus.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalanceResponse {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private Integer totalLeaves;

    private Integer usedLeaves;

    private Integer remainingLeaves;
}