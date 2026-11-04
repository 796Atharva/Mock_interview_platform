# CareerVerse – AI-Powered Career Guidance and Mock Interview Platform

CareerVerse is an AI-powered platform designed to help students and job seekers improve their interview skills and prepare for professional opportunities.

The platform combines artificial intelligence, voice-based interaction, resume analysis, and computer vision to provide a personalized interview preparation experience.

Users can upload their resumes, participate in AI-driven mock interviews, receive automated feedback on their answers, and access performance reports highlighting their strengths and areas for improvement.

The system also provides career guidance and personalized recommendations to help users identify skill gaps and improve their professional development.

## Table of Contents

1. [Overview](#1-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Application Workflow](#5-application-workflow)
6. [Project Structure](#6-project-structure)
7. [Database Design](#7-database-design)
8. [Getting Started](#8-getting-started)
9. [Environment Configuration](#9-environment-configuration)
10. [Running the Application](#10-running-the-application)
11. [Interview Evaluation](#11-interview-evaluation)
12. [Security](#12-security)
13. [Future Enhancements](#13-future-enhancements)
14. [Contributors](#14-contributors)

---

## 1. Overview

Traditional interview preparation often lacks realistic interview experiences, personalized feedback, and detailed performance analysis.

CareerVerse addresses these limitations through an integrated platform that combines conversational AI, voice technologies, and computer vision.

The platform allows candidates to:

- Upload their resumes for personalized interview preparation.
- Participate in AI-powered technical mock interviews.
- Interact with an AI interviewer through voice.
- Receive AI-generated evaluations of their answers.
- Analyze behavioral indicators during interviews.
- View detailed performance reports.
- Access personalized career guidance.

The main objective is to provide a structured environment where candidates can practice interviews, understand their performance, and continuously improve their skills.

## 2. Key Features

### 2.1 User Authentication

- User registration and login.
- Secure authentication using JWT.
- Personalized user profiles.
- Protected application resources.

### 2.2 Resume Analysis

- Resume upload and processing.
- Extraction of relevant information from uploaded documents.
- Identification of technical skills, projects, and educational qualifications.
- Resume-based interview preparation.

### 2.3 AI-Powered Mock Interviews

- Personalized technical interview questions.
- Questions based on candidate skills and resume information.
- Multiple difficulty levels.
- Interactive interview sessions.
- Automated evaluation of candidate responses.

### 2.4 Voice-Based Interview System

- Integration with Vapi for voice-based communication.
- Real-time interaction with the AI interviewer.
- Speech-to-text transcription of candidate responses.
- Conversational interview experience.

### 2.5 Behavioral Analysis

MediaPipe is used to analyze visual indicators during interview sessions.

The system tracks:

- Face presence.
- Gaze direction.
- Head movement.
- Other available facial and behavioral indicators.

These metrics provide additional insights into the candidate's interview behavior.

### 2.6 AI-Based Answer Evaluation

- Integration with Google Gemini.
- Evaluation of answer relevance and correctness.
- Individual answer scoring.
- Identification of strengths and weaknesses.
- Automated feedback and improvement suggestions.

### 2.7 Performance Reports

The platform generates structured reports containing:

- Overall interview performance.
- Question-wise evaluation.
- Technical performance analysis.
- Behavioral analysis.
- Strengths and weaknesses.
- Recommendations for improvement.

### 2.8 AI Mentor and Career Guidance

- AI-powered career assistance.
- Personalized learning recommendations.
- Skill-gap identification.
- Technical learning guidance.
- Career development suggestions.

---

## 3. Technology Stack

| Category          | Technologies               |
| ----------------- | -------------------------- |
| Frontend          | React, Vite                |
| Styling           | Tailwind CSS               |
| Backend           | Java, Spring Boot          |
| Backend Security  | Spring Security, JWT       |
| Database          | PostgreSQL                 |
| ORM               | Spring Data JPA, Hibernate |
| AI Integration    | Google Gemini, Spring AI   |
| Voice Interaction | Vapi                       |
| Computer Vision   | MediaPipe                  |
| API Communication | REST APIs                  |
| Version Control   | Git, GitHub                |
| Development Tools | IntelliJ IDEA, VS Code     |

---

## 4. System Architecture

CareerVerse follows a client-server architecture with Spring Boot handling the central application logic.

The frontend communicates with the backend through REST APIs. The backend manages authentication, interview sessions, database operations, AI integration, and report generation.

### Architecture Overview

```text
                 USER
                   |
                   v
             REACT FRONTEND
               (Vite)
                   |
                   v
                REST APIs
                   |
                   v
           SPRING BOOT BACKEND
                   |
          +--------+---------+
          |        |         |
          v        v         v
        GEMINI    VAPI    MEDIAPIPE
          |        |         |
          +--------+---------+
                   |
                   v
               POSTGRESQL
                   |
                   v
          INTERVIEW EVALUATION
                   |
                   v
           PERFORMANCE REPORT
                   |
                   v
            CAREER GUIDANCE
```

### Architecture Components

| Component       | Responsibility                                     |
| --------------- | -------------------------------------------------- |
| React Frontend  | User interface and interview dashboard             |
| Spring Boot     | Backend business logic and API management          |
| Google Gemini   | AI-based question generation and answer evaluation |
| Vapi            | Voice-based interview interaction                  |
| MediaPipe       | Video and behavioral analysis                      |
| PostgreSQL      | Persistent data storage                            |
| Spring Security | Authentication and authorization                   |

---

## 5. Application Workflow

The application follows a sequence of steps to provide a complete interview preparation experience.

**Step 1: User Authentication**

Users register or log in to access their personalized dashboard.

**Step 2: Resume Upload**

Candidates upload their resumes. The backend processes the uploaded documents and extracts relevant candidate information.

**Step 3: Interview Preparation**

The extracted information is used to prepare personalized technical interview questions based on the candidate's skills and experience.

**Step 4: Voice-Based Interview**

The candidate participates in an interactive interview using Vapi. Questions are communicated through voice, and candidate responses are transcribed for further processing.

**Step 5: Behavioral Analysis**

MediaPipe analyzes available video information and extracts facial and behavioral indicators during the interview.

**Step 6: AI Evaluation**

Google Gemini evaluates candidate responses and generates scores, feedback, and improvement suggestions.

**Step 7: Report Generation**

The backend collects the evaluation results and available behavioral metrics to generate a structured performance report.

**Step 8: Career Guidance**

Candidates receive recommendations based on their interview performance and identified areas of improvement.

---

## 6. Project Structure

The following represents the high-level organization of the application. Actual directory names may differ depending on the implementation.

```text
CareerVerse/
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- hooks/
|   |   |-- context/
|   |   |-- assets/
|   |   |-- App.jsx
|   |
|   |-- package.json
|   |-- vite.config.js
|
|-- backend/
|   |-- src/
|   |   |-- main/
|   |   |   |-- java/
|   |   |   |-- resources/
|   |   |
|   |   |-- test/
|   |
|   |-- pom.xml
|   |-- mvnw
|
|-- .gitignore
|-- README.md
```

---

## 7. Database Design

PostgreSQL is used as the primary relational database for storing application data.

The database manages information related to users, resumes, interviews, answers, evaluations, and performance reports.

### Main Database Entities

| Entity        | Purpose                                |
| ------------- | -------------------------------------- |
| Users         | Stores user account information        |
| Resumes       | Stores uploaded resume records         |
| Interviews    | Stores interview session details       |
| Questions     | Stores interview questions             |
| Answers       | Stores candidate responses             |
| Evaluations   | Stores AI-generated evaluation results |
| Video Metrics | Stores behavioral analysis information |
| Reports       | Stores interview performance reports   |

The relationships between these entities support the complete interview lifecycle, from resume submission to final performance evaluation.

---

## 8. Getting Started

Follow the instructions below to run the project locally.

### Prerequisites

Install the following software:

- Node.js and npm
- Java Development Kit
- PostgreSQL
- Maven or Maven Wrapper
- Git

You will also need API credentials for the external services used by the application.

- Google Gemini API
- Vapi

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

Install the dependencies:

```bash
npm install
```

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Build the application:

```bash
./mvnw clean install
```

On Windows:

```bash
mvnw.cmd clean install
```

---

## 9. Environment Configuration

Configure the required database credentials and API keys before running the application.

### Backend Configuration

Update the backend `application.properties` file according to the actual project configuration.

Example:

```properties
spring.application.name=careerverse

server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/careerverse
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}

# Gemini API Configuration
spring.ai.google.genai.api-key=${GEMINI_API_KEY}
```

### Environment Variables

Configure the following environment variables:

```env
DB_PASSWORD=your_database_password

GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Configuration

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:8080

VITE_VAPI_PUBLIC_KEY=your_vapi_public_key

VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

**Note:** The variable names shown above are examples. Use the exact names expected by your application configuration.

Never commit private API keys or database passwords to the repository.

---

## 10. Running the Application

### Start the Database

Ensure that PostgreSQL is running and the configured database has been created.

### Start the Backend

From the backend directory, execute:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend will typically run at:

```text
http://localhost:8080
```

### Start the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend

npm run dev
```

The frontend development server will typically be available at:

```text
http://localhost:5173
```

Open the frontend URL in your browser to access the application.

---

## 11. Interview Evaluation

CareerVerse uses Google Gemini to evaluate candidate responses and generate structured feedback.

The evaluation process considers factors such as:

| Metric                  | Description                                   |
| ----------------------- | --------------------------------------------- |
| Answer Score            | Score assigned to an individual response      |
| Answer Relevance        | Relevance of the response to the question     |
| Technical Understanding | Understanding of the discussed concepts       |
| Strengths               | Areas where the candidate performed well      |
| Areas of Improvement    | Concepts requiring additional preparation     |
| Behavioral Indicators   | Available metrics collected through MediaPipe |
| Overall Performance     | Summary of interview performance              |

The evaluation results are presented through performance reports to help candidates understand their current level of preparation.

---

## 12. Security

The application follows security practices to protect user information and application resources.

- JWT-based authentication.
- Secure handling of API credentials.
- Environment variables for sensitive configuration.
- Validation of incoming requests.
- Appropriate authorization for protected resources.
- Secure handling of uploaded documents.
- Restricted access to candidate information.

---

## 13. Future Enhancements

Potential improvements to the platform include:

- More advanced resume analysis.
- Additional coding interview modes.
- Adaptive interview difficulty.
- Improved behavioral analysis.
- Historical performance tracking.
- More detailed skill-gap analysis.
- Personalized career roadmaps.
- Additional AI model integrations.
- Advanced analytics dashboards.

---

## 14. Contributors

**Project:** CareerVerse – AI-Powered Career Guidance and Mock Interview Platform

**Repository:** [Mock_interview_platform](https://github.com/796Atharva/Mock_interview_platform)

**GitHub:** [796Atharva](https://github.com/796Atharva)&#x20;

---

*CareerVerse is designed to support students and job seekers in developing their technical skills, improving interview performance, and preparing for professional opportunities.*
