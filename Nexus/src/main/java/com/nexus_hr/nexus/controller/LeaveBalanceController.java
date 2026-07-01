package com.nexus_hr.nexus.controller;

import com.nexus_hr.nexus.dto.LeaveBalanceRequest;
import com.nexus_hr.nexus.dto.LeaveBalanceResponse;
import com.nexus_hr.nexus.service.LeaveBalanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leave-balances")
@RequiredArgsConstructor
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    @PostMapping("/{employeeId}")
    public ResponseEntity<LeaveBalanceResponse> createLeaveBalance(
            @PathVariable Long employeeId,
            @Valid @RequestBody LeaveBalanceRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveBalanceService.createLeaveBalance(employeeId, request));
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<LeaveBalanceResponse> getLeaveBalance(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                leaveBalanceService.getLeaveBalanceByEmployee(employeeId)
        );
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<LeaveBalanceResponse> updateLeaveBalance(
            @PathVariable Long employeeId,
            @Valid @RequestBody LeaveBalanceRequest request) {

        return ResponseEntity.ok(
                leaveBalanceService.updateLeaveBalance(employeeId, request)
        );
    }

    @GetMapping
    public ResponseEntity<?> getAllLeaveBalances() {
        return ResponseEntity.ok(leaveBalanceService.getAllLeaveBalances());
    }
}