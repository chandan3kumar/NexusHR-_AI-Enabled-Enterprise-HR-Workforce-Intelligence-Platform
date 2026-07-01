package com.nexus_hr.nexus.repository;

import com.nexus_hr.nexus.entity.Leave;
import com.nexus_hr.nexus.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {

    List<Leave> findByEmployeeId(Long employeeId);

    List<Leave> findByStatus(LeaveStatus status);
    List<Leave> findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long employeeId,
            LeaveStatus status,
            LocalDate endDate,
            LocalDate startDate
    );
    long countByStatus(LeaveStatus status);
}