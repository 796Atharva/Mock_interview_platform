package com.atharva.ai.dto;

public record VideoMetricsRequest(
        Double facePresencePercentage,
        Double attentionScore,
        Double cameraActivePercentage,
        String headMovement
) {
}