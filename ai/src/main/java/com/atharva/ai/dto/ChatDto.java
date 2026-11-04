package com.atharva.ai.dto;

import java.util.List;

public class ChatDto {

    public record ChatMessage(
            String role,
            String content
    ) {}

    public record CareerGuidanceRequest(
            String message,
            Long resumeId,
            List<ChatMessage> history
    ) {}

    public record MentorChatRequest(
            String message,
            String mode,
            List<ChatMessage> history
    ) {}

    public record ChatResponse(
            String response,
            String timestamp
    ) {}
}
