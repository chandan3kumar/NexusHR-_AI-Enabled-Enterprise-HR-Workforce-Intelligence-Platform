package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.LeaveRequest;
import com.nexus_hr.nexus.dto.LeaveResponse;
import com.nexus_hr.nexus.entity.LeaveStatus;

import java.util.List;

public interface LeaveService {

    LeaveResponse applyLeave(Long employeeId, LeaveRequest request);

    LeaveResponse approveLeave(Long leaveId);

    LeaveResponse rejectLeave(Long leaveId);

    List<LeaveResponse> getAllLeaves();

    List<LeaveResponse> getLeavesByEmployee(Long employeeId);

    List<LeaveResponse> getLeavesByStatus(LeaveStatus status);
}