package com.atharva.ai.controller;

import com.atharva.ai.dto.InterviewAnswerResponse;
import com.atharva.ai.dto.InterviewReportResponse;
import com.atharva.ai.dto.InterviewStartResponse;
import com.atharva.ai.dto.VideoMetricsRequest;
import com.atharva.ai.service.InterviewEvaluationService;
import com.atharva.ai.service.InterviewReportService;
import com.atharva.ai.service.InterviewService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewService interviewService;
    private final InterviewEvaluationService interviewEvaluationService;
    private final InterviewReportService interviewReportService;

    public InterviewController(
            InterviewService interviewService,
            InterviewEvaluationService interviewEvaluationService,
            InterviewReportService interviewReportService
    ) {
        this.interviewService = interviewService;
        this.interviewEvaluationService = interviewEvaluationService;
        this.interviewReportService = interviewReportService;
    }

    // ==========================================
    // START INTERVIEW
    // ==========================================

    @PostMapping("/start/{resumeId}")
    public ResponseEntity<InterviewStartResponse> startInterview(
            @PathVariable Long resumeId
    ) {

        InterviewStartResponse response =
                interviewService.startInterview(resumeId);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // GET CURRENT QUESTION
    // ==========================================

    @GetMapping("/{interviewId}/current")
    public ResponseEntity<InterviewStartResponse> getCurrentQuestion(
            @PathVariable Long interviewId
    ) {

        InterviewStartResponse response =
                interviewService.getCurrentQuestion(interviewId);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // SAVE ANSWER
    // ==========================================

    @PostMapping("/{interviewId}/answer")
    public ResponseEntity<InterviewAnswerResponse> saveAnswer(
            @PathVariable Long interviewId,
            @RequestBody AnswerRequest request
    ) {

        InterviewAnswerResponse response =
                interviewService.saveAnswer(
                        interviewId,
                        request.answer()
                );

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // COMPLETE INTERVIEW
    // ==========================================

    @PostMapping("/{interviewId}/complete")
    public ResponseEntity<String> completeInterview(
            @PathVariable Long interviewId
    ) {

        interviewService.completeInterview(interviewId);

        return ResponseEntity.ok(
                "Interview completed successfully"
        );
    }

    // ==========================================
    // SAVE VIDEO METRICS
    // ==========================================

    @PostMapping("/{interviewId}/video-metrics")
    public ResponseEntity<String> saveVideoMetrics(
            @PathVariable Long interviewId,
            @RequestBody VideoMetricsRequest request
    ) {

        interviewService.saveVideoMetrics(
                interviewId,
                request
        );

        return ResponseEntity.ok(
                "Video metrics saved successfully"
        );
    }

    // ==========================================
    // EVALUATE INDIVIDUAL ANSWERS
    // ==========================================

    @PostMapping("/{interviewId}/evaluate")
    public ResponseEntity<String> evaluateInterview(
            @PathVariable Long interviewId
    ) {

        interviewEvaluationService.evaluateInterview(
                interviewId
        );

        return ResponseEntity.ok(
                "Interview evaluated successfully"
        );
    }

    // ==========================================
    // GENERATE FINAL REPORT
    // ==========================================

    @PostMapping("/{interviewId}/report")
    public ResponseEntity<InterviewReportResponse> generateReport(
            @PathVariable Long interviewId
    ) {

        InterviewReportResponse report =
                interviewReportService.generateReport(
                        interviewId
                );

        return ResponseEntity.ok(report);
    }

    // ==========================================
    // GET FINAL REPORT
    // ==========================================

    @GetMapping("/{interviewId}/report")
    public ResponseEntity<InterviewReportResponse> getReport(
            @PathVariable Long interviewId
    ) {

        InterviewReportResponse report =
                interviewReportService.getReport(
                        interviewId
                );

        return ResponseEntity.ok(report);
    }

    // ==========================================
    // ANSWER REQUEST
    // ==========================================

    public record AnswerRequest(
            String answer
    ) {
    }
}