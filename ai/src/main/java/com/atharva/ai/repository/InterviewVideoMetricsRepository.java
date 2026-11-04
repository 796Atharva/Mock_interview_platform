package com.atharva.ai.repository;

import com.atharva.ai.entity.InterviewVideoMetrics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewVideoMetricsRepository
        extends JpaRepository<InterviewVideoMetrics, Long> {

    Optional<InterviewVideoMetrics>
    findByInterviewId(Long interviewId);
}