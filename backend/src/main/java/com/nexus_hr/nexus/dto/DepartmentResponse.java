package com.nexus_hr.nexus.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentResponse {

    private Long id;
    private String departmentCode;
    private String departmentName;
    private String description;
}