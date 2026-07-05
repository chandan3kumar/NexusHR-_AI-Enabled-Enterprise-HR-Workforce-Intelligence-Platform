package com.nexus_hr.nexus.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "payroll")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

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

    @Enumerated(EnumType.STRING)
    private PayrollStatus status;

    private Boolean approved;

    private String approvedBy;
}