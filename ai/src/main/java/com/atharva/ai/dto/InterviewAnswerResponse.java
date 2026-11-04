package com.atharva.ai.dto;

public record InterviewAnswerResponse(
        Long interviewId,
        Integer answeredQuestion,
        Integer nextQuestionNumber,
        Integer totalQuestions,
        String nextQuestion,
        boolean completed
) {
}