package com.nexus_hr.nexus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequest {

    @NotBlank(message = "Department code is required")
    private String departmentCode;

    @NotBlank(message = "Department name is required")
    private String departmentName;

    private String description;
}
