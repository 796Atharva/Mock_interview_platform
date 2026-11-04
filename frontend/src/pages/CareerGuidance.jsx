import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Compass,
  Send,
  FileText,
  Bot,
  User,
  Briefcase,
  TrendingUp,
  Target,
  Award,
  Copy,
  Check
} from "lucide-react";
import "./CareerGuidance.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function CareerGuidance() {
  const [searchParams] = useSearchParams();
  const resumeIdParam = searchParams.get("resumeId");

  const [resumeData, setResumeData] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Load resume data from API or localStorage
  useEffect(() => {
    async function fetchResume() {
      if (resumeIdParam) {
        try {
          const res = await fetch(`${API_URL}/api/resumes/${resumeIdParam}`);
          if (res.ok) {
            const data = await res.json();
            setResumeData(data);
            setResumeText(data.markdownContent || data.summary || "");
            return;
          }
        } catch (err) {
          console.warn("Could not fetch resume:", err);
        }
      }

      // Check localStorage for recently analyzed resume
      const stored = localStorage.getItem("LAST_RESUME_ANALYSIS");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setResumeData(parsed);
          setResumeText(parsed.markdownContent || parsed.summary || "");
        } catch {
          // Ignore parse errors
        }
      }
    }
    fetchResume();
  }, [resumeIdParam]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `👋 Hello! I am your **AI Career Guidance Advisor**.
          
I analyze your resume, technical skills, and experience to map out high-growth, high-impact career pathways.

${
  resumeData
    ? `✅ I have loaded the resume for **${resumeData.candidateName || "Candidate"}**. I'm ready to recommend tailored career paths, skill bridge plans, and target compensation benchmarks!`
    : "💡 *Tip: If you've uploaded a resume, I will automatically tailor suggestions to your background. You can also select a quick query below.*"
}

What career goals or questions are on your mind today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [resumeData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.slice(1).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${API_URL}/api/chat/career-guidance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          resumeId: resumeData?.resumeId ? Number(resumeData.resumeId) : null,
          history: historyPayload
        })
      });

      if (!res.ok) {
        let errMessage = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          if (errData?.error || errData?.message) {
            errMessage = errData.error || errData.message;
          }
        } catch {
          // non-json error
        }
        throw new Error(errMessage);
      }

      const data = await res.json();

      const aiMessage = {
        role: "assistant",
        content: data.response || "No response received.",
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Career guidance error:", err);
      const errorMessage = {
        role: "assistant",
        content: `⚠️ ${err.message || "Unable to reach Career Guidance service. Please verify backend connection and GROQ_API_KEY."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const quickPrompts = [
    {
      icon: <TrendingUp size={14} />,
      label: "Suggest 3 Best Career Paths",
      prompt: "Based on my resume, suggest 3 high-impact career pathways with skill match percentages, growth potential, and target roles."
    },
    {
      icon: <Target size={14} />,
      label: "Skill Gap & Bridge Analysis",
      prompt: "Identify the biggest technical gaps in my profile and what specific tools or concepts I should learn next to level up."
    },
    {
      icon: <Briefcase size={14} />,
      label: "30-60-90 Day Roadmap",
      prompt: "Create a structured 30-60-90 day roadmap for me to transition into a senior engineering or AI engineering role."
    },
    {
      icon: <Award size={14} />,
      label: "Top Certifications & Projects",
      prompt: "What are the highest ROI certifications and portfolio projects that would immediately boost my hireability?"
    }
  ];

  return (
    <div className="career-page">
      <div className="career-shell">
        {/* Header */}
        <header className="career-header">
          <div className="career-header-info">
            <div className="career-icon-badge">
              <Compass size={20} />
            </div>
            <div>
              <div className="career-title-row">
                <h1>Career Guidance AI</h1>
                <span className="career-model-badge">AI Career Engine</span>
              </div>
              <p>Personalized career pathing, skill bridging, and growth roadmaps powered by your resume.</p>
            </div>
          </div>
        </header>

        {/* Resume Status Banner */}
        <div className="career-resume-banner">
          <div className="resume-banner-left">
            <FileText size={16} className="accent-file" />
            {resumeData ? (
              <span>
                Using profile data for <strong>{resumeData.candidateName || "Uploaded Resume"}</strong>{" "}
                ({resumeData.originalFileName || `Resume #${resumeData.resumeId}`})
              </span>
            ) : (
              <span>No resume attached. Upload or analyze a resume to unlock fully tailored insights.</span>
            )}
          </div>
          <Link to="/upload" className="resume-banner-link">
            {resumeData ? "Upload New Resume" : "Upload Resume →"}
          </Link>
        </div>

        {/* Chat Area */}
        <div className="career-chat-card">
          <div className="career-messages-scroll">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`career-message-row ${msg.role === "user" ? "user-row" : "bot-row"}`}
              >
                <div className="message-avatar">
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className="message-bubble">
                  <div className="message-meta">
                    <strong>{msg.role === "user" ? "You" : "Career Advisor AI"}</strong>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>

                  <div className="message-text">
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>

                  {msg.role === "assistant" && (
                    <button
                      className="copy-btn"
                      onClick={() => copyMessage(idx, msg.content)}
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={12} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="career-message-row bot-row">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-bubble loading-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>Analyzing career pathways...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="career-quick-prompts">
            {quickPrompts.map((item, i) => (
              <button
                key={i}
                className="quick-prompt-chip"
                onClick={() => handleSend(item.prompt)}
                disabled={loading}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="career-input-bar"
          >
            <input
              type="text"
              placeholder="Ask about career transitions, salaries, skill roadmaps, or target roles..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="career-send-btn"
              disabled={!input.trim() || loading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
