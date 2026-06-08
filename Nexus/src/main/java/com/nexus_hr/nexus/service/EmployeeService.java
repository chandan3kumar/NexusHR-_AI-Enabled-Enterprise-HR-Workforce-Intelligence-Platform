package com.nexus_hr.nexus.service;


import com.nexus_hr.nexus.dto.EmployeeRequest;
import com.nexus_hr.nexus.dto.EmployeeResponse;

import java.util.List;

public interface EmployeeService {

        EmployeeResponse createEmployee(EmployeeRequest request);

        List<EmployeeResponse> getAllEmployees();

        EmployeeResponse getEmployeeById(Long id);

        EmployeeResponse getEmployeeByEmail(String email);

        List<EmployeeResponse> searchEmployeesByFirstName(String firstName);

        EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

        void deleteEmployee(Long id);
}
