package com.atharva.ai.dto;

public record InterviewReportResponse(

        Long reportId,

        Long interviewId,

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