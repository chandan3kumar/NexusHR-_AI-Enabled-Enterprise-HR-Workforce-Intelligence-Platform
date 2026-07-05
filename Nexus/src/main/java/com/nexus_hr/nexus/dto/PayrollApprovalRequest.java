package com.nexus_hr.nexus.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollApprovalRequest {

    private Double bonus = 0.0;

    private Double deductions = 0.0;

    @NotNull(message = "Approved by is required")
    private String approvedBy;
}