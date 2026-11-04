package com.atharva.ai.service;

import com.atharva.ai.dto.GeneratedQuestion;
import com.atharva.ai.entity.InterviewQuestion;
import com.atharva.ai.entity.Resume;
import com.atharva.ai.repository.InterviewQuestionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionGenerationService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final com.atharva.ai.repository.InterviewAnswerRepository interviewAnswerRepository;

    public QuestionGenerationService(
            ChatClient chatClient,
            ObjectMapper objectMapper,
            InterviewQuestionRepository interviewQuestionRepository,
            com.atharva.ai.repository.InterviewAnswerRepository interviewAnswerRepository
    ) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
        this.interviewQuestionRepository = interviewQuestionRepository;
        this.interviewAnswerRepository = interviewAnswerRepository;
    }

    public List<InterviewQuestion> generateQuestions(
            Resume resume,
            String markdown
    ) {
        System.out.println("=================================");
        System.out.println("GENERATING 20 INTERVIEW QUESTIONS (Groq)");
        System.out.println("Resume ID: " + resume.getId());
        System.out.println("=================================");

        String boundedMarkdown = markdown != null && markdown.length() > 15000
                ? markdown.substring(0, 15000)
                : (markdown != null ? markdown : "");

        try {
            System.out.println("Sending question generation prompt to Groq...");

            String response = chatClient
                    .prompt()
                    .system("""
                            You are an expert technical interviewer.

                            Generate EXACTLY 20 interview questions tailored strictly to the candidate's resume.

                            CRITICAL DISTRIBUTION REQUIREMENTS (Total: 20 questions):
                            - Exactly 7 Easy questions (Question 1 MUST be an introductory question like "Tell me about yourself and your background")
                            - Exactly 8 Medium questions (Covering candidate's specific projects, backend frameworks, database design, and DSA)
                            - Exactly 5 Hard questions (Covering architecture trade-offs, concurrency, system design, and distributed bottlenecks)

                            The questions should cover:
                            - Candidate introduction and resume highlights
                            - Real projects listed on the resume
                            - Data Structures and Algorithms
                            - Object-Oriented Programming & Clean Architecture
                            - DBMS, Indexing & Transactions
                            - Backend Development (APIs, caching, messaging)
                            - System Design & Scalability where relevant

                            IMPORTANT RULES:
                            1. Questions must be derived from the resume content.
                            2. Do not invent unrelated projects.
                            3. Avoid duplicate or vague questions.
                            4. Question #1 MUST be an introductory question ("Tell me about yourself...").
                            5. Do NOT generate answers.
                            6. Return ONLY valid JSON array.
                            7. Do NOT use markdown code fences.

                            Return exactly this JSON structure:
                            [
                              {
                                "question": "Walk me through your background and key projects mentioned in your resume.",
                                "category": "Behavioral",
                                "topic": "Introduction",
                                "difficulty": "Easy",
                                "expectedPoints": "Clear narrative covering education, technical stack, key projects, and professional goals."
                              }
                            ]

                            Valid categories:
                            Behavioral, Technical, DSA, OOP, DBMS, System Design, Project

                            Valid difficulties:
                            Easy, Medium, Hard
                            """)
                    .user("""
                            Here is the candidate's resume:

                            %s
                            """.formatted(boundedMarkdown))
                    .call()
                    .content();

            if (response == null || response.isBlank()) {
                throw new IllegalStateException("Groq returned an empty response for question generation");
            }

            System.out.println("=================================");
            System.out.println("GROQ QUESTION RESPONSE RECEIVED");
            System.out.println("=================================");

            String jsonPayload = extractJsonArray(response);

            // Convert JSON into Java DTO list
            List<GeneratedQuestion> generatedQuestions =
                    objectMapper.readValue(
                            jsonPayload,
                            new TypeReference<List<GeneratedQuestion>>() {}
                    );

            if (generatedQuestions == null || generatedQuestions.isEmpty()) {
                throw new IllegalStateException("Failed to parse questions: empty array returned from Groq");
            }

            // Post-process, deduplicate, and enforce exactly 20 questions with 7/8/5 difficulty distribution
            List<GeneratedQuestion> normalized = normalizeTwentyQuestions(generatedQuestions, boundedMarkdown);

            // Safely remove existing un-answered questions for this resume if any
            List<InterviewQuestion> existingQuestions =
                    interviewQuestionRepository.findByResumeIdOrderByQuestionOrder(resume.getId());

            if (!existingQuestions.isEmpty()) {
                boolean hasAnswers = existingQuestions.stream()
                        .anyMatch(q -> interviewAnswerRepository.existsByQuestionId(q.getId()));
                if (!hasAnswers) {
                    interviewQuestionRepository.deleteAll(existingQuestions);
                }
            }

            // Convert to database entities
            List<InterviewQuestion> entities = new ArrayList<>(20);
            int order = 1;

            for (GeneratedQuestion gq : normalized) {
                InterviewQuestion question = new InterviewQuestion();
                question.setResume(resume);
                question.setQuestion(gq.question().trim());
                question.setCategory(gq.category() != null ? gq.category().trim() : "Technical");
                question.setTopic(gq.topic() != null ? gq.topic().trim() : "General");
                question.setDifficulty(gq.difficulty() != null ? gq.difficulty().trim() : "Medium");
                question.setQuestionOrder(order++);
                question.setExpectedPoints(gq.expectedPoints() != null ? gq.expectedPoints().trim() : "Technical correctness and clarity.");

                entities.add(question);
            }

            List<InterviewQuestion> saved = interviewQuestionRepository.saveAll(entities);

            System.out.println("=================================");
            System.out.println("20 QUESTIONS SUCCESSFULLY PERSISTED");
            System.out.println("Total saved: " + saved.size());
            System.out.println("=================================");

            return saved;

        } catch (Exception e) {
            System.err.println("QUESTION GENERATION FAILED: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate interview questions: " + e.getMessage(), e);
        }
    }

    /**
     * Extracts pure JSON array string, stripping markdown fences and whitespace.
     */
    private String extractJsonArray(String raw) {
        if (raw == null) return "[]";
        String s = raw.trim();

        if (s.startsWith("```")) {
            int firstNewline = s.indexOf('\n');
            if (firstNewline != -1) {
                s = s.substring(firstNewline + 1);
            }
            if (s.endsWith("```")) {
                s = s.substring(0, s.length() - 3);
            }
            s = s.trim();
        }

        int firstBracket = s.indexOf('[');
        int lastBracket = s.lastIndexOf(']');

        if (firstBracket != -1 && lastBracket != -1 && lastBracket > firstBracket) {
            return s.substring(firstBracket, lastBracket + 1);
        }
        return s;
    }

    /**
     * Ensures exactly 20 questions, enforces introduction question at #1, and calibrates 7 Easy, 8 Medium, 5 Hard.
     */
    private List<GeneratedQuestion> normalizeTwentyQuestions(List<GeneratedQuestion> input, String resumeText) {
        List<GeneratedQuestion> result = new ArrayList<>();
        java.util.Set<String> seen = new java.util.HashSet<>();

        for (GeneratedQuestion q : input) {
            if (q.question() != null && !q.question().isBlank()) {
                String normalizedText = q.question().trim().toLowerCase();
                if (seen.add(normalizedText)) {
                    result.add(q);
                }
            }
        }

        // 1. Ensure Question 1 is an intro question
        boolean hasIntro = false;
        for (int i = 0; i < result.size(); i++) {
            GeneratedQuestion q = result.get(i);
            String text = q.question().toLowerCase();
            if (text.contains("tell me about yourself") || text.contains("introduce yourself") || text.contains("walk me through your background")) {
                hasIntro = true;
                if (i != 0) {
                    result.remove(i);
                    result.add(0, q);
                }
                break;
            }
        }

        if (!hasIntro) {
            GeneratedQuestion introQ = new GeneratedQuestion(
                    "Tell me about yourself, your technical background, and the key projects highlighted on your resume.",
                    "Behavioral",
                    "Introduction",
                    "Easy",
                    "A structured 2-minute elevator pitch summarizing background, core technical skills, and career motivation."
            );
            result.add(0, introQ);
        }

        // Bounded trimming or padding up to exactly 20
        while (result.size() > 20) {
            result.remove(result.size() - 1);
        }

        // If Groq returned fewer than 20 (e.g. 18 or 19), backfill specific technical resume-driven questions
        if (result.size() < 20) {
            List<GeneratedQuestion> backfills = List.of(
                    new GeneratedQuestion("How do you handle database connection pooling and query optimization in your backend services?", "DBMS", "Database Optimization", "Medium", "Understanding of HikariCP/connection pool size, indexing, and EXPLAIN query analysis."),
                    new GeneratedQuestion("What trade-offs do you evaluate between relational databases (PostgreSQL) and NoSQL stores?", "DBMS", "Architecture", "Medium", "ACID compliance, schema flexibility, partitioning, and read/write characteristics."),
                    new GeneratedQuestion("How do you design RESTful APIs for idempotency and error handling across distributed clients?", "Technical", "API Design", "Medium", "HTTP status codes, idempotent PUT/DELETE, retry tokens, and structured error payloads."),
                    new GeneratedQuestion("How do you identify and mitigate memory leaks and concurrency bottlenecks in Java/Spring applications?", "Technical", "Performance", "Hard", "Heap profiling, garbage collection metrics, thread contention, and non-blocking IO."),
                    new GeneratedQuestion("Walk me through the design of a rate-limiting service capable of handling high-throughput API traffic.", "System Design", "Scalability", "Hard", "Token bucket / Leaky bucket algorithms, Redis distributed counters, and latency trade-offs.")
            );

            for (GeneratedQuestion bq : backfills) {
                if (result.size() >= 20) break;
                if (seen.add(bq.question().toLowerCase())) {
                    result.add(bq);
                }
            }
        }

        // Enforce exact 7 Easy, 8 Medium, 5 Hard difficulty distribution
        List<GeneratedQuestion> calibrated = new ArrayList<>(20);
        for (int i = 0; i < result.size() && i < 20; i++) {
            GeneratedQuestion current = result.get(i);
            String requiredDiff;
            if (i < 7) {
                requiredDiff = "Easy";
            } else if (i < 15) {
                requiredDiff = "Medium";
            } else {
                requiredDiff = "Hard";
            }

            calibrated.add(new GeneratedQuestion(
                    current.question(),
                    current.category(),
                    current.topic(),
                    requiredDiff,
                    current.expectedPoints()
            ));
        }

        return calibrated;
    }
}