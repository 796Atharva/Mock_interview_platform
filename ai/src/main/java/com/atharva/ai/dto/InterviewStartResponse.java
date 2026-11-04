package com.atharva.ai.dto;

public record InterviewStartResponse(
        Long interviewId,
        Long resumeId,
        Integer questionNumber,
        Integer totalQuestions,
        String question
) {
}