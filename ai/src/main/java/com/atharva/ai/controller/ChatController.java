package com.atharva.ai.controller;

import com.atharva.ai.dto.ChatDto.CareerGuidanceRequest;
import com.atharva.ai.dto.ChatDto.ChatResponse;
import com.atharva.ai.dto.ChatDto.MentorChatRequest;
import com.atharva.ai.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/career-guidance")
    public ResponseEntity<ChatResponse> careerGuidance(@RequestBody CareerGuidanceRequest request) {
        ChatResponse response = chatService.processCareerGuidance(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mentor")
    public ResponseEntity<ChatResponse> mentorChat(@RequestBody MentorChatRequest request) {
        ChatResponse response = chatService.processMentorChat(request);
        return ResponseEntity.ok(response);
    }
}
