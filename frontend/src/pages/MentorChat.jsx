import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Layers,
  Code,
  Users,
  DollarSign,
  Copy,
  Check
} from "lucide-react";
import "./MentorChat.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const MENTOR_MODES = [
  {
    id: "general",
    title: "General Mentor",
    icon: <Sparkles size={14} />,
    description: "Holistic technical & engineering career coaching"
  },
  {
    id: "system-design",
    title: "System Design Coach",
    icon: <Layers size={14} />,
    description: "High-scale architecture, trade-offs & distributed systems"
  },
  {
    id: "technical",
    title: "Code & Technical",
    icon: <Code size={14} />,
    description: "DSA, concurrency, clean code & performance tuning"
  },
  {
    id: "behavioral",
    title: "Behavioral & STAR",
    icon: <Users size={14} />,
    description: "Story framing, leadership & culture fit questions"
  },
  {
    id: "negotiation",
    title: "Offer & Negotiation",
    icon: <DollarSign size={14} />,
    description: "Leveling, equity & counter-offer strategies"
  }
];

export default function MentorChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState("general");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `👋 Hey there! I'm **Alex**, your dedicated AI Technical Mentor.

I'm here to give you candid, battle-tested advice on:
- 🏗️ **System Design**: Architecting distributed services, databases, caching & queues.
- 💻 **Technical Depth**: Writing robust, scalable code and acing technical rounds.
- 🎙️ **Behavioral Stories**: Refining your impact stories using the STAR framework.
- 📈 **Career Progression**: Moving from Mid → Senior → Staff, negotiating offers & leveling up.

What challenge or topic would you like to tackle right now?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, []);

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

      const res = await fetch(`${API_URL}/api/chat/mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          mode: selectedMode,
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
        content: data.response || "No guidance received.",
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Mentor chat error:", err);
      const errorMessage = {
        role: "assistant",
        content: `⚠️ ${err.message || "Unable to reach Mentor service. Please check backend connection and GROQ_API_KEY."}`,
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

  const promptSuggestions = {
    general: [
      "How do I prepare for a Senior Engineer interview loop in 30 days?",
      "What are the biggest mistakes candidates make during technical interviews?",
      "How do I highlight my contribution when my team built a feature together?"
    ],
    "system-design": [
      "Walk me through designing a distributed URL shortener with 100M DAU.",
      "How should I explain caching strategies and cache invalidation?",
      "Design a real-time notification service (WebSocket vs SSE vs Push)."
    ],
    technical: [
      "How should I explain concurrency vs parallelism with practical examples?",
      "Give me a mock question on database indexing and query optimization.",
      "How do I structure my thought process when solving an unfamiliar algorithm?"
    ],
    behavioral: [
      "How should I answer: 'Tell me about a time you had a technical disagreement with your lead'?",
      "Can you review my STAR story for a critical production outage I resolved?",
      "How do I showcase ownership and initiative without sounding boastful?"
    ],
    negotiation: [
      "How do I negotiate a higher base salary when I have only one offer?",
      "What questions should I ask the hiring manager to evaluate team culture?",
      "How should I evaluate equity (RSUs vs Stock Options) in early-stage vs public companies?"
    ]
  };

  const currentPrompts = promptSuggestions[selectedMode] || promptSuggestions.general;

  return (
    <div className="mentor-page">
      <div className="mentor-shell">
        {/* Header */}
        <header className="mentor-header">
          <div className="mentor-header-info">
            <div className="mentor-icon-badge">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="mentor-title-row">
                <h1>1-on-1 Mentor Chat</h1>
                <span className="mentor-model-badge">AI Staff Mentor</span>
              </div>
              <p>Personalized technical mentorship, system design coaching & interview strategy with Alex.</p>
            </div>
          </div>
        </header>

        {/* Mentor Modes */}
        <div className="mentor-mode-selector">
          {MENTOR_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`mode-btn ${selectedMode === mode.id ? "active" : ""}`}
              onClick={() => setSelectedMode(mode.id)}
            >
              <span className="mode-icon">{mode.icon}</span>
              <span className="mode-title">{mode.title}</span>
            </button>
          ))}
        </div>

        {/* Chat Card */}
        <div className="mentor-chat-card">
          <div className="mentor-messages-scroll">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mentor-message-row ${msg.role === "user" ? "user-row" : "bot-row"}`}
              >
                <div className="message-avatar">
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className="message-bubble">
                  <div className="message-meta">
                    <strong>{msg.role === "user" ? "You" : "Alex (Staff Mentor)"}</strong>
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
              <div className="mentor-message-row bot-row">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-bubble loading-bubble">
                  <div className="typing-dots-purple">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>Alex is thinking and drafting guidance...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="mentor-quick-prompts">
            {currentPrompts.map((promptText, i) => (
              <button
                key={i}
                className="quick-prompt-chip-mentor"
                onClick={() => handleSend(promptText)}
                disabled={loading}
              >
                <span>{promptText}</span>
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mentor-input-bar"
          >
            <input
              type="text"
              placeholder="Ask Alex about system design, code reviews, behavioral stories, or leveling..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="mentor-send-btn"
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
