# AI Mock Interview & Career Mentorship Platform

An intelligent, real-time mock interview and career guidance ecosystem designed to help students, developers, and job seekers prepare for technical and behavioral interviews. The platform combines real-time voice conversations, computer-vision behavioral telemetry, AI-powered answer evaluations, and personalized career roadmaps.

The platform simulates realistic interview settings, evaluates candidate responses across 20 targeted questions (Easy, Medium, Hard), measures real-time composure metrics (eye contact, posture stability), and generates structured performance reports with actionable learning paths.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Application Workflow](#5-application-workflow)
6. [Project Structure](#6-project-structure)
7. [Database Design](#7-database-design)
8. [Getting Started](#8-getting-started)
   - [Prerequisites](#prerequisites)
   - [Clone the Repository](#clone-the-repository)
   - [Database Setup](#database-setup)
   - [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
   - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
9. [Environment Configuration](#9-environment-configuration)
   - [Backend Environment Variables](#backend-environment-variables)
   - [Frontend Environment Variables](#frontend-environment-variables)
10. [Running the Application](#10-running-the-application)
11. [API Workflow & Reference](#11-api-workflow--reference)
    - [Resume Processing API](#resume-processing-api)
    - [Interview Lifecycle API](#interview-lifecycle-api)
    - [Career Mentorship & Chat API](#career-mentorship--chat-api)
    - [System Health & Diagnostics](#system-health--diagnostics)
12. [Interview Evaluation & Behavioral Scoring](#12-interview-evaluation--behavioral-scoring)
13. [Performance Monitoring](#13-performance-monitoring)
14. [Security Considerations](#14-security-considerations)
15. [Troubleshooting & FAQs](#15-troubleshooting--faqs)
16. [Future Enhancements](#16-future-enhancements)
17. [Contributing](#17-contributing)
18. [Author](#author)

---

## 1. Project Overview

Traditional interview preparation often lacks realistic interview simulations, immediate feedback, and personalized performance analysis.

The **AI Mock Interview & Career Mentorship Platform** addresses these challenges by combining conversational AI, speech technologies, computer vision, and backend application services into a cohesive interview simulator:

Candidates can upload their resumes in PDF or DOCX formats, participate in AI-driven mock interviews, answer technical and behavioral questions through voice interactions, and receive detailed diagnostic evaluations.

The system integrates multiple specialized AI services:

- **Vapi AI:** Enables low-latency, real-time voice-based interview conversations with natural turn-taking.
- **Groq API:** Powers fast inference for resume skill extraction, structured question generation, answer evaluation, and comprehensive interview reports.
- **MediaPipe:** Runs in-browser computer vision models for real-time video analysis, tracking eye contact ratio, posture confidence score, and head movement.

The backend (`ai` module) coordinates interview sessions, persists candidate responses, enforces evaluation constraints, and generates structured reports.

### Project Objectives

- Simulate realistic technical and behavioral interview experiences.
- Automatically generate 20 tailored interview questions based on candidate resumes (7 Easy, 8 Medium, 5 Hard, with an icebreaker self-introduction).
- Support natural, real-time voice-based interactions with speech recognition and synthesis.
- Analyze candidate visual composure and eye contact using computer vision.
- Evaluate candidate answers objectively using AI without synthetic score inflation.
- Identify core strengths and knowledge gaps.
- Generate structured interview performance reports with actionable recommendations.
- Provide personalized career mentorship and technical coaching chats.

---

## 2. Key Features

### 2.1 Resume Management & Skill Extraction
- Upload candidate resumes in PDF and DOCX formats.
- Uses **Apache Tika** for text extraction from documents.
- Converts resume content into structured markdown summaries.
- Identifies candidate skills, technologies, experience levels, and projects.
- Uses resume data to automatically synthesize candidate-tailored interview questions.

### 2.2 AI-Powered Mock Interviews
- Conduct interactive, session-managed mock interviews.
- Dynamically allocates a 20-question interview curriculum:
  - **Question 1:** Personalized icebreaker & self-introduction.
  - **Questions 2–8:** Foundational & conceptual technical questions (Easy).
  - **Questions 9–16:** Applied technical & problem-solving questions (Medium).
  - **Questions 17–20:** System architecture, edge cases, & advanced scenarios (Hard).
- Manages interview session progress, active question tracking, and answer storage.

### 2.3 Real-Time Voice Interaction
- Integrated **Vapi AI Web SDK** for conversational voice interviews.
- Real-time speech-to-text (STT) and text-to-speech (TTS).
- Built-in speech cooldown timers, transcript echo suppression, and question synchronization to prevent audio feedback loops.
- Captures and stores full spoken answers as interview transcripts.

### 2.4 Video-Based Behavioral Telemetry
- Integrated **MediaPipe Tasks Vision** for client-side video stream processing.
- Analyzes facial landmarks, gaze orientation, and posture stability in real time.
- Calculates eye contact ratio and posture confidence score.
- Periodically streams video telemetry to the backend during the interview.

### 2.5 Objective AI Answer Evaluation
- Powered by **Groq Cloud API** (`openai/gpt-oss-120b` or `llama-3.3-70b-versatile` / `llama-3.1-8b-instant`).
- Evaluates responses for technical accuracy, completeness, depth, and clarity.
- Generates transparent, bounded scores (0–10 per question) and constructive feedback.
- Strictly avoids canned or fabricated passing scores.

### 2.6 Comprehensive Performance Reports
- Generates holistic interview diagnostic reports.
- Aggregates overall technical scores and question-by-question breakdowns.
- Visualizes behavioral metrics alongside technical competence.
- Highlights key candidate strengths, critical areas for improvement, and an actionable roadmap.

### 2.7 Interactive Career Guidance & Mentorship
- Dedicated backend-routed AI chat endpoints for career pathway advice.
- 1-on-1 AI mentorship conversations for behavioral and system design interview prep.
- Recommends tailored learning resources and targeted interview strategies.

---

## 3. System Architecture

The platform follows a modular client-server architecture with Spring Boot as the central backend application.

```text
                             +-------------------+
                             |     CANDIDATE     |
                             +---------+---------+
                                       |
                   Browser Webcam / Mic | User Interface
                                       v
                     +-----------------------------------+
                     |       REACT 19 + VITE CLIENT      |
                     |  - MediaPipe Vision (Local CV)    |
                     |  - Vapi AI Web SDK (Voice Agent)  |
                     +-----------------+-----------------+
                                       |
                          REST APIs / JSON Payloads
                                       |
                                       v
                     +-----------------------------------+
                     |     SPRING BOOT BACKEND (`ai`)    |
                     |  - Spring Data JPA / Hibernate    |
                     |  - Spring Security (Stateless)    |
                     |  - Apache Tika Resume Parser      |
                     |  - Interview State Machine        |
                     +--------+-----------------+--------+
                              |                 |
            Groq API (Chat / Eval)              | JDBC
                              v                 v
                     +----------------+   +-------------------+
                     |    GROQ LLM    |   | POSTGRESQL DB     |
                     | - gpt-oss-120b |   | - Candidates      |
                     | - llama-3.3-70b|   | - Resumes         |
                     +----------------+   | - Interviews      |
                                          | - Questions       |
                                          | - Answers         |
                                          | - Video Metrics   |
                                          | - Reports         |
                                          +-------------------+
```

---

## 4. Technology Stack

| Category | Technologies | Description |
|---|---|---|
| **Frontend Framework** | React 19, Vite 8 | Fast single-page application with modern hooks and fast build tooling |
| **Styling & UI** | Tailwind CSS, Lucide React | Responsive layout and UI icons |
| **Computer Vision** | MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) | In-browser face landmark and posture tracking models |
| **Voice AI** | Vapi AI Web SDK (`@vapi-ai/web`) | Natural bidirectional conversational voice interface |
| **Backend Framework** | Spring Boot 4.x, Java 25 (JDK 21+ compatible) | High-performance enterprise REST API backend |
| **Document Processing** | Apache Tika | Robust text extraction from PDF and DOCX files |
| **ORM & Persistence** | Spring Data JPA, Hibernate | Database entity mapping and relational data persistence |
| **Database** | PostgreSQL | Relational storage for candidates, interviews, answers, and metrics |
| **AI / LLM Engine** | Groq Cloud API, Spring AI (OpenAI starter) | Ultra-low-latency LLM inference for evaluations, questions, and mentorship |
| **Security** | Spring Security | Stateless security filter chain for REST API endpoints |
| **Build & Tooling** | Maven Wrapper (`mvnw` / `mvnw.cmd`), npm | Cross-platform build tools for backend and frontend |

---

## 5. Application Workflow

```text
[1. Upload Resume] ----> [2. Parse & Extract] ----> [3. Generate 20 Questions]
                                                            |
                                                            v
[6. Final Report]  <---- [5. Evaluate Answers] <---- [4. Live Interview (Voice + CV)]
        |
        v
[7. Career Mentorship]
```

1. **Step 1: Resume Upload**: Candidate submits a PDF or DOCX resume along with their name and email.
2. **Step 2: Parse & Extract**: Apache Tika extracts document text, and the backend formats a clean markdown profile.
3. **Step 3: Question Generation**: Groq LLM generates 20 tailored interview questions adhering to a strict difficulty distribution (7 Easy, 8 Medium, 5 Hard) starting with an icebreaker.
4. **Step 4: Live Interview Session**:
   - Vapi AI conducts the spoken voice interview, prompting questions and listening to answers.
   - MediaPipe tracks eye contact and posture stability locally in the browser and sends periodic telemetry to the backend.
   - Candidate answers are transcribed and persisted question-by-question.
5. **Step 5: AI Answer Evaluation**: Groq evaluates technical correctness, depth, and clarity for each submitted answer on a 0–10 scale.
6. **Step 6: Report Synthesis**: The backend aggregates scores, combines behavioral metrics, identifies strengths/weaknesses, and computes the overall score.
7. **Step 7: Mentorship & Guidance**: The candidate chats with AI career mentors to get personalized preparation roadmaps.

---

## 6. Project Structure

```text
Mock_interview_platform/
├── ai/                                    # Spring Boot Backend (Java 25)
│   ├── .mvn/wrapper/                      # Maven Wrapper binaries
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/atharva/ai/
│   │   │   │   ├── AiApplication.java    # Spring Boot entry point
│   │   │   │   ├── config/               # Security, CORS, AI, Jackson configs
│   │   │   │   │   ├── AiConfig.java
│   │   │   │   │   ├── CorsConfig.java
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── JacksonConfig.java
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   ├── controller/           # REST API endpoints
│   │   │   │   │   ├── AiTestController.java
│   │   │   │   │   ├── ChatController.java
│   │   │   │   │   ├── InterviewController.java
│   │   │   │   │   └── ResumeController.java
│   │   │   │   ├── dto/                  # Data transfer objects & requests/responses
│   │   │   │   │   ├── ChatDto.java
│   │   │   │   │   ├── GeneratedQuestion.java
│   │   │   │   │   ├── InterviewAnswerResponse.java
│   │   │   │   │   ├── InterviewReportResponse.java
│   │   │   │   │   ├── InterviewStartResponse.java
│   │   │   │   │   ├── ParsedResume.java
│   │   │   │   │   ├── ResumeAnalysisResponse.java
│   │   │   │   │   └── VideoMetricsRequest.java
│   │   │   │   ├── entity/               # JPA Entities
│   │   │   │   │   ├── Candidate.java
│   │   │   │   │   ├── Interview.java
│   │   │   │   │   ├── InterviewAnswer.java
│   │   │   │   │   ├── InterviewQuestion.java
│   │   │   │   │   ├── InterviewReport.java
│   │   │   │   │   ├── InterviewVideoMetrics.java
│   │   │   │   │   └── Resume.java
│   │   │   │   ├── repository/           # Spring Data JPA Repositories
│   │   │   │   │   ├── CandidateRepository.java
│   │   │   │   │   ├── InterviewAnswerRepository.java
│   │   │   │   │   ├── InterviewQuestionRepository.java
│   │   │   │   │   ├── InterviewReportRepository.java
│   │   │   │   │   ├── InterviewRepository.java
│   │   │   │   │   ├── InterviewVideoMetricsRepository.java
│   │   │   │   │   └── ResumeRepository.java
│   │   │   │   └── service/              # Core business logic & AI orchestration
│   │   │   │       ├── ChatService.java
│   │   │   │       ├── DocumentExtractionService.java
│   │   │   │       ├── GroqApiService.java
│   │   │   │       ├── InterviewEvaluationService.java
│   │   │   │       ├── InterviewReportService.java
│   │   │   │       ├── InterviewService.java
│   │   │   │       ├── MarkdownResumeService.java
│   │   │   │       ├── QuestionGenerationService.java
│   │   │   │       ├── ResumeAnalysisService.java
│   │   │   │       └── ResumeService.java
│   │   │   └── resources/
│   │   │       └── application.properties # Spring configuration & Groq bindings
│   │   └── test/                          # Unit and integration tests
│   ├── mvnw                               # Linux/macOS Maven wrapper script
│   ├── mvnw.cmd                           # Windows Maven wrapper batch script
│   └── pom.xml                            # Backend Maven dependencies
│
├── frontend/                              # React Frontend (Vite 8)
│   ├── public/
│   │   └── models/                        # MediaPipe pre-trained vision models
│   ├── src/
│   │   ├── assets/                        # Static styling & imagery
│   │   ├── components/                    # Reusable UI components
│   │   ├── firebase/                      # Firebase auth integration
│   │   ├── pages/                         # Core view pages
│   │   │   ├── CareerGuidance.jsx         # Career roadmap page
│   │   │   ├── Interview.jsx              # Live voice & video interview interface
│   │   │   ├── MentorChat.jsx             # 1-on-1 AI coaching chat
│   │   │   ├── Report.jsx                 # Final performance report view
│   │   │   └── ResumeUpload.jsx           # Resume upload & parsing view
│   │   ├── services/                      # API client services
│   │   ├── App.css                        # Global styling
│   │   ├── App.jsx                        # Application root router
│   │   └── main.jsx                       # React entry point
│   ├── .env.example                       # Frontend environment template
│   ├── package.json                       # Frontend dependencies & scripts
│   └── vite.config.js                     # Vite build configuration
│
├── .gitignore
├── PROJECT_AUDIT.md                       # Comprehensive architectural audit report
└── README.md                              # Main project documentation
```

> **Note:** The backend project is located in the **`ai/`** directory.

---

## 7. Database Design

PostgreSQL serves as the primary relational database. Hibernate automatically creates and updates database tables based on JPA entities (`spring.jpa.hibernate.ddl-auto=update`).

### Database Schema Overview

```text
+------------------+         1 : N         +-------------------+
|    candidates    | --------------------> |      resumes      |
+------------------+                       +-------------------+
         |                                           |
         | 1 : N                                     | 1 : N
         v                                           v
+------------------+         1 : N         +-------------------+
|    interviews    | <-------------------- |interview_questions|
+------------------+                       +-------------------+
   |             |                                   |
   | 1 : N       | 1 : N                             | 1 : N
   v             v                                   v
+---------+ +-------------------+          +-------------------+
| reports | |   video_metrics   |          | interview_answers |
+---------+ +-------------------+          +-------------------+
```

### Table Definitions

| Entity | Table Name | Purpose | Key Attributes |
|---|---|---|---|
| **Candidate** | `candidates` | Stores candidate contact profile | `id`, `name`, `email` |
| **Resume** | `resumes` | Stores parsed document details & candidate skills | `id`, `candidate_id`, `file_path`, `raw_text`, `skills` |
| **InterviewQuestion** | `interview_questions` | 20 structured interview questions generated per resume | `id`, `resume_id`, `question_text`, `difficulty`, `question_order` |
| **Interview** | `interviews` | Tracks interview sessions and lifecycle state | `id`, `resume_id`, `candidate_id`, `status` (`IN_PROGRESS`, `COMPLETED`), `created_at` |
| **InterviewAnswer** | `interview_answers` | Candidate responses and AI evaluations per question | `id`, `interview_id`, `question_id`, `answer_text`, `score` (0-10), `feedback` |
| **InterviewVideoMetrics** | `interview_video_metrics`| Behavioral telemetry recorded via MediaPipe | `id`, `interview_id`, `eye_contact_percentage`, `posture_score` |
| **InterviewReport** | `interview_reports` | Final performance assessment and career roadmap | `id`, `interview_id`, `overall_score`, `strengths`, `weaknesses`, `recommendations` |

---

## 8. Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Java Development Kit (JDK):** Version 25 (or JDK 21+ LTS). Verify with `java -version`.
- **Node.js & npm:** Node.js v18+ or v20+. Verify with `node -v` and `npm -v`.
- **PostgreSQL:** Version 14 or higher running on port `5432`.
- **Git:** Version 2.30+.
- **External Accounts & API Keys:**
  - **Groq Cloud API Key:** Get a free API key at [Groq Console](https://console.groq.com/keys).
  - **Vapi AI Account:** Get public key and assistant ID at [Vapi Dashboard](https://dashboard.vapi.ai/).

### Clone the Repository

```bash
git clone https://github.com/796Atharva/Mock_interview_platform.git
cd Mock_interview_platform
```

### Database Setup

1. Open your PostgreSQL terminal (`psql`) or a management tool (pgAdmin / DBeaver).
2. Create the target database:

```sql
CREATE DATABASE "ai-interviewer";
```

3. Ensure PostgreSQL is accepting connections on `localhost:5432` with user `postgres`.

---

### Backend Setup (Spring Boot)

1. Navigate to the backend directory (`ai`):

```bash
cd ai
```

2. Set your Groq API key in your environment (see [Environment Configuration](#9-environment-configuration)).

3. Build the backend application:

- **On Windows (PowerShell):**
  ```powershell
  .\mvnw.cmd clean install
  ```

- **On macOS / Linux:**
  ```bash
  chmod +x mvnw
  ./mvnw clean install
  ```

---

### Frontend Setup (React + Vite)

1. From the repository root, navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment template:

```bash
cp .env.example .env
```

4. Open `.env` and fill in your Vapi and backend URL configurations.

---

## 9. Environment Configuration

### Backend Environment Variables

The backend reads configuration parameters from `ai/src/main/resources/application.properties` with fallback environment variables:

| Variable | Description | Default / Example |
|---|---|---|
| `GROQ_API_KEY` | **Required.** Groq API key for LLM chat completion and question generation | `gsk_...` |
| `DB_PASSWORD` | PostgreSQL database password for user `postgres` | `000000` |
| `GROQ_EVALUATION_MODEL` | Model used for evaluating interview answers | `openai/gpt-oss-120b` |
| `GROQ_REPORT_MODEL` | Model used for generating final interview reports | `openai/gpt-oss-120b` |

#### Setting Backend Variables

- **Linux / macOS (Bash / Zsh):**
  ```bash
  export GROQ_API_KEY="your_groq_api_key_here"
  export DB_PASSWORD="your_postgres_password"
  ```

- **Windows (PowerShell):**
  ```powershell
  $env:GROQ_API_KEY="your_groq_api_key_here"
  $env:DB_PASSWORD="your_postgres_password"
  ```

- **Windows (Command Prompt):**
  ```cmd
  set GROQ_API_KEY=your_groq_api_key_here
  set DB_PASSWORD=your_postgres_password
  ```

---

### Frontend Environment Variables

Configure `frontend/.env`:

```env
# Spring Boot Backend API URL
VITE_API_URL=http://localhost:8080

# Vapi AI Voice Configuration
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id

# Firebase Authentication (Optional / If enabled)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> [!WARNING]
> Never commit `.env` files or hardcode private API keys in client-side code.

---

## 10. Running the Application

### 1. Start the Backend

From the **`ai/`** directory:

- **Windows (PowerShell / CMD):**
  ```powershell
  cd ai
  .\mvnw.cmd spring-boot:run
  ```

- **Linux / macOS:**
  ```bash
  cd ai
  ./mvnw spring-boot:run
  ```

The backend server starts at: **`http://localhost:8080`**.

Verify backend health and Groq AI connectivity by visiting:
```text
http://localhost:8080/api/ai/test
```

### 2. Start the Frontend

In a separate terminal window, from the **`frontend/`** directory:

```bash
cd frontend
npm run dev
```

The Vite development server will start at: **`http://localhost:5173`**.

Open your browser and navigate to `http://localhost:5173`.

---

## 11. API Workflow & Reference

The backend exposes a comprehensive set of RESTful APIs for managing candidate resumes, interview sessions, answers, telemetry, and AI mentorship.

### Resume Processing API

#### `POST /api/resumes/upload`
Uploads a resume file (PDF or DOCX), creates a candidate record, parses document content using Apache Tika, and generates 20 tailored interview questions.

- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Resume binary file (`.pdf` or `.docx`, max 10MB)
  - `name`: Candidate's full name
  - `email`: Candidate's email address
- **Response:**
  ```json
  {
    "message": "Resume processed successfully",
    "resumeId": 1,
    "candidateId": 1
  }
  ```

#### `GET /api/resumes/{id}`
Retrieves candidate resume analysis, extracted technical skills, and generated questions.

- **Response:** `ResumeAnalysisResponse` containing candidate profile and question list.

---

### Interview Lifecycle API

#### `POST /api/interviews/start/{resumeId}`
Initializes a new interview session for the candidate's uploaded resume.

- **Response:**
  ```json
  {
    "interviewId": 101,
    "questionId": 1,
    "question": "Tell me about yourself, your background, and the technologies you've worked with.",
    "questionIndex": 1,
    "totalQuestions": 20
  }
  ```

#### `GET /api/interviews/{interviewId}/current`
Retrieves the current active question for an ongoing interview.

- **Response:** `InterviewStartResponse` containing current question details and index.

#### `POST /api/interviews/{interviewId}/answer`
Submits the candidate's spoken or text answer for the current question and advances the interview cursor.

- **Request Body:**
  ```json
  {
    "answer": "In my previous project, I designed a microservices architecture using Spring Boot..."
  }
  ```
- **Response:**
  ```json
  {
    "answerId": 501,
    "nextQuestion": "Explain the difference between optimistic and pessimistic locking in databases.",
    "nextQuestionIndex": 2,
    "totalQuestions": 20,
    "completed": false
  }
  ```

#### `POST /api/interviews/{interviewId}/video-metrics`
Saves real-time behavioral telemetry captured by MediaPipe during the session.

- **Request Body:**
  ```json
  {
    "eyeContactPercentage": 82.5,
    "postureScore": 88.0,
    "faceDetectionConfidence": 0.94
  }
  ```
- **Response:** `"Video metrics saved successfully"`

#### `POST /api/interviews/{interviewId}/complete`
Marks the interview status as `COMPLETED`.

- **Response:** `"Interview completed successfully"`

#### `POST /api/interviews/{interviewId}/evaluate`
Triggers AI evaluation across all submitted answers using Groq LLM.

- **Response:** `"Interview evaluated successfully"`

#### `POST /api/interviews/{interviewId}/report`
Generates and persists the final performance report combining technical evaluation and video metrics.

- **Response:** `InterviewReportResponse`

#### `GET /api/interviews/{interviewId}/report`
Retrieves the saved performance report for a completed interview.

- **Response:**
  ```json
  {
    "interviewId": 101,
    "candidateName": "John Doe",
    "overallScore": 84.5,
    "technicalScore": 86.0,
    "behavioralScore": 83.0,
    "strengths": [
      "Clear explanation of distributed caching strategies",
      "Consistent eye contact during technical explanations"
    ],
    "weaknesses": [
      "Could elaborate more on transaction isolation levels in PostgreSQL"
    ],
    "recommendations": [
      "Deep dive into concurrency control patterns",
      "Practice STAR method for scenario-based questions"
    ],
    "summary": "Strong candidate demonstrating solid full-stack fundamentals."
  }
  ```

---

### Career Mentorship & Chat API

#### `POST /api/chat/career-guidance`
AI career pathway and resume improvement advice routed securely through the Spring Boot backend.

- **Request Body:**
  ```json
  {
    "message": "What skills should I learn next to become a Senior Backend Engineer?"
  }
  ```
- **Response:**
  ```json
  {
    "reply": "Based on modern industry standards, prioritize: 1. Distributed systems design...",
    "provider": "Groq"
  }
  ```

#### `POST /api/chat/mentor`
1-on-1 technical mentorship and mock problem-solving chat.

- **Request Body:**
  ```json
  {
    "message": "How should I structure my answer when asked about database indexing?"
  }
  ```
- **Response:**
  ```json
  {
    "reply": "Start with high-level B-Tree vs Hash index concepts, discuss write penalty...",
    "provider": "Groq"
  }
  ```

---

### System Health & Diagnostics

#### `GET /api/ai/test`
Validates backend connection to the Groq API provider.

- **Response (Success):**
  ```json
  {
    "status": "SUCCESS",
    "provider": "Groq",
    "reply": "Hello! I am functioning properly and ready to process requests."
  }
  ```

---

## 12. Interview Evaluation & Behavioral Scoring

The platform evaluates candidates using a multi-dimensional scoring rubric combining technical rigor and behavioral composure:

### 1. Structured Question Distribution

Each candidate interview consists of exactly **20 tailored questions**:

| Question Range | Category | Objective |
|---|---|---|
| **Question 1** | Icebreaker / Self-Introduction | Evaluate personal introduction, communication clarity, and resume alignment |
| **Questions 2–8** | Foundational Technical (Easy) | Assess core conceptual understanding of languages, data structures, and tools |
| **Questions 9–16** | Applied Problem Solving (Medium) | Assess hands-on implementation experience, debugging, and real-world scenarios |
| **Questions 17–20** | Architecture & Edge Cases (Hard) | Assess system design, scalability, edge case handling, and tradeoff analysis |

### 2. Answer Evaluation (Groq LLM)

Each answer is scored on a **0–10 scale** considering:
- **Technical Correctness:** Accuracy of facts, syntax, and concepts.
- **Completeness:** Addressing all facets of the prompt.
- **Depth:** Demonstration of practical insight rather than superficial definitions.
- **Communication:** Clarity, conciseness, and professional terminology.

### 3. Behavioral Telemetry (MediaPipe)

The frontend runs real-time computer vision models tracking:
- **Eye Contact Percentage:** Ratio of time the candidate looks toward the camera/screen center.
- **Posture Score:** Upper-body alignment, head pitch/yaw/roll stability, and body language calmness.
- **Confidence Telemetry:** Face presence detection without interruptions.

---

## 13. Performance Monitoring

Because the platform coordinates real-time voice, video inference, and LLM queries, performance telemetry is essential:

| Component | Target Metric | SLA / Goal |
|---|---|---|
| **Groq LLM Inference** | Time to first token / Completion latency | < 800 ms |
| **Vapi Voice Engine** | Speech-to-speech turnaround | < 1200 ms |
| **MediaPipe Computer Vision** | Client-side frame processing | 24–30 FPS with negligible CPU impact |
| **Spring Boot REST APIs** | P95 Response latency | < 250 ms |
| **Database Queries** | Answer insertion & report retrieval | < 50 ms |

---

## 14. Security Considerations

- **Secrets Management:** Credentials (`GROQ_API_KEY`, database passwords) must only be passed through environment variables.
- **No Client Secret Leaks:** Chatbot requests are routed through Spring Boot backend endpoints; private LLM API keys are never exposed in browser JavaScript.
- **File Upload Protection:** Resume uploads are validated for MIME type, file extension (`.pdf`, `.docx`), and bounded to a 10MB maximum file size limit.
- **Stateless REST APIs:** Spring Security is configured with stateless session management and explicit CORS origins to prevent unauthorized cross-origin requests.

---

## 15. Troubleshooting & FAQs

### Q1: `cd: backend: No such file or directory`
**Solution:** The backend module is located in the **`ai/`** directory. Navigate to `cd ai` instead of `cd backend`.

### Q2: `FATAL: database "ai-interviewer" does not exist`
**Solution:** Open PostgreSQL and run:
```sql
CREATE DATABASE "ai-interviewer";
```

### Q3: `Groq API Error: 401 Unauthorized` or null API key
**Solution:** Ensure you have exported `GROQ_API_KEY` before starting the Spring Boot application:
- PowerShell: `$env:GROQ_API_KEY="gsk_..."`
- Bash: `export GROQ_API_KEY="gsk_..."`

### Q4: Browser camera or microphone not working in interview
**Solution:** Ensure you grant camera and microphone permissions in Chrome/Edge. In browser settings, allow `http://localhost:5173` access to audio/video devices.

### Q5: `Failed to execute goal ... on project ai` (Java Version Error)
**Solution:** Ensure you have JDK 21+ or JDK 25 installed. Verify with `java -version` and ensure `JAVA_HOME` points to the correct JDK path.

---

## 16. Future Enhancements

- [ ] **Live Coding Sandbox:** In-browser code execution sandbox with real-time linting for algorithmic challenges.
- [ ] **Multi-Language Interview Track:** Native support for multiple programming languages (Python, Go, C++, Java, JavaScript).
- [ ] **Adaptive Interview Difficulty:** Dynamic difficulty scaling where follow-up questions adapt in real time based on previous answer scores.
- [ ] **Docker Compose Pipeline:** Single-command `docker compose up` spinning up frontend, Spring Boot backend, and PostgreSQL database.
- [ ] **Audio Stress & Tone Analysis:** Tone, speaking pace (words-per-minute), and filler-word detection.

---

## 17. Contributing

Contributions, feedback, and pull requests are warmly welcome!

To contribute:

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add amazing new feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request.

---

## Author

**Atharva Sanganwar**  
- GitHub: [@796Atharva](https://github.com/796Atharva)  
- Repository: [Mock_interview_platform](https://github.com/796Atharva/Mock_interview_platform)

---

*AI Mock Interview & Career Mentorship Platform — Empowering candidates with intelligent, realistic, and objective interview preparation.*
