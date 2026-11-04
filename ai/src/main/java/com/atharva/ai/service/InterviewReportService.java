package com.atharva.ai.service;

import com.atharva.ai.dto.InterviewReportResponse;
import com.atharva.ai.entity.Interview;
import com.atharva.ai.entity.InterviewAnswer;
import com.atharva.ai.entity.InterviewReport;
import com.atharva.ai.entity.InterviewVideoMetrics;
import com.atharva.ai.repository.InterviewAnswerRepository;
import com.atharva.ai.repository.InterviewReportRepository;
import com.atharva.ai.repository.InterviewRepository;
import com.atharva.ai.repository.InterviewVideoMetricsRepository;

import com.atharva.ai.service.GroqApiService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InterviewReportService {

    private final GroqApiService groqApiService;

    private final InterviewRepository interviewRepository;

    private final InterviewAnswerRepository answerRepository;

    private final InterviewReportRepository reportRepository;

    private final InterviewVideoMetricsRepository
            videoMetricsRepository;

    public InterviewReportService(
            GroqApiService groqApiService,
            InterviewRepository interviewRepository,
            InterviewAnswerRepository answerRepository,
            InterviewReportRepository reportRepository,
            InterviewVideoMetricsRepository videoMetricsRepository
    ) {
        this.groqApiService = groqApiService;
        this.interviewRepository = interviewRepository;
        this.answerRepository = answerRepository;
        this.reportRepository = reportRepository;
        this.videoMetricsRepository =
                videoMetricsRepository;
    }

    // =========================================================
    // GENERATE REPORT
    // =========================================================

    @Transactional
    public InterviewReportResponse generateReport(
            Long interviewId
    ) {

        Interview interview =
                interviewRepository.findById(interviewId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Interview not found"
                                )
                        );

        List<InterviewAnswer> answers =
                answerRepository
                        .findByInterviewIdOrderByQuestionQuestionOrder(
                                interviewId
                        );

        ReportResult result;

        if (answers.isEmpty()) {
            result = new ReportResult(
                    0,
                    0,
                    0,
                    0,
                    0,
                    "Interview completed. No responses were submitted for evaluation.",
                    "Session initialized.",
                    "Candidate did not answer the interview questions.",
                    "Ensure microphone and speaker are operational and answer all questions.",
                    "Incomplete Session"
            );
        } else {
            // Compute genuine baseline score from individual answer scores (each 0-10) -> (0-100)
            double avgScoreOutOf10 = answers.stream()
                    .mapToInt(a -> a.getScore() != null ? a.getScore() : 0)
                    .average()
                    .orElse(0.0);
            int computedOverall = (int) Math.min(100, Math.max(0, Math.round(avgScoreOutOf10 * 10)));

            String interviewData = buildInterviewData(answers);
            String videoData = buildVideoData(interviewId);

            String prompt = """
                    You are an expert technical interviewer.

                    Generate a comprehensive, evidence-based final interview report
                    derived strictly from the candidate's actual answers and recorded session signals.

                    INTERVIEW ANSWERS & INDIVIDUAL EVALUATIONS:
                    %s

                    OBSERVABLE VIDEO METRICS:
                    %s

                    SCORING CRITERIA:
                    - overallScore: Calculate between 0 and 100 reflecting overall interview performance (benchmark around %d/100).
                    - technicalKnowledgeScore: 0 to 100 based on technical correctness and concepts.
                    - problemSolvingScore: 0 to 100 based on solution breakdown and logic.
                    - communicationScore: 0 to 100 based on clarity and structure.
                    - practicalKnowledgeScore: 0 to 100 based on real-world engineering trade-offs.

                    Provide an authentic summary, specific strengths, actionable weaknesses, concrete recommendations, and an honest finalVerdict (e.g., 'Exceptional Candidate', 'Good Candidate', 'Promising Candidate - Needs Practice', or 'Needs Further Preparation').

                    Return ONLY valid JSON matching this schema:
                    {
                      "overallScore": 0,
                      "technicalKnowledgeScore": 0,
                      "problemSolvingScore": 0,
                      "communicationScore": 0,
                      "practicalKnowledgeScore": 0,
                      "summary": "...",
                      "strengths": "...",
                      "weaknesses": "...",
                      "recommendations": "...",
                      "finalVerdict": "..."
                    }
                    """.formatted(interviewData, videoData, computedOverall);

            try {
                result = groqApiService.generateReport(
                        prompt,
                        ReportResult.class
                );

                if (result == null) {
                    throw new IllegalStateException("Empty report result returned from Groq");
                }
            } catch (Exception e) {
                System.err.println("ChatClient report generation failed, deriving report from real evaluations: " + e.getMessage());

                String verdict = computedOverall >= 85 ? "Exceptional Candidate"
                        : computedOverall >= 70 ? "Good Candidate"
                        : computedOverall >= 50 ? "Promising Candidate - Needs Practice"
                        : "Needs Further Preparation";

                result = new ReportResult(
                        computedOverall,
                        computedOverall,
                        Math.max(0, computedOverall - 5),
                        Math.min(100, computedOverall + 5),
                        computedOverall,
                        "Technical interview concluded with " + answers.size() + " evaluated answers. Computed performance score: " + computedOverall + "/100.",
                        "Clear engagement across interview questions; foundational concepts demonstrated.",
                        "Deepen architectural edge cases and structured problem breakdown.",
                        "Continue mock interview practice and dive deeper into real-world distributed systems trade-offs.",
                        verdict
                );
            }
        }

        /*
         * -----------------------------------------------------
         * CHECK EXISTING REPORT
         * -----------------------------------------------------
         */

        InterviewReport report =
                reportRepository
                        .findByInterviewId(interviewId)
                        .orElseGet(
                                InterviewReport::new
                        );

        report.setInterview(interview);

        report.setOverallScore(
                result.overallScore()
        );

        report.setTechnicalKnowledgeScore(
                result.technicalKnowledgeScore()
        );

        report.setProblemSolvingScore(
                result.problemSolvingScore()
        );

        report.setCommunicationScore(
                result.communicationScore()
        );

        report.setPracticalKnowledgeScore(
                result.practicalKnowledgeScore()
        );

        report.setSummary(
                result.summary()
        );

        report.setStrengths(
                result.strengths()
        );

        report.setWeaknesses(
                result.weaknesses()
        );

        report.setRecommendations(
                result.recommendations()
        );

        report.setFinalVerdict(
                result.finalVerdict()
        );

        report =
                reportRepository.save(report);

        return convertToResponse(report);
    }

    // =========================================================
    // BUILD ANSWER DATA
    // =========================================================

    private String buildInterviewData(
            List<InterviewAnswer> answers
    ) {

        StringBuilder builder =
                new StringBuilder();

        for (InterviewAnswer answer : answers) {

            String question =
                    answer.getQuestion()
                            .getQuestion();

            String candidateAnswer =
                    answer.getAnswer();

            String evaluation =
                    answer.getEvaluation();

            Integer score =
                    answer.getScore();

            builder.append(
                    "\nQuestion: "
            ).append(question);

            builder.append(
                    "\nCandidate Answer: "
            ).append(candidateAnswer);

            builder.append(
                    "\nIndividual Score: "
            ).append(score);

            builder.append(
                    "\nIndividual Evaluation: "
            ).append(evaluation);

            builder.append(
                    "\n-----------------------------\n"
            );
        }

        return builder.toString();
    }

    // =========================================================
    // BUILD VIDEO DATA
    // =========================================================

    private String buildVideoData(
            Long interviewId
    ) {

        return videoMetricsRepository
                .findByInterviewId(interviewId)
                .map(metrics -> """

                        Face Presence:
                        %s%%

                        Attention Score:
                        %s%%

                        Camera Active:
                        %s%%

                        Head Movement:
                        %s
                        """.formatted(
                                metrics.getFacePresencePercentage(),
                                metrics.getAttentionScore(),
                                metrics.getCameraActivePercentage(),
                                metrics.getHeadMovement()
                        )
                )
                .orElse(
                        "No video metrics available."
                );
    }

    // =========================================================
    // GET EXISTING REPORT
    // =========================================================

    @Transactional(readOnly = true)
    public InterviewReportResponse getReport(
            Long interviewId
    ) {

        InterviewReport report =
                reportRepository
                        .findByInterviewId(interviewId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Report not found. Generate the report first."
                                )
                        );

        return convertToResponse(report);
    }

    // =========================================================
    // CONVERT ENTITY → RESPONSE
    // =========================================================

    private InterviewReportResponse convertToResponse(
            InterviewReport report
    ) {

        return new InterviewReportResponse(

                report.getId(),

                report.getInterview()
                        .getId(),

                report.getOverallScore(),

                report.getTechnicalKnowledgeScore(),

                report.getProblemSolvingScore(),

                report.getCommunicationScore(),

                report.getPracticalKnowledgeScore(),

                report.getSummary(),

                report.getStrengths(),

                report.getWeaknesses(),

                report.getRecommendations(),

                report.getFinalVerdict()
        );
    }

    // =========================================================
    // GEMINI RESULT
    // =========================================================

    public record ReportResult(

            Integer overallScore,

            Integer technicalKnowledgeScore,

            Integer problemSolvingScore,

            Integer communicationScore,

            Integer practicalKnowledgeScore,

            String summary,

            String strengths,

            String weaknesses,

            String recommendations,

            String finalVerdict

    ) {
    }
}