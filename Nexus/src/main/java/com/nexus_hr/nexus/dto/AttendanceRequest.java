package com.nexus_hr.nexus.dto;

import lombok.Data;

@Data
public class AttendanceRequest {

    private Long employeeId;

    private String remarks;
}