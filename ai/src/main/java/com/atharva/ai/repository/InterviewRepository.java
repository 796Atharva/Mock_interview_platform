package com.atharva.ai.repository;

import com.atharva.ai.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    Optional<Interview> findByIdAndResumeId(
            Long interviewId,
            Long resumeId
    );
}