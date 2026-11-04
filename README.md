# AI Mock Interview & Career Mentorship Platform

An AI-powered mock interview platform designed to help students and job seekers prepare for technical interviews through real-time voice conversations, video-based behavioral analysis, AI-powered answer evaluation, and personalized career guidance.

The platform simulates an interview environment, evaluates candidate responses, identifies strengths and weaknesses, and generates structured performance reports to support continuous improvement.

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
9. [Environment Configuration](#9-environment-configuration)
10. [Running the Application](#10-running-the-application)
11. [API Workflow](#11-api-workflow)
12. [Performance Monitoring](#12-performance-monitoring)
13. [Security Considerations](#13-security-considerations)
14. [Future Enhancements](#14-future-enhancements)
15. [Contributing](#15-contributing)

---

## 1. Project Overview

Traditional interview preparation often lacks realistic interview simulations, immediate feedback, and personalized performance analysis.

The **AI Mock Interview & Career Mentorship Platform** addresses these challenges by combining conversational AI, speech technologies, computer vision, and backend application services.

Candidates can upload their resumes, participate in AI-driven mock interviews, answer questions through voice interactions, and receive detailed evaluations.

The system uses multiple AI services:

- **Vapi AI:** Enables real-time voice-based interview conversations.
- **Groq:** Powers AI-based answer evaluation, feedback generation, and interview reports.
- **MediaPipe:** Performs real-time video analysis, including facial, posture, gesture, and eye-contact-related metrics.

The backend manages interview sessions, candidate responses, evaluation results, database operations, and report generation.

### Project Objectives

- Simulate realistic technical interview experiences.
- Generate interview questions based on candidate resumes.
- Support real-time voice-based interactions.
- Analyze visual interview behavior.
- Evaluate candidate answers using AI.
- Identify strengths and areas requiring improvement.
- Generate structured interview performance reports.
- Provide personalized career mentorship recommendations.

---

## 2. Key Features

### 2.1 Resume Management
- Upload candidate resumes.
- Extract relevant information from resumes.
- Identify skills, technologies, experience, and projects.
- Use resume information to support interview question generation.

### 2.2 AI-Powered Mock Interviews
- Conduct interactive mock interviews.
- Generate questions based on candidate profiles and skills.
- Support voice-based conversations.
- Manage interview sessions and candidate responses.
- Maintain interview progress.

### 2.3 Real-Time Voice Interaction
- Integrate Vapi AI for conversational interviews.
- Support speech recognition and text-to-speech.
- Enable natural interaction between candidates and the AI interviewer.
- Capture and process interview transcripts.

### 2.4 Video-Based Behavioral Analysis
- Integrate MediaPipe for real-time video analysis.
- Analyze facial and posture-related information.
- Track gesture and eye-contact-related indicators.
- Collect video metrics during interview sessions.

### 2.5 AI Answer Evaluation
- Use Groq-powered language models to evaluate candidate responses.
- Analyze answer relevance and completeness.
- Generate scores and constructive feedback.
- Identify strengths and knowledge gaps.
- Provide improvement suggestions.

### 2.6 Interview Performance Reports
- Generate structured interview reports.
- Display overall performance scores.
- Present question-wise evaluation.
- Highlight strengths and weaknesses.
- Provide actionable recommendations.

### 2.7 Career Mentorship
- Provide personalized learning recommendations.
- Identify areas that require further preparation.
- Suggest relevant topics and learning resources.
- Help candidates improve their interview readiness.

---

## 3. System Architecture

The platform follows a modular monolithic architecture with Spring Boot as the central backend application.

### Architecture Components

**1. Client Layer – Frontend**
- React
- Vite
- Tailwind CSS
- Dashboard and user interface
- Resume upload interface
- Voice and video interview interface
- Performance reports and feedback

**2. Application Layer – Backend**
- Spring Boot
- Java
- Spring Security
- REST APIs
- Authentication and authorization
- Resume processing
- Interview session management
- AI evaluation
- Report generation
- Performance monitoring

**3. AI and External Services**

| Service | Responsibility |
|---|---|
| Vapi AI | Voice-based interview conversations |
| Groq | Answer evaluation, feedback, and reports |
| MediaPipe | Real-time video and behavioral analysis |

**4. Database Layer**
- PostgreSQL
- Candidate information
- Resume records
- Interview sessions
- Questions and answers
- Evaluation results
- Video metrics
- Generated reports

### Architecture Flow

```text
             USER
               |
               v
       REACT FRONTEND
               |
           REST APIs
               |
               v
       SPRING BOOT BACKEND
               |
       +-------+--------+
       |       |        |
       v       v        v
     VAPI    GROQ   MEDIAPIPE
       |       |        |
       +-------+--------+
               |
               v
          POSTGRESQL
               |
               v
       PERFORMANCE REPORT
               |
               v
       CAREER MENTORSHIP
```

The backend coordinates application logic and communication with external AI services, while PostgreSQL stores persistent application data.

---

## 4. Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Backend | Java, Spring Boot |
| Security | Spring Security, JWT |
| Database | PostgreSQL |
| ORM | Spring Data JPA, Hibernate |
| AI / LLM | Groq API, Spring AI |
| Voice AI | Vapi AI |
| Computer Vision | MediaPipe |
| API Communication | REST APIs |
| Development Tools | IntelliJ IDEA, VS Code |
| Version Control | Git, GitHub |
| Deployment | Vercel, Render |
| Containerization | Docker (planned for final deployment stage) |

---

## 5. Application Workflow

### Step 1: Resume Upload
The candidate uploads their resume through the frontend.

The backend processes the uploaded document and extracts relevant candidate information.

### Step 2: Interview Initialization
The system uses the available candidate information to prepare an interview session and generate relevant questions.

### Step 3: Voice-Based Interview
Vapi AI enables real-time voice interaction between the candidate and the AI interviewer.

Candidate responses are captured and processed as interview transcripts.

### Step 4: Video Analysis
MediaPipe processes the video stream to extract relevant visual indicators, such as facial and posture-related metrics.

Voice interaction and video analysis operate alongside each other.

### Step 5: AI Evaluation
Groq evaluates candidate answers and generates scores, feedback, strengths, and improvement areas.

### Step 6: Report Generation
The backend collects interview answers, evaluation results, and available video metrics to generate a structured report.

### Step 7: Career Mentorship
The candidate receives recommendations and guidance based on their interview performance.

---

## 6. Project Structure

The following is the intended high-level organization of the application. Actual folder names may vary depending on the implementation.

```text
Mock_interview_platform/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/interviewai/
│   │   │   │       ├── config/
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       ├── repository/
│   │   │   │       ├── entity/
│   │   │   │       ├── dto/
│   │   │   │       └── exception/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── .gitignore
└── README.md
```

---

## 7. Database Design

PostgreSQL is used as the primary relational database.

### Main Database Entities

| Entity | Purpose |
|---|---|
| Users | Stores candidate account information |
| Resumes | Stores uploaded resume records |
| Interviews | Stores interview session information |
| Questions | Stores interview questions |
| Answers | Stores candidate responses |
| Evaluations | Stores AI-generated evaluation results |
| Video Metrics | Stores video analysis information |
| Reports | Stores interview performance reports |
| Performance Logs | Stores application performance measurements |

### High-Level Relationships

```text
Users
  |
  +---- Resumes
  |
  +---- Interviews
           |
           +---- Questions
           |       |
           |       +---- Answers
           |                |
           |                +---- Evaluations
           |
           +---- Video Metrics
           |
           +---- Reports
           |
           +---- Performance Logs
```

These represent the intended high-level relationships; the exact foreign keys and cardinalities depend on the implemented database schema.

---

## 8. Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Install the following:

- Node.js and npm
- Java Development Kit (JDK 25 for the current backend configuration)
- PostgreSQL
- Git
- Maven or the included Maven Wrapper

You will also need API credentials for the external services you intend to use:

- Groq API
- Vapi AI

### Clone the Repository

```bash
git clone https://github.com/796Atharva/Mock_interview_platform.git

cd Mock_interview_platform
```

### Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend environment variables in a `.env` file.

Return to the repository root before navigating to the backend.

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Build the project:

```bash
./mvnw clean install
```

On systems where the Maven Wrapper is unavailable, install Maven and use:

```bash
mvn clean install
```

---

## 9. Environment Configuration

Do not commit API keys, passwords, or other credentials to GitHub.

### Backend Configuration

Configure the backend's `application.properties` or environment variables.

Example:

```properties
spring.application.name=ai

server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/ai-interviewer
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false

spring.ai.openai.api-key=${GROQ_API_KEY}
spring.ai.openai.base-url=https://api.groq.com/openai/v1
spring.ai.openai.chat.options.model=openai/gpt-oss-120b

groq.api-url=https://api.groq.com/openai/v1/chat/completions

groq.evaluation.api-key=${GROQ_EVALUATION_API_KEY}
groq.report.api-key=${GROQ_REPORT_API_KEY}

groq.evaluation.model=${GROQ_EVALUATION_MODEL:openai/gpt-oss-120b}
groq.report.model=${GROQ_REPORT_MODEL:openai/gpt-oss-120b}
```

### Backend Environment Variables

```bash
export DB_PASSWORD="your_postgresql_password"

export GROQ_API_KEY="your_groq_api_key"

export GROQ_EVALUATION_API_KEY="your_groq_api_key"

export GROQ_REPORT_API_KEY="your_groq_api_key"
```

You can use the same Groq API key for multiple operations if your account permits it.

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080

VITE_VAPI_PUBLIC_KEY=your_vapi_public_key

VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

Add other frontend credentials only when required by the actual implementation.

**Important:** Use public/client-side credentials only in frontend environment variables. Never expose private API keys in React code.

---

## 10. Running the Application

Start PostgreSQL and ensure the configured database exists.

### Start the Backend

From the backend directory:

```bash
./mvnw spring-boot:run
```

The backend should be available at:

```text
http://localhost:8080
```

### Start the Frontend

Open another terminal:

```bash
cd frontend

npm run dev
```

The Vite development server typically runs at:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

---

## 11. API Workflow

The backend exposes REST endpoints for interview management and processing.

The following endpoints represent the current project workflow:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/interviews/start/{resumeId}` | Start an interview |
| POST | `/api/interviews/{interviewId}/answer` | Submit an answer |
| POST | `/api/interviews/{interviewId}/video-metrics` | Submit video metrics |
| POST | `/api/interviews/{interviewId}/complete` | Complete an interview |
| POST | `/api/interviews/{interviewId}/evaluate` | Evaluate interview responses |
| POST | `/api/interviews/{interviewId}/report` | Generate a report |
| GET | `/api/interviews/{interviewId}/report` | Retrieve an interview report |

Actual request formats, authentication requirements, and response structures should be checked against the backend controllers.

---

## 12. Performance Monitoring

Performance monitoring is important because the platform combines multiple external services and real-time processing operations.

The system can monitor the following metrics:

| Component | Metric |
|---|---|
| Groq | AI evaluation response latency |
| Vapi | Voice response and first-audio latency |
| MediaPipe | Frame processing time and FPS |
| Spring Boot | API response time |
| PostgreSQL | Database query execution time |
| Reporting | Report generation time |

### Important Performance Measurements

- Average response time
- P50, P95, and P99 latency
- Request throughput
- Error rate
- AI service response time
- Video processing FPS
- End-to-end interview processing time

Possible monitoring integrations include Micrometer, Prometheus, and Grafana.

---

## 13. Security Considerations

The application should follow these security practices:

- Keep API keys and credentials in environment variables.
- Never commit `.env` files.
- Use JWT-based authentication where configured.
- Validate uploaded resume files.
- Validate incoming API requests.
- Apply appropriate authorization checks.
- Avoid exposing sensitive candidate information.
- Use HTTPS in production.
- Restrict access to interview reports and personal data.

---

## 14. Future Enhancements

Potential improvements include:

- Advanced resume parsing and skill extraction.
- More personalized interview question generation.
- Additional programming and coding interview modes.
- Improved behavioral analysis.
- Adaptive interview difficulty.
- Detailed progress tracking across multiple interviews.
- Enhanced career roadmaps.
- Learning resource recommendations.
- Advanced monitoring dashboards.
- Docker-based deployment and container orchestration.
- Expanded support for multiple AI providers.

---

## 15. Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Implement your changes.
4. Test your implementation.
5. Commit your changes.
6. Open a pull request.

```bash
git checkout -b feature/your-feature-name

git add .

git commit -m "Add: your feature description"

git push origin feature/your-feature-name
```

---

## Author

**Atharva Sanganwar**

GitHub: [@796Atharva](https://github.com/796Atharva)

Project Repository: [Mock_interview_platform](https://github.com/796Atharva/Mock_interview_platform)

---

*AI Mock Interview & Career Mentorship Platform — Making interview preparation smarter, more interactive, and more accessible.*
