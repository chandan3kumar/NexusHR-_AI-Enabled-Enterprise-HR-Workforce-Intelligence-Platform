package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.EmployeeRequest;
import com.nexus_hr.nexus.dto.EmployeeResponse;
import com.nexus_hr.nexus.entity.Department;
import com.nexus_hr.nexus.entity.Employee;
import com.nexus_hr.nexus.repository.DepartmentRepository;
import com.nexus_hr.nexus.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public EmployeeResponse createEmployee(EmployeeRequest request) {

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new RuntimeException("Employee code already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException(
                        "Department not found with id: " + request.getDepartmentId()
                ));

        Employee employee = new Employee();

        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setStatus(request.getStatus());
        employee.setDepartment(department);
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());

        Employee savedEmployee = employeeRepository.save(employee);

        return mapToResponse(savedEmployee);
    }

    @Override
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        return mapToResponse(employee);
    }

    @Override
    public EmployeeResponse getEmployeeByEmail(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));

        return mapToResponse(employee);
    }

    @Override
    public List<EmployeeResponse> searchEmployeesByFirstName(String firstName) {
        return employeeRepository.findByFirstNameContainingIgnoreCase(firstName)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        if (request.getEmployeeCode() != null) {
            if (employeeRepository.existsByEmployeeCodeAndIdNot(request.getEmployeeCode(), id)) {
                throw new RuntimeException("Employee code already exists");
            }
            employee.setEmployeeCode(request.getEmployeeCode());
        }

        if (request.getEmail() != null) {
            if (employeeRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
                throw new RuntimeException("Email already exists");
            }
            employee.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {
            employee.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            employee.setLastName(request.getLastName());
        }

        if (request.getPhoneNumber() != null) {
            employee.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getJoiningDate() != null) {
            employee.setJoiningDate(request.getJoiningDate());
        }

        if (request.getStatus() != null) {
            employee.setStatus(request.getStatus());
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException(
                            "Department not found with id: " + request.getDepartmentId()
                    ));

            employee.setDepartment(department);
        }

        if (request.getDesignation() != null) {
            employee.setDesignation(request.getDesignation());
        }

        if (request.getSalary() != null) {
            employee.setSalary(request.getSalary());
        }

        Employee updatedEmployee = employeeRepository.save(employee);

        return mapToResponse(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        employeeRepository.delete(employee);
    }

    private EmployeeResponse mapToResponse(Employee employee) {

        Department department = employee.getDepartment();

        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phoneNumber(employee.getPhoneNumber())
                .joiningDate(employee.getJoiningDate())
                .status(employee.getStatus())
                .departmentId(department != null ? department.getId() : null)
                .departmentCode(department != null ? department.getDepartmentCode() : null)
                .departmentName(department != null ? department.getDepartmentName() : null)
                .designation(employee.getDesignation())
                .salary(employee.getSalary())
                .build();
    }
}