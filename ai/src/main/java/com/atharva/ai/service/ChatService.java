package com.atharva.ai.service;

import com.atharva.ai.dto.ChatDto.*;
import com.atharva.ai.entity.Resume;
import com.atharva.ai.repository.ResumeRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final ResumeRepository resumeRepository;

    public ChatService(ChatClient chatClient, ResumeRepository resumeRepository) {
        this.chatClient = chatClient;
        this.resumeRepository = resumeRepository;
    }

    public ChatResponse processCareerGuidance(CareerGuidanceRequest request) {
        String userMessage = request.message() != null ? request.message().trim() : "";
        if (userMessage.isEmpty()) {
            throw new IllegalArgumentException("User message cannot be empty");
        }

        String resumeContext = "";
        if (request.resumeId() != null) {
            Resume resume = resumeRepository.findById(request.resumeId()).orElse(null);
            if (resume != null && resume.getMarkdownContent() != null) {
                resumeContext = resume.getMarkdownContent();
                if (resumeContext.length() > 5000) {
                    resumeContext = resumeContext.substring(0, 5000) + "\n[Resume truncated]";
                }
            }
        }

        String systemPrompt = """
                You are an executive-level Career Architect & Tech Industry Advisor.
                Your objective is to provide highly actionable, rigorous, and personalized career guidance based on the candidate's background.

                %s

                INSTRUCTIONS:
                1. Provide specific, high-salary target roles (e.g. Senior Backend Engineer, Distributed Systems Architect, Full-Stack AI Engineer).
                2. Include match percentage, key technical skill gaps, and a focused 30-60-90 day transition roadmap.
                3. Recommend top-ROI certifications and portfolio projects that demonstrate production competence.
                4. Give realistic compensation ranges and market demand insights.
                5. Format cleanly using Markdown with clear section headings, bullet points, and code/tech terms.
                """.formatted(
                resumeContext.isEmpty()
                        ? "No resume uploaded. Provide top-tier tech industry insights and ask relevant background questions."
                        : "CANDIDATE RESUME SUMMARY & BACKGROUND:\n" + resumeContext
        );

        String conversationHistory = buildHistoryString(request.history());

        String prompt = """
                %s

                CANDIDATE QUERY:
                %s
                """.formatted(conversationHistory, userMessage);

        try {
            String aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(prompt)
                    .call()
                    .content();

            String timeString = LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));
            return new ChatResponse(aiResponse != null ? aiResponse.trim() : "Unable to generate response.", timeString);

        } catch (Exception e) {
            System.err.println("Career guidance Groq error: " + e.getMessage());
            throw new RuntimeException("Failed to generate career guidance: " + e.getMessage(), e);
        }
    }

    public ChatResponse processMentorChat(MentorChatRequest request) {
        String userMessage = request.message() != null ? request.message().trim() : "";
        if (userMessage.isEmpty()) {
            throw new IllegalArgumentException("User message cannot be empty");
        }

        String mode = request.mode() != null ? request.mode().toLowerCase() : "general";

        String modeFocus = switch (mode) {
            case "system-design" -> "System Design & Distributed Scalability. Focus on bottlenecks, caching strategies, partitioning, data replication, and CAP theorem trade-offs.";
            case "technical" -> "Code & Technical Depth. Focus on algorithmic efficiency, concurrency, memory profiling, clean architecture, and edge cases.";
            case "behavioral" -> "Behavioral & STAR Coaching. Focus on framing stories (Situation, Task, Action, Result) with measurable impact, conflict resolution, and leadership ownership.";
            case "negotiation" -> "Offer & Career Negotiation. Focus on leveling benchmarks, total compensation (base + equity + bonus), and counter-offer communication.";
            default -> "Holistic Technical & Career Mentorship. Provide senior engineering perspective, architectural wisdom, and leveling guidance.";
        };

        String systemPrompt = """
                You are Alex Rivera, a seasoned Staff/Principal Engineer with 15+ years of experience leading engineering organizations and interviewing hundreds of candidates at tier-1 tech firms.

                ACTIVE FOCUS MODE:
                %s

                PERSONA GUIDELINES:
                1. Speak warmly, authoritatively, and constructively like an experienced senior mentor who genuinely wants the candidate to succeed.
                2. In System Design questions: Discuss functional/non-functional requirements, schema design, high-level architecture diagrams in text, bottlenecks, and real trade-offs.
                3. In Coding questions: Emphasize time/space complexity (Big-O), thread safety, and edge-case traps.
                4. In Behavioral questions: Critique story framing using the STAR method, insisting on quantifiable impact.
                5. Keep explanations structured, scannable, and direct. Avoid generic filler.
                """.formatted(modeFocus);

        String conversationHistory = buildHistoryString(request.history());

        String prompt = """
                %s

                CANDIDATE QUESTION:
                %s
                """.formatted(conversationHistory, userMessage);

        try {
            String aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(prompt)
                    .call()
                    .content();

            String timeString = LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));
            return new ChatResponse(aiResponse != null ? aiResponse.trim() : "Unable to generate mentor guidance.", timeString);

        } catch (Exception e) {
            System.err.println("Mentor chat Groq error: " + e.getMessage());
            throw new RuntimeException("Failed to generate mentor guidance: " + e.getMessage(), e);
        }
    }

    private String buildHistoryString(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return "";
        }

        // Bound history to the last 6 messages to avoid unbounded token consumption
        int start = Math.max(0, history.size() - 6);
        List<ChatMessage> recent = history.subList(start, history.size());

        StringBuilder sb = new StringBuilder("RECENT CONVERSATION HISTORY:\n");
        for (ChatMessage msg : recent) {
            if (msg.role() != null && msg.content() != null && !msg.content().isBlank()) {
                sb.append(msg.role().equalsIgnoreCase("user") ? "User: " : "Assistant: ")
                  .append(msg.content().trim())
                  .append("\n");
            }
        }
        return sb.toString();
    }
}
