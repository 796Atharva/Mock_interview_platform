
package com.atharva.ai.service;

import com.atharva.ai.entity.Interview;
import com.atharva.ai.entity.InterviewAnswer;
import com.atharva.ai.repository.InterviewAnswerRepository;
import com.atharva.ai.repository.InterviewRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InterviewEvaluationService {

    private final GroqApiService groqApiService;
    private final InterviewRepository interviewRepository;
    private final InterviewAnswerRepository interviewAnswerRepository;

    public InterviewEvaluationService(
            GroqApiService groqApiService,
            InterviewRepository interviewRepository,
            InterviewAnswerRepository interviewAnswerRepository
    ) {
        this.groqApiService = groqApiService;
        this.interviewRepository = interviewRepository;
        this.interviewAnswerRepository = interviewAnswerRepository;
    }

    @Transactional
    public void evaluateInterview(Long interviewId) {

        interviewRepository.findById(interviewId)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found"));

        List<InterviewAnswer> answers =
                interviewAnswerRepository
                        .findByInterviewIdOrderByQuestionQuestionOrder(
                                interviewId
                        );

        if (answers.isEmpty()) {
            throw new RuntimeException(
                    "No interview answers found to evaluate."
            );
        }

        for (InterviewAnswer answer : answers) {

            String question = answer.getQuestion().getQuestion();
            String candidateAnswer = answer.getAnswer();
            String expectedPoints =
                    answer.getQuestion().getExpectedPoints();

            String prompt = """
                    You are an experienced technical interviewer.

                    Evaluate the candidate's answer to the question.

                    QUESTION:
                    %s

                    EXPECTED ANSWER POINTS:
                    %s

                    CANDIDATE ANSWER:
                    %s

                    Evaluate based on:
                    1. Technical correctness
                    2. Conceptual understanding
                    3. Completeness
                    4. Clarity
                    5. Practical understanding

                    Score from 0 to 10 inclusive.

                    Scoring guide:
                    0-2: Incorrect, irrelevant, or no meaningful answer.
                    3-4: Limited understanding with major gaps.
                    5-6: Partially correct with some missing concepts.
                    7-8: Good answer with minor gaps.
                    9: Excellent and accurate answer.
                    10: Exceptional depth, accuracy, and practical insight.

                    Do not award marks for keywords alone.
                    Do not invent information the candidate did not say.
                    If the answer is blank, assign 0.
                    Keep feedback specific to this answer.

                    Return JSON with exactly these fields:
                    {
                      "score": 0,
                      "evaluation": "Explain what was correct, what was missing or wrong, and how to improve."
                    }
                    """.formatted(
                    question,
                    expectedPoints == null ? "Not provided" : expectedPoints,
                    candidateAnswer == null ? "" : candidateAnswer
            );

            EvaluationResult result = groqApiService.evaluate(
                    prompt,
                    EvaluationResult.class
            );

            int score = Math.max(
                    0,
                    Math.min(10, result.score() == null ? 0 : result.score())
            );

            answer.setScore(score);
            answer.setEvaluation(
                    result.evaluation() == null
                            ? "No evaluation feedback returned."
                            : result.evaluation()
            );

            interviewAnswerRepository.save(answer);
        }
    }

    public record EvaluationResult(
            Integer score,
            String evaluation
    ) {
    }
}
