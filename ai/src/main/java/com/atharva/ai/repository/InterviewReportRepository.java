package com.atharva.ai.repository;

import com.atharva.ai.entity.InterviewReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewReportRepository
        extends JpaRepository<InterviewReport, Long> {

    Optional<InterviewReport>
    findByInterviewId(Long interviewId);
}