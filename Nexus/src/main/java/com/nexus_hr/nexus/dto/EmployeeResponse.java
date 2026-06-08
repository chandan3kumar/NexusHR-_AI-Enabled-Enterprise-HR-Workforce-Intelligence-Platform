package com.nexus_hr.nexus.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String designation;
    private Double salary;
    private String employeeCode;
    private String phoneNumber;
    private LocalDate joiningDate;
    private String status;
}