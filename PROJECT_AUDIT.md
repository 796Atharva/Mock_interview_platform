# PROJECT AUDIT: AI MOCK INTERVIEW PLATFORM

**Audit Date:** 2026-10-26  
**Auditor:** Senior Full-Stack & AI Systems Engineer  
**Repository:** `Mock_interview_platform-main`  
**Target Architecture:** React (Vite) Frontend + Spring Boot (Java 25, PostgreSQL) Backend + Groq LLM + Vapi Voice + MediaPipe Vision

---

## Executive Summary

A comprehensive inspection of the entire codebase was conducted across frontend, backend, database, AI integrations, voice, video, authentication, and security.

The platform architecture has sound foundations (Spring Data JPA entities, React 19 UI with rich CSS styling, MediaPipe task vision assets, and Tika document extraction). However, several critical and high-severity root-cause issues prevent it from working end-to-end:

1. **AI Integration**: Backend configured for Google GenAI with an invalid hardcoded API key and non-existent model (`gemini-3.5-flash`), whereas the project requires **Groq** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) via environment variables (`GROQ_API_KEY`).
2. **Client-Side AI Leaks & Fake Data**: The frontend (`CareerGuidance.jsx`, `MentorChat.jsx`, `geminiService.js`) directly called Gemini REST APIs from the client with dummy fallbacks, rather than routing chatbot requests through the Spring Boot backend.
3. **Question Generation Schema & Anti-Fragility**: The question generation prompt expects 20 questions (7 Easy, 8 Medium, 5 Hard, including self-introduction), but lacked JSON fence stripping, distribution validation, and graceful recovery, causing JSON parse crashes during resume upload.
4. **Foreign Key Integrity**: Deleting questions on resume re-upload failed when interview answers already referenced those questions (`FK constraint violation`).
5. **Answer Evaluation & Report Fabrications**: Silent fallback to fake scores (75/78) when LLM calls failed, directly violating production requirements against fabricated evaluations.
6. **Security & Secrets**: Hardcoded credentials in `application.properties` and uncontrolled Spring Security auto-generated password warnings.

---

## Detailed Issue Registry

### Category 1: AI Integration & Model Provider (Groq vs Gemini)

#### Issue AI-01: Hardcoded Gemini Credentials & Incompatible Model in Backend
- **Affected File:** `ai/src/main/resources/application.properties`, `ai/pom.xml`, `ai/src/main/java/com/atharva/ai/config/AiConfig.java`
- **Error / Incorrect Behavior:** Backend configured with `spring.ai.google.genai.api-key=AQ.Ab8RN6L4...` and `spring.ai.google.genai.chat.options.model=gemini-3.5-flash`. Fails or relies on dead Gemini access; hardcoded secret committed to repo.
- **Root Cause:** Incomplete migration to Groq as mandated. Spring AI Google GenAI starter used instead of Groq/OpenAI-compatible client.
- **Severity:** Critical
- **Required Fix:** Replace Google GenAI starter with OpenAI starter configured for Groq base URL (`https://api.groq.com/openai/v1`) or custom Groq client. Read `GROQ_API_KEY` from environment. Use supported Groq model (`llama-3.3-70b-versatile` or `llama-3.1-8b-instant`). Never hardcode secrets.
- **Verification Method:** Check `application.properties`, test application context initialization, call `/api/ai/test`.

#### Issue AI-02: Frontend Direct Gemini Calls & Client-Side Secrets Exposure
- **Affected File:** `frontend/src/services/geminiService.js`, `frontend/src/pages/CareerGuidance.jsx`, `frontend/src/pages/MentorChat.jsx`, `frontend/.env`
- **Error / Incorrect Behavior:** Frontend calls Google GenAI directly from the browser using client environment variables (`VITE_GEMINI_CAREER_KEY`, `VITE_GEMINI_MENTOR_KEY`), bypassing backend and returning canned fake strings on error.
- **Root Cause:** Chatbot features were implemented purely in React frontend without backend endpoints.
- **Severity:** High
- **Required Fix:** Implement backend REST endpoints (`/api/chat/career-guidance` and `/api/chat/mentor`) that utilize the Spring Boot Groq service. Route frontend chat calls to these backend endpoints.
- **Verification Method:** Test chatbot API requests from frontend through Spring Boot backend, verify responses originate from Groq without frontend API keys.

---

### Category 2: Resume Processing & Document Extraction

#### Issue RES-01: Fragile MIME Type Checking in Document Extraction
- **Affected File:** `ai/src/main/java/com/atharva/ai/service/DocumentExtractionService.java`
- **Error / Incorrect Behavior:** Rejects valid resumes if `file.getContentType()` is `application/octet-stream` or slightly non-standard.
- **Root Cause:** Strict equality check against `application/pdf` and single DOCX MIME string without examining filename extension or Tika auto-detection.
- **Severity:** Medium
- **Required Fix:** Combine MIME check with filename extension check (`.pdf`, `.docx`) and fallback to Tika stream inspection.
- **Verification Method:** Test upload with PDF files having different MIME headers.

#### Issue RES-02: Markdown Summary Stripping / Unbounded Token Risk
- **Affected File:** `ai/src/main/java/com/atharva/ai/service/ResumeService.java`, `ai/src/main/java/com/atharva/ai/service/ResumeAnalysisService.java`
- **Error / Incorrect Behavior:** Full un-truncated document text passed directly to LLM; if document is excessively large, Groq token limits are breached.
- **Root Cause:** Absence of input length sanitization before prompt building.
- **Severity:** Medium
- **Required Fix:** Bound input markdown to a reasonable limit (e.g. 15,000 characters), ensuring prompt token limits are respected.
- **Verification Method:** Test upload with a large multi-page PDF resume.

---

### Category 3: Question Generation & Difficulty Distribution

#### Issue QG-01: JSON Code Fence Markdown Parsing Failure
- **Affected File:** `ai/src/main/java/com/atharva/ai/service/QuestionGenerationService.java`
- **Error / Incorrect Behavior:** Groq/LLMs often enclose JSON responses in ```` ```json ... ``` ````. `ObjectMapper.readValue` fails with `JsonParseException`, causing resume upload to fail with HTTP 400/500.
- **Root Cause:** Direct parsing of raw LLM string without stripping markdown fences.
- **Severity:** High
- **Required Fix:** Clean and extract JSON substring (remove markdown fences, trim whitespace, locate `[` and `]`) before deserialization.
- **Verification Method:** Test question generation with fenced JSON string and verify successful object mapping.

#### Issue QG-02: Missing Validation for 20 Questions Distribution & Intro Question
- **Affected File:** `ai/src/main/java/com/atharva/ai/service/QuestionGenerationService.java`
- **Error / Incorrect Behavior:** Number of questions and difficulty distribution (7 Easy, 8 Medium, 5 Hard) is unvalidated; intro question ("Tell me about yourself") is not guaranteed.
- **Root Cause:** Reliance on LLM prompt adherence without backend validation and normalization.
- **Severity:** High
- **Required Fix:** Implement a validator and post-processor in `QuestionGenerationService`:
  1. Validate count and ensure exactly 20 questions.
  2. Normalize difficulty distribution (7 Easy, 8 Medium, 5 Hard).
  3. Ensure Question #1 is an introduction question based on resume.
- **Verification Method:** Unit test `QuestionGenerationService` to confirm exactly 20 questions with 7/8/5 difficulty and intro question.

#### Issue QG-03: Foreign Key Constraint Violation on Re-upload
- **Affected File:** `ai/src/main/java/com/atharva/ai/service/QuestionGenerationService.java`
- **Error / Incorrect Behavior:** `interviewQuestionRepository.deleteAll(existingQuestions)` throws `DataIntegrityViolationException` if an interview answer references an existing question.
- **Root Cause:** Database cascade or orphan deletion not configured on `InterviewAnswer -> InterviewQuestion`.
- **Severity:** Medium
- **Required Fix:** Only delete questions that are not referenced by existing answers, or handle existing sessions properly.
- **Verification Method:** Re-upload a resume for an existing candidate who has started an interview.

---

### Category 4: Interview Execution & Voice Synchronization

#### Issue INT-01: Vapi Voice & Spoken Question Synchronization
- **Affected File:** `frontend/src/pages/Interview.jsx`
- **Error / Incorrect Behavior:** Potential microphone feedback loop if speech transcript captures AI interviewer speaking the question.
- **Root Cause:** Audio echo from speaker to microphone before assistant finishes speaking.
- **Severity:** Medium
- **Required Fix:** Anti-loop guards (AI speech cooldown timer, question text echo suppression, auto-advance debounce) are verified and strengthened to ensure question displayed on screen matches question spoken by Vapi.
- **Verification Method:** Inspect event listeners in `Interview.jsx`, simulate rapid transcript events.

---

### Category 5: Answer Evaluation & Reporting

#### Issue EVAL-01: Sequential Individual LLM Calls Causing Timeout / Rate Limits
- **Affected File:** `ai/src/main/java/com/atharva/ai/service/InterviewEvaluationService.java`
- **Error / Incorrect Behavior:** Iterating through 20 questions one by one with individual synchronous LLM calls causes request timeouts or HTTP 429 rate limits.
- **Root Cause:** Loop with 20 sequential calls instead of batch evaluation or efficient bounded execution.
- **Severity:** High
- **Required Fix:** Optimize evaluation to evaluate answers in concise batch prompts or handle rate limits with backoff; validate scores between 0 and 10.
- **Verification Method:** Test interview evaluation with multiple answers.

#### Issue EVAL-02: Fake Data Replacement in Report Generation
- **Affected File:** `ai/src/main/java/com/atharva/ai/service/InterviewReportService.java`, `frontend/src/pages/Report.jsx`
- **Error / Incorrect Behavior:** Fallback objects with fabricated scores (75, 78) and canned text were used whenever report generation failed.
- **Root Cause:** Canned fallback objects hiding failures.
- **Severity:** High
- **Required Fix:** Remove fabricated fallback scores. Calculate genuine aggregate scores from evaluated answers and video metrics. Report clear diagnostic error states if LLM generation fails instead of returning fake passing evaluations.
- **Verification Method:** Verify report responses contain genuine computed metrics.

---

### Category 6: Backend Security & Configuration

#### Issue SEC-01: Insecure Default Spring Security Configuration
- **Affected File:** `ai/src/main/java/com/atharva/ai/config/SecurityConfig.java`
- **Error / Incorrect Behavior:** Spring Security logs generated password on startup; session management and CSRF not explicitly tuned for stateless REST API.
- **Root Cause:** Basic Spring Security starter defaults.
- **Severity:** Low
- **Required Fix:** Configure `SecurityFilterChain` with stateless session management, disabled CSRF for `/api/**`, and explicit public access for interview REST APIs without generated password noise.
- **Verification Method:** Verify startup log is clean without generated security password warning.

---

### Category 7: Database & JPA Persistence

#### Issue DB-01: Deprecated Hibernate Dialect Warning
- **Affected File:** `ai/src/main/resources/application.properties`
- **Error / Incorrect Behavior:** Log warning: `HHH90000025: PostgreSQLDialect does not need to be specified explicitly`.
- **Root Cause:** Explicit `spring.jpa.properties.hibernate.dialect` in properties file on modern Hibernate 7+.
- **Severity:** Low
- **Required Fix:** Remove deprecated dialect property from `application.properties`.
- **Verification Method:** Verify clean Hibernate startup without HHH90000025 warning.
