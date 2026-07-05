package com.nexus_hr.nexus.dto;

import com.nexus_hr.nexus.entity.EmployeeStatus;
import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Column(unique = true, nullable = false)
    private String email;

    @NotNull(message = "Department id is required")
    private Long departmentId;

    @NotBlank(message = "Designation is required")
    private String designation;

    @Positive(message = "Salary must be positive")
    private Double salary;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String employeeCode;

    @NotBlank
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Phone number must contain exactly 10 digits"
    )
    private String phoneNumber;

    @NotNull
    private LocalDate joiningDate;

    @NotNull
    private EmployeeStatus status;
}