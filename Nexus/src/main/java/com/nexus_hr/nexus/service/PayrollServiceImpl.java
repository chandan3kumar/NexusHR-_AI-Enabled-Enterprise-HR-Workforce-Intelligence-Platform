package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.PayrollRequest;
import com.nexus_hr.nexus.dto.PayrollResponse;
import com.nexus_hr.nexus.entity.*;
import com.nexus_hr.nexus.repository.AttendanceRepository;
import com.nexus_hr.nexus.repository.EmployeeRepository;
import com.nexus_hr.nexus.repository.LeaveRepository;
import com.nexus_hr.nexus.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;

    @Override
    public PayrollResponse generatePayroll(PayrollRequest request) {

        if (payrollRepository.existsByEmployeeIdAndMonthAndYear(
                request.getEmployeeId(), request.getMonth(), request.getYear())) {
            throw new RuntimeException("Payroll already generated for this employee and month");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found with id: " + request.getEmployeeId()
                ));

        LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth(), 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        int workingDays = calculateWorkingDays(startDate, endDate);

        List<Attendance> attendances =
                attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(
                        request.getEmployeeId(), startDate, endDate
                );

        double paidAttendanceDays = 0.0;

        for (Attendance attendance : attendances) {
            if (attendance.getStatus() == AttendanceStatus.PRESENT ||
                    attendance.getStatus() == AttendanceStatus.LATE) {
                paidAttendanceDays += 1.0;
            } else if (attendance.getStatus() == AttendanceStatus.HALF_DAY) {
                paidAttendanceDays += 0.5;
            }
        }

        List<Leave> approvedLeaves =
                leaveRepository.findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        request.getEmployeeId(),
                        LeaveStatus.APPROVED,
                        endDate,
                        startDate
                );

        double paidLeaveDays = 0.0;

        for (Leave leave : approvedLeaves) {
            LocalDate leaveStart = leave.getStartDate().isBefore(startDate)
                    ? startDate
                    : leave.getStartDate();

            LocalDate leaveEnd = leave.getEndDate().isAfter(endDate)
                    ? endDate
                    : leave.getEndDate();

            paidLeaveDays += calculateWorkingDays(leaveStart, leaveEnd);
        }

        double paidDays = paidAttendanceDays + paidLeaveDays;

        if (paidDays > workingDays) {
            paidDays = workingDays;
        }

        double absentDays = workingDays - paidDays;

        double basicSalary = employee.getSalary();
        double bonus = request.getBonus() == null ? 0.0 : request.getBonus();

        double perDaySalary = basicSalary / workingDays;
        double deductions = absentDays * perDaySalary;
        double netSalary = basicSalary - deductions + bonus;

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(request.getMonth())
                .year(request.getYear())
                .basicSalary(basicSalary)
                .workingDays(workingDays)
                .paidDays(paidDays)
                .absentDays(absentDays)
                .perDaySalary(round(perDaySalary))
                .deductions(round(deductions))
                .bonus(bonus)
                .netSalary(round(netSalary))
                .generatedDate(LocalDate.now())
                .status(PayrollStatus.GENERATED)
                .build();

        return mapToResponse(payrollRepository.save(payroll));
    }

    @Override
    public List<PayrollResponse> getAllPayrolls() {
        return payrollRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<PayrollResponse> getPayrollsByEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private int calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        int workingDays = 0;

        LocalDate date = startDate;

        while (!date.isAfter(endDate)) {
            if (date.getDayOfWeek() != DayOfWeek.SATURDAY &&
                    date.getDayOfWeek() != DayOfWeek.SUNDAY) {
                workingDays++;
            }
            date = date.plusDays(1);
        }

        return workingDays;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private PayrollResponse mapToResponse(Payroll payroll) {

        Employee employee = payroll.getEmployee();

        return PayrollResponse.builder()
                .id(payroll.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .month(payroll.getMonth())
                .year(payroll.getYear())
                .basicSalary(payroll.getBasicSalary())
                .workingDays(payroll.getWorkingDays())
                .paidDays(payroll.getPaidDays())
                .absentDays(payroll.getAbsentDays())
                .perDaySalary(payroll.getPerDaySalary())
                .deductions(payroll.getDeductions())
                .bonus(payroll.getBonus())
                .netSalary(payroll.getNetSalary())
                .generatedDate(payroll.getGeneratedDate())
                .status(payroll.getStatus())
                .build();
    }
}