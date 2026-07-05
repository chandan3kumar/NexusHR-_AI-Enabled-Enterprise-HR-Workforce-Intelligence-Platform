package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.LeaveBalanceRequest;
import com.nexus_hr.nexus.dto.LeaveBalanceResponse;

import java.util.List;

public interface LeaveBalanceService {

    LeaveBalanceResponse createLeaveBalance(Long employeeId, LeaveBalanceRequest request);

    LeaveBalanceResponse getLeaveBalanceByEmployee(Long employeeId);

    LeaveBalanceResponse updateLeaveBalance(Long employeeId, LeaveBalanceRequest request);

    List<LeaveBalanceResponse> getAllLeaveBalances();
}