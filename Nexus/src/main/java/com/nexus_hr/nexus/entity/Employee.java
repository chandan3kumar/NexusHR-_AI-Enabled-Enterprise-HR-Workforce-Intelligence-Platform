package com.nexus_hr.nexus.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
   // private String department;

    private String designation;

    private Double salary;

    private String employeeCode;

    private String phoneNumber;

    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
