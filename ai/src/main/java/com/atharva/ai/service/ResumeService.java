
package com.atharva.ai.service;

import com.atharva.ai.dto.ResumeAnalysisResponse;
import com.atharva.ai.entity.Candidate;
import com.atharva.ai.entity.Resume;
import com.atharva.ai.repository.CandidateRepository;
import com.atharva.ai.repository.ResumeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeService {

    private final CandidateRepository candidateRepository;
    private final ResumeRepository resumeRepository;
    private final DocumentExtractionService documentExtractionService;
    private final MarkdownResumeService markdownResumeService;
    private final ResumeAnalysisService resumeAnalysisService;
    private final QuestionGenerationService questionGenerationService;

    public ResumeService(
            CandidateRepository candidateRepository,
            ResumeRepository resumeRepository,
            DocumentExtractionService documentExtractionService,
            MarkdownResumeService markdownResumeService,
            ResumeAnalysisService resumeAnalysisService,
            QuestionGenerationService questionGenerationService
    ) {
        this.candidateRepository = candidateRepository;
        this.resumeRepository = resumeRepository;
        this.documentExtractionService = documentExtractionService;
        this.markdownResumeService = markdownResumeService;
        this.resumeAnalysisService = resumeAnalysisService;
        this.questionGenerationService = questionGenerationService;
    }

    // ==========================================
    // PROCESS AND SAVE RESUME
    // ==========================================

    public Resume processResume(
            MultipartFile file,
            String name,
            String email
    ) {

        try {

            // 1. Validate input

            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException(
                        "Resume file is empty"
                );
            }

            if (name == null || name.isBlank()) {
                throw new IllegalArgumentException(
                        "Candidate name is required"
                );
            }

            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException(
                        "Candidate email is required"
                );
            }

            System.out.println("=================================");
            System.out.println("PROCESSING RESUME");
            System.out.println("Name  : " + name);
            System.out.println("Email : " + email);
            System.out.println("File  : " + file.getOriginalFilename());
            System.out.println("=================================");

            // 2. Find or create candidate

            Candidate candidate = candidateRepository
                    .findByEmail(email)
                    .orElseGet(() -> {
                        Candidate newCandidate = new Candidate();
                        newCandidate.setName(name);
                        newCandidate.setEmail(email);

                        return candidateRepository.save(newCandidate);
                    });

            // 3. Extract text

            String extractedText =
                    documentExtractionService.extractText(file);

            if (extractedText == null || extractedText.isBlank()) {
                throw new RuntimeException(
                        "Could not extract text from resume"
                );
            }

            System.out.println(
                    "Text extraction successful. Length: "
                            + extractedText.length()
            );

            // 4. Convert resume to Markdown

            String markdown =
                    markdownResumeService.convertToMarkdown(extractedText);

            if (markdown == null || markdown.isBlank()) {
                throw new RuntimeException(
                        "Failed to convert resume to Markdown"
                );
            }

            System.out.println(
                    "Markdown conversion successful. Length: "
                            + markdown.length()
            );

            // 5. Generate AI summary

            String aiSummary =
                    resumeAnalysisService.analyzeResume(markdown);

            if (aiSummary == null || aiSummary.isBlank()) {
                throw new RuntimeException(
                        "AI resume summary is empty"
                );
            }

            System.out.println("AI summary generated successfully.");

            // 6. Append the AI summary to the original Markdown

            String finalMarkdown =
                    markdown
                            + "\n\n## AI-Generated Summary\n\n"
                            + aiSummary;

            // 7. Create Resume entity

            Resume resume = new Resume();

            resume.setCandidate(candidate);
            resume.setOriginalFileName(file.getOriginalFilename());
            resume.setMarkdownContent(finalMarkdown);

            // The current pipeline stores Markdown, not structured JSON.
            resume.setParsedResumeJson(null);

            // 8. Save resume

            Resume savedResume = resumeRepository.save(resume);

            System.out.println("=================================");
            System.out.println("RESUME SAVED SUCCESSFULLY");
            System.out.println("Resume ID: " + savedResume.getId());
            System.out.println("Candidate ID: " + candidate.getId());
            System.out.println("=================================");

            // 9. Generate interview questions

            System.out.println("STARTING QUESTION GENERATION");

            questionGenerationService.generateQuestions(
                    savedResume,
                    finalMarkdown
            );

            // 10. Return saved resume

            return savedResume;

        } catch (Exception e) {

            System.err.println("RESUME PROCESSING FAILED");
            e.printStackTrace();

            throw new RuntimeException(
                    "Failed to process resume: " + e.getMessage(),
                    e
            );
        }
    }

    // ==========================================
    // GET RESUME ANALYSIS
    // ==========================================

    @Transactional(readOnly = true)
    public ResumeAnalysisResponse getResumeAnalysis(Long resumeId) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Resume not found: " + resumeId
                        )
                );

        String markdown = resume.getMarkdownContent();
        String summary = "";

        if (markdown != null) {

            String heading = "## AI-Generated Summary";

            int summaryStart = markdown.lastIndexOf(heading);

            if (summaryStart >= 0) {
                summary = markdown.substring(
                        summaryStart + heading.length()
                ).trim();
            }
        }

        Candidate candidate = resume.getCandidate();

        return new ResumeAnalysisResponse(
                resume.getId(),
                candidate.getName(),
                candidate.getEmail(),
                resume.getOriginalFileName(),
                summary,
                markdown
        );
    }
}
