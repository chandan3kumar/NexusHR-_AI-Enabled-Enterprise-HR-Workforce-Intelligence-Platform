package com.nexus_hr.nexus.controller;

import com.nexus_hr.nexus.dto.PayrollRequest;
import com.nexus_hr.nexus.dto.PayrollResponse;
import com.nexus_hr.nexus.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payrolls")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate")
    public ResponseEntity<PayrollResponse> generatePayroll(
            @Valid @RequestBody PayrollRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(payrollService.generatePayroll(request));
    }

    @GetMapping
    public ResponseEntity<List<PayrollResponse>> getAllPayrolls() {
        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollResponse>> getPayrollsByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(payrollService.getPayrollsByEmployee(employeeId));
    }
}