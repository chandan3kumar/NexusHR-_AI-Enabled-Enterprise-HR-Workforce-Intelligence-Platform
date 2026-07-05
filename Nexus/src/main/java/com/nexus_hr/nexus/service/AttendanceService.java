package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.AttendanceResponse;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    AttendanceResponse checkIn(Long employeeId);

    AttendanceResponse checkOut(Long employeeId);

    List<AttendanceResponse> getEmployeeAttendance(Long employeeId);

    List<AttendanceResponse> getAllAttendance();
    List<AttendanceResponse> getAttendanceByDate(LocalDate date);
}