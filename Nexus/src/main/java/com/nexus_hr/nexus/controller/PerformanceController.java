package com.nexus_hr.nexus.controller;

import com.nexus_hr.nexus.dto.PerformanceRequest;
import com.nexus_hr.nexus.dto.PerformanceResponse;
import com.nexus_hr.nexus.service.PerformanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;

    @PostMapping("/review/{employeeId}")
    public ResponseEntity<PerformanceResponse> createReview(
            @PathVariable Long employeeId,
            @Valid @RequestBody PerformanceRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(performanceService.createReview(employeeId, request));
    }

    @GetMapping
    public ResponseEntity<List<PerformanceResponse>> getAllReviews() {
        return ResponseEntity.ok(performanceService.getAllReviews());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceResponse>> getReviewsByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(performanceService.getReviewsByEmployee(employeeId));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<PerformanceResponse> updateReview(
            @PathVariable Long reviewId,
            @RequestBody PerformanceRequest request) {

        return ResponseEntity.ok(performanceService.updateReview(reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        performanceService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employee/{employeeId}/average-rating")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long employeeId) {
        return ResponseEntity.ok(performanceService.getAverageRating(employeeId));
    }
}