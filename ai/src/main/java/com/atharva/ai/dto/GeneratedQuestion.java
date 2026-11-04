package com.atharva.ai.dto;

public record GeneratedQuestion(
        String question,
        String category,
        String topic,
        String difficulty,
        String expectedPoints
) {
}