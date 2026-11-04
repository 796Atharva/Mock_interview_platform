package com.atharva.ai.repository;

import com.atharva.ai.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findByResumeIdOrderByQuestionOrder(Long resumeId);
}