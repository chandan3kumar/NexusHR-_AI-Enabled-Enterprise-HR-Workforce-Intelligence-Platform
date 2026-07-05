package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.PerformanceRequest;
import com.nexus_hr.nexus.dto.PerformanceResponse;
import com.nexus_hr.nexus.entity.Employee;
import com.nexus_hr.nexus.entity.PerformanceReview;
import com.nexus_hr.nexus.entity.PerformanceStatus;
import com.nexus_hr.nexus.repository.EmployeeRepository;
import com.nexus_hr.nexus.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceReviewRepository performanceReviewRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public PerformanceResponse createReview(Long employeeId, PerformanceRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .goal(request.getGoal())
                .rating(request.getRating())
                .comments(request.getComments())
                .reviewerName(request.getReviewerName())
                .reviewDate(LocalDate.now())
                .status(request.getStatus() != null ? request.getStatus() : PerformanceStatus.SUBMITTED)
                .build();

        return mapToResponse(performanceReviewRepository.save(review));
    }

    @Override
    public List<PerformanceResponse> getAllReviews() {
        return performanceReviewRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<PerformanceResponse> getReviewsByEmployee(Long employeeId) {
        return performanceReviewRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PerformanceResponse updateReview(Long reviewId, PerformanceRequest request) {

        PerformanceReview review = performanceReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Performance review not found with id: " + reviewId));

        if (request.getGoal() != null) {
            review.setGoal(request.getGoal());
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }

        if (request.getComments() != null) {
            review.setComments(request.getComments());
        }

        if (request.getReviewerName() != null) {
            review.setReviewerName(request.getReviewerName());
        }

        if (request.getStatus() != null) {
            review.setStatus(request.getStatus());
        }

        return mapToResponse(performanceReviewRepository.save(review));
    }

    @Override
    public void deleteReview(Long reviewId) {
        PerformanceReview review = performanceReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Performance review not found with id: " + reviewId));

        performanceReviewRepository.delete(review);
    }

    @Override
    public Double getAverageRating(Long employeeId) {
        List<PerformanceReview> reviews =
                performanceReviewRepository.findByEmployeeId(employeeId);

        if (reviews.isEmpty()) {
            return 0.0;
        }

        double average = reviews.stream()
                .mapToInt(PerformanceReview::getRating)
                .average()
                .orElse(0.0);

        return Math.round(average * 100.0) / 100.0;
    }

    private PerformanceResponse mapToResponse(PerformanceReview review) {

        Employee employee = review.getEmployee();

        return PerformanceResponse.builder()
                .id(review.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .goal(review.getGoal())
                .rating(review.getRating())
                .comments(review.getComments())
                .reviewerName(review.getReviewerName())
                .reviewDate(review.getReviewDate())
                .status(review.getStatus())
                .build();
    }
}