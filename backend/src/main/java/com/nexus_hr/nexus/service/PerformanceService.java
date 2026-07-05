package com.nexus_hr.nexus.service;

import com.nexus_hr.nexus.dto.PerformanceRequest;
import com.nexus_hr.nexus.dto.PerformanceResponse;

import java.util.List;

public interface PerformanceService {

    PerformanceResponse createReview(Long employeeId, PerformanceRequest request);

    List<PerformanceResponse> getAllReviews();

    List<PerformanceResponse> getReviewsByEmployee(Long employeeId);

    PerformanceResponse updateReview(Long reviewId, PerformanceRequest request);

    void deleteReview(Long reviewId);

    Double getAverageRating(Long employeeId);
}