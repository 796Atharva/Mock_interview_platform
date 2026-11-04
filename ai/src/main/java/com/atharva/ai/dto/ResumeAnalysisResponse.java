
package com.atharva.ai.dto;

public record ResumeAnalysisResponse(
        Long resumeId,
        String candidateName,
        String candidateEmail,
        String originalFileName,
        String summary,
        String markdownContent
) {}
