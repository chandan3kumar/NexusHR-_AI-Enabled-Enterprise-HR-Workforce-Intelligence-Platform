package com.nexus_hr.nexus.repository;

import com.nexus_hr.nexus.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByEmployeeId(Long employeeId);
    boolean existsByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
}