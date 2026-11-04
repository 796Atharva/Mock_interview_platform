package com.atharva.ai.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ResumeAnalysisService {

    private final ChatClient chatClient;

    public ResumeAnalysisService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public String analyzeResume(String markdown) {

        if (markdown == null || markdown.isBlank()) {
            throw new IllegalArgumentException(
                    "Resume content is empty"
            );
        }

        String boundedMarkdown = markdown.length() > 15000
                ? markdown.substring(0, 15000) + "\n\n[Content truncated for analysis]"
                : markdown;

        System.out.println("=================================");
        System.out.println("Calling Groq LLM for Resume Analysis...");
        System.out.println("Resume length: " + boundedMarkdown.length());
        System.out.println("=================================");

        try {

            String summary = chatClient
                    .prompt()
                    .system("""
                            You are an expert resume analyzer.

                            Analyze the candidate's resume and generate
                            a concise professional summary.

                            The summary should include:

                            - Candidate's background
                            - Education
                            - Main technical skills
                            - Important projects
                            - Backend/software development experience
                            - AI/ML technologies if present
                            - Important technologies
                            - Potential technical areas for an interview

                            IMPORTANT RULES:

                            1. Do not invent information.
                            2. Use only information present in the resume.
                            3. Do not repeat the entire resume.
                            4. Keep the summary concise but useful.
                            5. Return Markdown only.
                            6. Do not return JSON.
                            7. Do not use ```markdown.
                            8. Start directly with:

                            ## AI Resume Summary
                            """)
                    .user("""
                            Analyze this resume:

                            %s
                            """.formatted(boundedMarkdown))
                    .call()
                    .content();

            if (summary == null || summary.isBlank()) {
                throw new RuntimeException(
                        "Groq LLM returned an empty summary"
                );
            }

            System.out.println("=================================");
            System.out.println("GROQ SUMMARY RECEIVED");
            System.out.println("=================================");
            System.out.println(summary);
            System.out.println("=================================");

            return summary.trim();

        } catch (Exception e) {

            System.err.println("GROQ RESUME ANALYSIS FAILED: " + e.getMessage());

            throw new RuntimeException(
                    "Failed to generate resume summary: " + e.getMessage(),
                    e
            );
        }
    }
}