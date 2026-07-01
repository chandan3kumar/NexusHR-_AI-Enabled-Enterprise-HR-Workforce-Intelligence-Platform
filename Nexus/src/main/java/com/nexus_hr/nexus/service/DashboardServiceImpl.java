package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.DashboardResponse;
import com.nexus_hr.nexus.entity.EmployeeStatus;
import com.nexus_hr.nexus.entity.LeaveStatus;
import com.nexus_hr.nexus.entity.Payroll;
import com.nexus_hr.nexus.entity.PerformanceReview;
import com.nexus_hr.nexus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final PayrollRepository payrollRepository;
    private final PerformanceReviewRepository performanceReviewRepository;

    @Override
    public DashboardResponse getDashboardData() {

        LocalDate today = LocalDate.now();

        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long inactiveEmployees = employeeRepository.countByStatus(EmployeeStatus.INACTIVE);

        long totalDepartments = departmentRepository.count();

        long presentToday = attendanceRepository.countByAttendanceDate(today);

        long pendingLeaves = leaveRepository.countByStatus(LeaveStatus.PENDING);
        long approvedLeaves = leaveRepository.countByStatus(LeaveStatus.APPROVED);

        List<Payroll> monthlyPayrolls =
                payrollRepository.findByMonthAndYear(currentMonth, currentYear);

        double monthlyPayroll = monthlyPayrolls.stream()
                .mapToDouble(p -> p.getNetSalary() != null ? p.getNetSalary() : 0.0)
                .sum();

        List<PerformanceReview> reviews = performanceReviewRepository.findAll();

        double averagePerformanceRating = reviews.isEmpty()
                ? 0.0
                : reviews.stream()
                .mapToInt(PerformanceReview::getRating)
                .average()
                .orElse(0.0);

        averagePerformanceRating =
                Math.round(averagePerformanceRating * 100.0) / 100.0;

        return DashboardResponse.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(inactiveEmployees)
                .totalDepartments(totalDepartments)
                .presentToday(presentToday)
                .pendingLeaves(pendingLeaves)
                .approvedLeaves(approvedLeaves)
                .monthlyPayroll(monthlyPayroll)
                .averagePerformanceRating(averagePerformanceRating)
                .build();
    }
}