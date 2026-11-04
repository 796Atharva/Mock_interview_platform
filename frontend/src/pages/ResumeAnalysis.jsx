import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Compass, Play, ArrowLeft, Sparkles, User, FileText, CheckCircle2 } from "lucide-react";
import "./ResumeAnalysis.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ResumeAnalysis() {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadResume() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/resumes/${resumeId}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            `Could not load resume (HTTP ${response.status}).`
          );
        }

        const data = await response.json();
        setResume(data);

        // Store in localStorage for Career Guidance Chatbot
        try {
          localStorage.setItem("LAST_RESUME_ANALYSIS", JSON.stringify(data));
        } catch {
          // ignore
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load resume.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (resumeId) loadResume();

    return () => controller.abort();
  }, [resumeId]);

  if (loading) {
    return (
      <main className="analysis-page">
        <div className="analysis-container">
          <div className="analysis-spinner" />
          <p className="analysis-eyebrow">AI RESUME PARSING</p>
          <h1>Extracting technical experience...</h1>
          <p>Analyzing skills, past projects, and preparing interview questions.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="analysis-page">
        <div className="analysis-container analysis-error-box">
          <p className="analysis-eyebrow">NOTICE</p>
          <h1>Unable to retrieve resume profile</h1>
          <p>{error}</p>
          <div className="error-actions">
            <button className="primary-action-btn" onClick={() => window.location.reload()}>
              Try again
            </button>
            <Link to="/upload" className="secondary-action-btn">
              Back to upload
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!resume) return null;

  return (
    <main className="analysis-page">
      <div className="analysis-container">
        <Link to="/upload" className="analysis-back">
          <ArrowLeft size={14} /> Back to Upload
        </Link>

        <header className="analysis-header">
          <div className="analysis-badge">
            <Sparkles size={14} />
            <span>AI RESUME VERIFICATION</span>
          </div>
          <h1>Candidate Professional Profile</h1>
          <p>
            Your technical credentials and experience have been parsed. You can now launch your
            personalized mock interview or explore high-growth career pathways.
          </p>
        </header>

        {/* Candidate Summary Card */}
        <section className="analysis-card">
          <div className="analysis-card-title">
            <User size={18} className="accent-indigo" />
            <h2>{resume.candidateName || "Candidate Profile"}</h2>
          </div>
          <div className="candidate-grid">
            <div>
              <span className="candidate-label">Email</span>
              <strong>{resume.candidateEmail || "Email unavailable"}</strong>
            </div>
            <div>
              <span className="candidate-label">Source Document</span>
              <strong>{resume.originalFileName || "Uploaded PDF"}</strong>
            </div>
            <div>
              <span className="candidate-label">System Resume ID</span>
              <strong>#{resume.resumeId}</strong>
            </div>
          </div>
        </section>

        {/* AI Insights Card */}
        <section className="analysis-card">
          <div className="analysis-card-title">
            <Sparkles size={18} className="accent-purple" />
            <h2>AI Technical Summary</h2>
          </div>
          {resume.summary?.trim() ? (
            <p className="analysis-summary">{resume.summary}</p>
          ) : (
            <p className="analysis-muted">
              Resume successfully extracted. Review structured details below.
            </p>
          )}
        </section>

        {/* Extracted Markdown Preview */}
        <section className="analysis-card">
          <div className="analysis-card-title">
            <FileText size={18} className="accent-blue" />
            <h2>Extracted Technical Background</h2>
          </div>
          {resume.markdownContent?.trim() ? (
            <pre className="analysis-markdown">{resume.markdownContent}</pre>
          ) : (
            <p className="analysis-muted">No extracted markdown content is available.</p>
          )}
        </section>

        {/* Dual Actions: Mock Interview OR Career Guidance */}
        <div className="analysis-actions">
          <button
            className="analysis-career-button"
            onClick={() => navigate(`/career-guidance?resumeId=${resume.resumeId}`)}
          >
            <Compass size={16} />
            <span>Career Guidance & Pathways</span>
          </button>

          <button
            className="analysis-start-button"
            onClick={() => navigate(`/interview?resumeId=${resume.resumeId}`)}
          >
            <Play size={16} />
            <span>Launch Mock Interview →</span>
          </button>
        </div>
      </div>
    </main>
  );
}
