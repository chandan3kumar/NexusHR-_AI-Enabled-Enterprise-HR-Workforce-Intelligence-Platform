package com.nexus_hr.nexus.dto;

import com.nexus_hr.nexus.entity.PayrollStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;

    private Integer month;
    private Integer year;

    private Double basicSalary;
    private Integer workingDays;
    private Double paidDays;
    private Double absentDays;

    private Double perDaySalary;
    private Double deductions;
    private Double bonus;
    private Double netSalary;

    private LocalDate generatedDate;
    private PayrollStatus status;
}