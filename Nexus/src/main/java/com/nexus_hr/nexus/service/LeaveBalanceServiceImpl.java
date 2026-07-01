package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.LeaveBalanceRequest;
import com.nexus_hr.nexus.dto.LeaveBalanceResponse;
import com.nexus_hr.nexus.entity.Employee;
import com.nexus_hr.nexus.entity.LeaveBalance;
import com.nexus_hr.nexus.repository.EmployeeRepository;
import com.nexus_hr.nexus.repository.LeaveBalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveBalanceServiceImpl implements LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public LeaveBalanceResponse createLeaveBalance(Long employeeId, LeaveBalanceRequest request) {

        if (leaveBalanceRepository.findByEmployeeId(employeeId).isPresent()) {
            throw new RuntimeException("Leave balance already exists for this employee");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        LeaveBalance leaveBalance = LeaveBalance.builder()
                .employee(employee)
                .totalLeaves(request.getTotalLeaves())
                .usedLeaves(0)
                .remainingLeaves(request.getTotalLeaves())
                .build();

        return mapToResponse(leaveBalanceRepository.save(leaveBalance));
    }

    @Override
    public LeaveBalanceResponse getLeaveBalanceByEmployee(Long employeeId) {

        LeaveBalance leaveBalance = leaveBalanceRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Leave balance not found for employee id: " + employeeId));

        return mapToResponse(leaveBalance);
    }

    @Override
    public LeaveBalanceResponse updateLeaveBalance(Long employeeId, LeaveBalanceRequest request) {

        LeaveBalance leaveBalance = leaveBalanceRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Leave balance not found for employee id: " + employeeId));

        leaveBalance.setTotalLeaves(request.getTotalLeaves());

        int remaining = request.getTotalLeaves() - leaveBalance.getUsedLeaves();

        if (remaining < 0) {
            throw new RuntimeException("Total leaves cannot be less than used leaves");
        }

        leaveBalance.setRemainingLeaves(remaining);

        return mapToResponse(leaveBalanceRepository.save(leaveBalance));
    }

    @Override
    public List<LeaveBalanceResponse> getAllLeaveBalances() {
        return leaveBalanceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LeaveBalanceResponse mapToResponse(LeaveBalance leaveBalance) {

        Employee employee = leaveBalance.getEmployee();

        return LeaveBalanceResponse.builder()
                .id(leaveBalance.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .totalLeaves(leaveBalance.getTotalLeaves())
                .usedLeaves(leaveBalance.getUsedLeaves())
                .remainingLeaves(leaveBalance.getRemainingLeaves())
                .build();
    }
}