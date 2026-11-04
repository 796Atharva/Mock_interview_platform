package com.atharva.ai.repository;

import com.atharva.ai.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewAnswerRepository
        extends JpaRepository<InterviewAnswer, Long> {

    List<InterviewAnswer>
    findByInterviewIdOrderByQuestionQuestionOrder(
            Long interviewId
    );

    boolean existsByQuestionId(Long questionId);
}