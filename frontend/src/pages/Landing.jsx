import { useNavigate } from "react-router-dom";
import { Sparkles, Compass, MessageSquare, ArrowRight, Mic, FileText, Bot } from "lucide-react";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Background Gradients */}
      <div className="landing-grid" />
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>AI-Powered Technical Interview & Career Intelligence</span>
        </div>

        <h1>
          Master your next technical interview
          <span> with AI.</span>
        </h1>

        <p className="hero-description">
          Upload your resume for real-time AI voice interviews with Vapi & MediaPipe video analysis,
          unlock tailored career transition roadmaps with Gemini, and practice 1-on-1 with Staff AI Mentors.
        </p>

        <div className="hero-actions">
          <button
            className="hero-primary"
            onClick={() => navigate("/upload")}
          >
            Start Mock Interview
            <ArrowRight size={16} />
          </button>

          <button
            className="hero-secondary"
            onClick={() => navigate("/career-guidance")}
          >
            <Compass size={16} />
            Explore Career Guidance
          </button>

          <button
            className="hero-tertiary"
            onClick={() => navigate("/mentor-chat")}
          >
            <MessageSquare size={16} />
            Chat with Mentor Alex
          </button>
        </div>

        {/* AI visual */}
        <div className="hero-visual">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="terminal-title">interview-ai-session</span>
            </div>

            <div className="terminal-body">
              <div>
                <span className="terminal-symbol">$</span> analyze-candidate-profile --resume
              </div>
              <div className="terminal-muted">
                → extracting full-stack skills, cloud architecture, projects...
              </div>
              <div className="terminal-success">
                ✓ candidate profile synthesized (12 core technical skills identified)
              </div>
              <div>
                <span className="terminal-symbol">$</span> generate-technical-questions
              </div>
              <div className="terminal-muted">
                → structuring 5 adaptive voice interview questions...
              </div>
              <div className="terminal-active">
                <span className="terminal-symbol">$</span> vapi-engine live: ready for voice interaction
                <span className="cursor">▋</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="section-label">PLATFORM CAPABILITIES</div>
        <h2>Engineered for Technical Excellence</h2>
        <p className="section-description">
          A unified ecosystem for resume parsing, voice-based technical interviews, camera posture analysis, and continuous mentorship.
        </p>

        <div className="feature-grid">
          <Feature
            icon={<FileText size={20} />}
            title="Resume Intelligence"
            description="Deep AI parsing extracts core competencies, projects, and architecture patterns from your PDF resume."
          />

          <Feature
            icon={<Mic size={20} />}
            title="Voice Interview Engine"
            description="Interactive voice dialog with Vapi AI. Built-in anti-collision guards prevent echo loops and speech overlap."
          />

          <Feature
            icon={<Bot size={20} />}
            title="MediaPipe Signal Analysis"
            description="Real-time camera analysis observes face presence, attention score, and head movement proxies."
          />

          <Feature
            icon={<Sparkles size={20} />}
            title="Executive Evaluation"
            description="Granular performance dossier scoring technical knowledge, problem solving, communication, and practical skills."
          />

          <Feature
            icon={<Compass size={20} />}
            title="Career Guidance Chatbot"
            description="Gemini-powered career architect recommends target roles, salary benchmarks, and 30-60-90 day skill roadmaps."
          />

          <Feature
            icon={<MessageSquare size={20} />}
            title="1-on-1 Mentor Chat"
            description="Chat with Alex, an AI Staff Engineer, on system design challenges, code reviews, and behavioral interview coaching."
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="landing-section workflow-section">
        <div className="section-label">HOW IT WORKS</div>
        <h2>From Resume to Technical Mastery</h2>

        <div className="workflow">
          <Step
            number="01"
            title="Upload Resume"
            description="Upload your resume in PDF format. AI extracts skills, tech stack, and background."
          />

          <Step
            number="02"
            title="Adaptive Questions"
            description="Personalized technical questions are generated specifically matching your experience level."
          />

          <Step
            number="03"
            title="Voice Interview"
            description="Speak naturally with your AI interviewer with live audio visualization and camera feedback."
          />

          <Step
            number="04"
            title="Executive Dossier"
            description="Receive an evaluation report with scores, strengths, weaknesses, and downloadable report file."
          />

          <Step
            number="05"
            title="Mentorship & Growth"
            description="Deep-dive into career pathing and system design coaching with our dedicated LLM chatbots."
          />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta">
        <div>
          <span className="section-label">GET STARTED</span>
          <h2>Ready to elevate your engineering career?</h2>
        </div>

        <button
          className="hero-primary"
          onClick={() => navigate("/upload")}
        >
          Start Mock Interview <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <span>InterviewAI</span>
        </div>
        <span>AI-powered technical interview & mentorship platform</span>
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="workflow-step">
      <div className="step-number">{number}</div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default Landing;