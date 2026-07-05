package com.nexus_hr.nexus.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "performance_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private String goal;

    private Integer rating; // 1 to 5

    private String comments;

    private String reviewerName;

    private LocalDate reviewDate;

    @Enumerated(EnumType.STRING)
    private PerformanceStatus status;
}