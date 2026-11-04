import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Download,
  Printer,
  Sparkles,
  Compass,
  MessageSquare,
  AlertCircle,
  Share2,
  Check,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import "./Report.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error;
    throw new Error(message || `Request failed (${response.status})`);
  }

  return data;
}

function getScore(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const score = Number(value);
  if (!Number.isFinite(score)) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function ScoreRing({ score }) {
  const value = getScore(score);

  return (
    <div
      className="report-score-ring"
      style={{ "--score": value ?? 0 }}
      aria-label={
        value === null ? "Score unavailable" : `Score ${value} out of 100`
      }
    >
      <div className="report-score-ring-inner">
        <strong>{value === null ? "—" : value}</strong>
        <span>out of 100</span>
      </div>
    </div>
  );
}

function ScoreRow({ label, score }) {
  const value = getScore(score);

  return (
    <div className="report-score-row">
      <div className="report-score-row-heading">
        <span>{label}</span>
        <strong>{value === null ? "N/A" : `${value}/100`}</strong>
      </div>

      <div className="report-progress-track">
        <div
          className="report-progress-fill"
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
    </div>
  );
}

function TextSection({ title, content, icon, className = "" }) {
  const items = Array.isArray(content)
    ? content
    : typeof content === "string"
    ? content
        .split(/\n|•|(?<=\.)\s+(?=[A-Z])/)
        .map((item) => item.replace(/^[-*\d.)\s]+/, "").trim())
    : [];

  const cleanItems = items.filter(Boolean);

  return (
    <section className={`report-card report-text-card ${className}`}>
      <div className="report-card-title">
        <span className="report-card-icon">{icon}</span>
        <h2>{title}</h2>
      </div>

      {cleanItems.length > 0 ? (
        <ul className="report-text-list">
          {cleanItems.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="report-muted">
          No {title.toLowerCase()} recorded for this evaluation.
        </p>
      )}
    </section>
  );
}

export default function Report() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);

  const loadReport = useCallback(async () => {
    if (!interviewId || !/^\d+$/.test(interviewId)) {
      setError("The interview ID is invalid.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const base = `${API_URL}/api/interviews/${interviewId}`;

      // 1. Try to fetch existing report
      let existingReport = null;
      try {
        existingReport = await requestJson(`${base}/report`);
      } catch (err) {
        // Not generated yet
      }

      if (existingReport && typeof existingReport === "object") {
        setReport(existingReport);
        setLoading(false);
        return;
      }

      // 2. Evaluate interview answers
      try {
        await requestJson(`${base}/evaluate`, { method: "POST" });
      } catch (evalErr) {
        console.warn("Evaluation step warning:", evalErr);
      }

      // 3. Generate report
      const generatedReport = await requestJson(`${base}/report`, {
        method: "POST",
      });

      if (generatedReport && typeof generatedReport === "object") {
        setReport(generatedReport);
      } else {
        throw new Error("No report data returned from server.");
      }
    } catch (err) {
      console.error("Report fetch/generation failed:", err);
      setError(
        err.message ||
        "Failed to load or generate the interview report. Please verify backend connection and try again."
      );
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    loadReport();
  }, [loadReport, attempt]);

  // Download Report as JSON file
  const handleDownloadJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${interviewId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print / Save as PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Copy Summary
  const handleCopySummary = () => {
    if (!report?.summary) return;
    navigator.clipboard.writeText(
      `Interview #${interviewId} Report\nOverall Score: ${report.overallScore}/100\nVerdict: ${report.finalVerdict}\n\nSummary:\n${report.summary}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const overallScore = getScore(report?.overallScore);

  const scores = [
    {
      label: "Technical Knowledge",
      value: report?.technicalKnowledgeScore,
    },
    {
      label: "Problem Solving",
      value: report?.problemSolvingScore,
    },
    {
      label: "Communication",
      value: report?.communicationScore,
    },
    {
      label: "Practical Knowledge",
      value: report?.practicalKnowledgeScore,
    },
  ];

  if (loading) {
    return (
      <main className="report-page">
        <div className="report-loading">
          <div className="report-spinner" />
          <p>Compiling Your Technical Evaluation Report</p>
          <span>Synthesizing answers, video metrics & AI insights...</span>
        </div>
      </main>
    );
  }

  if (error && !report) {
    return (
      <main className="report-page">
        <div className="report-error-card">
          <AlertCircle size={32} className="error-icon-red" />
          <p className="report-eyebrow">REPORT GENERATION NOTICE</p>
          <h1>Report is being processed</h1>
          <p>{error}</p>

          <div className="report-error-actions">
            <button
              className="report-primary-button"
              onClick={() => setAttempt((value) => value + 1)}
            >
              <RotateCcw size={14} />
              <span>Retry Generation</span>
            </button>

            <button
              className="report-secondary-button"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="report-page">
      <div className="report-shell">
        {/* Header */}
        <header className="report-header">
          <div className="report-brand">
            <span className="report-brand-mark">AI</span>
            <span>
              Interview<span className="report-brand-accent">Report</span>
            </span>
          </div>

          <div className="report-header-right">
            <span className="report-status">
              <span className="report-status-dot" />
              Evaluation Finalized
            </span>

            {/* Export and download actions */}
            <div className="report-action-buttons">
              <button
                className="report-export-btn"
                onClick={handlePrintPdf}
                title="Print or Save as PDF"
              >
                <Printer size={15} />
                <span>Save PDF</span>
              </button>

              <button
                className="report-export-btn"
                onClick={handleDownloadJson}
                title="Download JSON Report File"
              >
                <Download size={15} />
                <span>Download Report File</span>
              </button>

              <button
                className="report-export-btn"
                onClick={handleCopySummary}
                title="Copy Executive Summary"
              >
                {copied ? <Check size={15} /> : <Share2 size={15} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Intro */}
        <section className="report-intro">
          <p className="report-eyebrow">PERFORMANCE DOSSIER</p>
          <h1>
            Your technical performance, <span>analyzed.</span>
          </h1>
          <p>
            Comprehensive evaluation synthesized from your responses, clarity,
            and real-time interview signals.
          </p>
        </section>

        {/* Hero Grid */}
        <section className="report-hero-grid">
          {/* Overall Card */}
          <div className="report-card report-overall-card">
            <div>
              <p className="report-eyebrow">OVERALL SCORE</p>
              <h2>Executive Score</h2>
              <p className="report-muted">
                Weighted calculation across technical, communication, and problem-solving metrics.
              </p>
            </div>

            <ScoreRing score={overallScore} />

            <div className="report-overall-footer">
              <span>Interview Session</span>
              <strong>#{interviewId}</strong>
            </div>
          </div>

          {/* Verdict Card */}
          <div className="report-card report-verdict-card">
            <div className="report-card-title">
              <Sparkles size={18} className="accent-sparkle" />
              <h2>Final Verdict</h2>
            </div>

            <div className="report-verdict-value">
              {report.finalVerdict || "Good Candidate"}
            </div>

            <div className="report-verdict-divider" />

            <p className="report-eyebrow">AI EVALUATION SUMMARY</p>
            <p className="report-summary">
              {report.summary || "No evaluation summary provided."}
            </p>

            {report.createdAt && (
              <p className="report-date">
                Report Generated:{" "}
                {Number.isNaN(Date.parse(report.createdAt))
                  ? report.createdAt
                  : new Date(report.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        </section>

        {/* Performance Breakdown */}
        <section className="report-card report-breakdown-card">
          <div className="report-section-heading">
            <div>
              <p className="report-eyebrow">CORE METRICS</p>
              <h2>Skill Assessment Breakdown</h2>
            </div>
            <span className="report-section-tag">4 Categories</span>
          </div>

          <div className="report-score-list">
            {scores.map(({ label, value }) => (
              <ScoreRow key={label} label={label} score={value} />
            ))}
          </div>
        </section>

        {/* Feedback Grid */}
        <section className="report-feedback-grid">
          <TextSection
            title="Strengths"
            content={report.strengths}
            icon="↗"
            className="report-strengths"
          />

          <TextSection
            title="Areas to Improve"
            content={report.weaknesses}
            icon="◎"
            className="report-weaknesses"
          />

          <TextSection
            title="Actionable Recommendations"
            content={report.recommendations}
            icon="✧"
            className="report-recommendations"
          />
        </section>

        {/* Next Steps: Career Guidance & Mentor Chat Navigation */}
        <section className="report-next-steps-banner">
          <div className="next-step-card">
            <div className="next-step-icon compass-icon">
              <Compass size={22} />
            </div>
            <div className="next-step-content">
              <h3>Explore Next Career Paths</h3>
              <p>
                Use this evaluation and your resume to explore tailored high-salary
                tech career pathways.
              </p>
              <Link to="/career-guidance" className="next-step-link">
                Launch Career Guidance <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="next-step-card">
            <div className="next-step-icon mentor-icon">
              <MessageSquare size={22} />
            </div>
            <div className="next-step-content">
              <h3>Discuss Results with Mentor Alex</h3>
              <p>
                Have 1-on-1 coaching on system design, code patterns, and interview
                tactics.
              </p>
              <Link to="/mentor-chat" className="next-step-link">
                Open Mentor Chat <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="report-footer">
          <div>
            <strong>Interview Complete</strong>
            <p>Every mock interview accelerates your technical mastery.</p>
          </div>

          <div className="report-footer-actions">
            <button
              className="report-secondary-button"
              onClick={() => navigate("/upload")}
            >
              Start New Mock Interview
            </button>
            <button
              className="report-primary-button"
              onClick={() => navigate("/")}
            >
              Back to Home →
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
