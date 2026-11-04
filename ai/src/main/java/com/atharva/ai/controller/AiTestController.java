package com.atharva.ai.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AiTestController {

    private final ChatClient chatClient;

    public AiTestController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @GetMapping("/api/ai/test")
    public ResponseEntity<Map<String, Object>> testAi() {
        Map<String, Object> res = new HashMap<>();
        try {
            String reply = chatClient
                    .prompt()
                    .user("Say hello and confirm that you are working.")
                    .call()
                    .content();
            res.put("status", "SUCCESS");
            res.put("provider", "Groq");
            res.put("reply", reply);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            res.put("status", "ERROR");
            res.put("provider", "Groq");
            res.put("message", "AI inference test failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(res);
        }
    }
}