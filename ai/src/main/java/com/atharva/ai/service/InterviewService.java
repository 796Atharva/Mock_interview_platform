package com.atharva.ai.service;

import com.atharva.ai.dto.InterviewAnswerResponse;
import com.atharva.ai.dto.InterviewStartResponse;
import com.atharva.ai.dto.VideoMetricsRequest;
import com.atharva.ai.entity.Interview;
import com.atharva.ai.entity.InterviewAnswer;
import com.atharva.ai.entity.InterviewQuestion;
import com.atharva.ai.entity.InterviewVideoMetrics;
import com.atharva.ai.entity.Resume;
import com.atharva.ai.repository.InterviewAnswerRepository;
import com.atharva.ai.repository.InterviewQuestionRepository;
import com.atharva.ai.repository.InterviewRepository;
import com.atharva.ai.repository.InterviewVideoMetricsRepository;
import com.atharva.ai.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InterviewService {

    private final ResumeRepository resumeRepository;

    private final InterviewRepository interviewRepository;

    private final InterviewQuestionRepository
            interviewQuestionRepository;

    private final InterviewAnswerRepository
            interviewAnswerRepository;

    private final InterviewVideoMetricsRepository
            interviewVideoMetricsRepository;


    public InterviewService(
            ResumeRepository resumeRepository,
            InterviewRepository interviewRepository,
            InterviewQuestionRepository interviewQuestionRepository,
            InterviewAnswerRepository interviewAnswerRepository,
            InterviewVideoMetricsRepository interviewVideoMetricsRepository
    ) {

        this.resumeRepository =
                resumeRepository;

        this.interviewRepository =
                interviewRepository;

        this.interviewQuestionRepository =
                interviewQuestionRepository;

        this.interviewAnswerRepository =
                interviewAnswerRepository;

        this.interviewVideoMetricsRepository =
                interviewVideoMetricsRepository;
    }


    // =========================================================
    // START INTERVIEW
    // =========================================================

    @Transactional
    public InterviewStartResponse startInterview(
            Long resumeId
    ) {

        Resume resume =
                resumeRepository.findById(resumeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );


        List<InterviewQuestion> questions =
                interviewQuestionRepository
                        .findByResumeIdOrderByQuestionOrder(
                                resumeId
                        );


        if (questions.isEmpty()) {

            throw new RuntimeException(
                    "No interview questions found for this resume"
            );
        }


        Interview interview =
                new Interview();

        interview.setResume(resume);

        interview.setCurrentQuestionOrder(1);

        interview.setStatus(
                "IN_PROGRESS"
        );


        Interview savedInterview =
                interviewRepository.save(
                        interview
                );


        InterviewQuestion firstQuestion =
                questions.get(0);


        return new InterviewStartResponse(

                savedInterview.getId(),

                resumeId,

                firstQuestion.getQuestionOrder(),

                questions.size(),

                firstQuestion.getQuestion()
        );
    }


    // =========================================================
    // CURRENT QUESTION
    // =========================================================

    @Transactional(readOnly = true)
    public InterviewStartResponse getCurrentQuestion(
            Long interviewId
    ) {

        Interview interview =
                interviewRepository.findById(
                        interviewId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Interview not found"
                        )
                );


        Long resumeId =
                interview.getResume().getId();


        List<InterviewQuestion> questions =
                interviewQuestionRepository
                        .findByResumeIdOrderByQuestionOrder(
                                resumeId
                        );


        InterviewQuestion currentQuestion =
                questions.stream()
                        .filter(q ->
                                q.getQuestionOrder()
                                        .equals(
                                                interview
                                                        .getCurrentQuestionOrder()
                                        )
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Current question not found"
                                )
                        );


        return new InterviewStartResponse(

                interview.getId(),

                resumeId,

                currentQuestion
                        .getQuestionOrder(),

                questions.size(),

                currentQuestion
                        .getQuestion()
        );
    }


    // =========================================================
    // SAVE ANSWER
    // =========================================================

    @Transactional
    public InterviewAnswerResponse saveAnswer(
            Long interviewId,
            String answer
    ) {

        if (
                answer == null ||
                        answer.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Answer cannot be empty"
            );
        }


        Interview interview =
                interviewRepository.findById(
                        interviewId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Interview not found"
                        )
                );


        if (
                !"IN_PROGRESS".equals(
                        interview.getStatus()
                )
        ) {

            throw new RuntimeException(
                    "Interview is already completed"
            );
        }


        Long resumeId =
                interview.getResume().getId();


        List<InterviewQuestion> questions =
                interviewQuestionRepository
                        .findByResumeIdOrderByQuestionOrder(
                                resumeId
                        );


        InterviewQuestion currentQuestion =
                questions.stream()
                        .filter(q ->
                                q.getQuestionOrder()
                                        .equals(
                                                interview
                                                        .getCurrentQuestionOrder()
                                        )
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Current question not found"
                                )
                        );


        // -----------------------------------------------------
        // Prevent duplicate answer
        // -----------------------------------------------------

        List<InterviewAnswer> existingAnswers =
                interviewAnswerRepository
                        .findByInterviewIdOrderByQuestionQuestionOrder(
                                interviewId
                        );


        boolean alreadyAnswered =
                existingAnswers.stream()
                        .anyMatch(
                                existing ->
                                        existing
                                                .getQuestion()
                                                .getId()
                                                .equals(
                                                        currentQuestion
                                                                .getId()
                                                )
                        );


        if (alreadyAnswered) {

            throw new RuntimeException(
                    "This question has already been answered"
            );
        }


        // -----------------------------------------------------
        // Save answer
        // -----------------------------------------------------

        InterviewAnswer interviewAnswer =
                new InterviewAnswer();

        interviewAnswer.setInterview(
                interview
        );

        interviewAnswer.setQuestion(
                currentQuestion
        );

        interviewAnswer.setAnswer(
                answer.trim()
        );


        interviewAnswerRepository.save(
                interviewAnswer
        );


        // -----------------------------------------------------
        // Check whether this was last question
        // -----------------------------------------------------

        int totalQuestions =
                questions.size();


        boolean lastQuestion =
                interview
                        .getCurrentQuestionOrder()
                        >= totalQuestions;


        if (lastQuestion) {

            interview.setStatus(
                    "COMPLETED"
            );

            interviewRepository.save(
                    interview
            );


            return new InterviewAnswerResponse(

                    interviewId,

                    currentQuestion
                            .getQuestionOrder(),

                    null,

                    totalQuestions,

                    null,

                    true
            );
        }


        // -----------------------------------------------------
        // Move to next question
        // -----------------------------------------------------

        int nextOrder =
                interview
                        .getCurrentQuestionOrder()
                        + 1;


        interview.setCurrentQuestionOrder(
                nextOrder
        );


        interviewRepository.save(
                interview
        );


        InterviewQuestion nextQuestion =
                questions.stream()
                        .filter(q ->
                                q.getQuestionOrder()
                                        .equals(
                                                nextOrder
                                        )
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Next question not found"
                                )
                        );


        return new InterviewAnswerResponse(

                interviewId,

                currentQuestion
                        .getQuestionOrder(),

                nextQuestion
                        .getQuestionOrder(),

                totalQuestions,

                nextQuestion
                        .getQuestion(),

                false
        );
    }


    // =========================================================
    // COMPLETE INTERVIEW
    // =========================================================

    @Transactional
    public Interview completeInterview(
            Long interviewId
    ) {

        Interview interview =
                interviewRepository.findById(
                        interviewId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Interview not found"
                        )
                );


        interview.setStatus(
                "COMPLETED"
        );


        return interviewRepository.save(
                interview
        );
    }


    // =========================================================
    // SAVE VIDEO METRICS
    // =========================================================

    @Transactional
    public InterviewVideoMetrics saveVideoMetrics(
            Long interviewId,
            VideoMetricsRequest request
    ) {

        Interview interview =
                interviewRepository.findById(
                        interviewId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Interview not found"
                        )
                );


        InterviewVideoMetrics metrics =
                interviewVideoMetricsRepository
                        .findByInterviewId(
                                interviewId
                        )
                        .orElseGet(
                                InterviewVideoMetrics::new
                        );


        metrics.setInterview(
                interview
        );


        metrics.setFacePresencePercentage(
                request.facePresencePercentage()
        );


        metrics.setAttentionScore(
                request.attentionScore()
        );


        metrics.setCameraActivePercentage(
                request.cameraActivePercentage()
        );


        metrics.setHeadMovement(
                request.headMovement()
        );


        return interviewVideoMetricsRepository.save(
                metrics
        );
    }
}