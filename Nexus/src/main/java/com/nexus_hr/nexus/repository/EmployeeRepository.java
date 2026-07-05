package com.nexus_hr.nexus.repository;

import com.nexus_hr.nexus.entity.Employee;
import com.nexus_hr.nexus.entity.EmployeeStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    List<Employee> findByFirstNameContainingIgnoreCase(String firstName);
    boolean existsByEmployeeCodeAndIdNot(String employeeCode, Long id);

    boolean existsByEmailAndIdNot(@Email(message = "Invalid email format")
                                  @NotBlank(message = "Email is required") String email, Long id);
    long countByStatus(EmployeeStatus status);
}
