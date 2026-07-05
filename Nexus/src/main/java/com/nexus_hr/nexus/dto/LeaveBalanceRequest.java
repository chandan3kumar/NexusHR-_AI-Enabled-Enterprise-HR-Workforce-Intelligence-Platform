package com.nexus_hr.nexus.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceRequest {

    @NotNull(message = "Total leaves is required")
    @Min(value = 0)
    private Integer totalLeaves;
}