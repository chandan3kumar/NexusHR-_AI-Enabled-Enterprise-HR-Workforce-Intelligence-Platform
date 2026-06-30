package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.PayrollRequest;
import com.nexus_hr.nexus.dto.PayrollResponse;

import java.util.List;

public interface PayrollService {

    PayrollResponse generatePayroll(PayrollRequest request);

    List<PayrollResponse> getAllPayrolls();

    List<PayrollResponse> getPayrollsByEmployee(Long employeeId);
}