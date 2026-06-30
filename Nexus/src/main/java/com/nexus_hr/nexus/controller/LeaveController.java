package com.nexus_hr.nexus.controller;

import com.nexus_hr.nexus.dto.LeaveRequest;
import com.nexus_hr.nexus.dto.LeaveResponse;
import com.nexus_hr.nexus.entity.LeaveStatus;
import com.nexus_hr.nexus.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping("/apply/{employeeId}")
    public ResponseEntity<LeaveResponse> applyLeave(
            @PathVariable Long employeeId,
            @Valid @RequestBody LeaveRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.applyLeave(employeeId, request));
    }

    @PutMapping("/approve/{leaveId}")
    public ResponseEntity<LeaveResponse> approveLeave(@PathVariable Long leaveId) {
        return ResponseEntity.ok(leaveService.approveLeave(leaveId));
    }

    @PutMapping("/reject/{leaveId}")
    public ResponseEntity<LeaveResponse> rejectLeave(@PathVariable Long leaveId) {
        return ResponseEntity.ok(leaveService.rejectLeave(leaveId));
    }

    @GetMapping
    public ResponseEntity<List<LeaveResponse>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveResponse>> getLeavesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LeaveResponse>> getLeavesByStatus(@PathVariable LeaveStatus status) {
        return ResponseEntity.ok(leaveService.getLeavesByStatus(status));
    }
}