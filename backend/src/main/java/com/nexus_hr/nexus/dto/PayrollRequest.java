package com.nexus_hr.nexus.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRequest {

    @NotNull(message = "Employee id is required")
    private Long employeeId;

    @NotNull(message = "Month is required")
    private Integer month;

    @NotNull(message = "Year is required")
    private Integer year;

    private Double bonus = 0.0;
}