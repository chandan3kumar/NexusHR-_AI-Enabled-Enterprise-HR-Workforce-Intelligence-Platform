package com.nexus_hr.nexus.controller;

import com.nexus_hr.nexus.dto.AttendanceResponse;
import com.nexus_hr.nexus.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in/{employeeId}")
    public ResponseEntity<AttendanceResponse> checkIn(@PathVariable Long employeeId) {

        AttendanceResponse response = attendanceService.checkIn(employeeId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/check-out/{employeeId}")
    public ResponseEntity<AttendanceResponse> checkOut(@PathVariable Long employeeId) {

        return ResponseEntity.ok(attendanceService.checkOut(employeeId));
    }



    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceResponse>> getEmployeeAttendance(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(attendanceService.getEmployeeAttendance(employeeId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByDate(
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceByDate(date)
        );
    }


    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> getAllAttendance() {

        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }
}