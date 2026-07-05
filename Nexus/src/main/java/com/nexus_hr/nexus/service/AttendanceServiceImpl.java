package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.AttendanceResponse;
import com.nexus_hr.nexus.entity.Attendance;
import com.nexus_hr.nexus.entity.AttendanceStatus;
import com.nexus_hr.nexus.entity.Employee;
import com.nexus_hr.nexus.repository.AttendanceRepository;
import com.nexus_hr.nexus.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public AttendanceResponse checkIn(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        LocalDate today = LocalDate.now();

        if (attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today).isPresent()) {
            throw new RuntimeException("Employee already checked in today");
        }

        LocalDateTime now = LocalDateTime.now();

        AttendanceStatus status = now.toLocalTime().isAfter(LocalTime.of(10, 0))
                ? AttendanceStatus.LATE
                : AttendanceStatus.PRESENT;

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .attendanceDate(today)
                .checkInTime(now)
                .status(status)
                .remarks("Checked in successfully")
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);

        return mapToResponse(savedAttendance);
    }

    @Override
    public AttendanceResponse checkOut(Long employeeId) {

        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Employee already checked out today");
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        attendance.setCheckOutTime(checkOutTime);

        double hours = Duration.between(attendance.getCheckInTime(), checkOutTime)
                .toMinutes() / 60.0;

        attendance.setWorkingHours(hours);

        if (hours < 4) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        Attendance updatedAttendance = attendanceRepository.save(attendance);

        return mapToResponse(updatedAttendance);
    }

    @Override
    public List<AttendanceResponse> getEmployeeAttendance(Long employeeId) {

        return attendanceRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AttendanceResponse> getAllAttendance() {

        return attendanceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {

        Employee employee = attendance.getEmployee();

        return AttendanceResponse.builder()
                .id(attendance.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .attendanceDate(attendance.getAttendanceDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .workingHours(attendance.getWorkingHours())
                .status(attendance.getStatus())
                .remarks(attendance.getRemarks())
                .build();
    }


    @Override
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {

        return attendanceRepository.findByAttendanceDate(date)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

}