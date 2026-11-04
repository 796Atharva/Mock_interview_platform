// AI Chatbot Service
// Routes chatbot requests to the Spring Boot backend powered by Groq LLM

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Call the backend career guidance endpoint
 */
export async function callCareerGuidance({ message, resumeId, history = [] }) {
  const response = await fetch(`${API_URL}/api/chat/career-guidance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      resumeId,
      history
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Server error (${response.status})`);
  }

  return response.json();
}

/**
 * Call the backend mentor chat endpoint
 */
export async function callMentorChat({ message, mode, history = [] }) {
  const response = await fetch(`${API_URL}/api/chat/mentor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      mode,
      history
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Server error (${response.status})`);
  }

  return response.json();
}

/**
 * Legacy wrapper for callGemini routing safely to backend
 */
export async function callGemini({ prompt, systemInstruction = "", history = [] }) {
  const isMentor = (systemInstruction || "").includes("Alex");
  const endpoint = isMentor ? `${API_URL}/api/chat/mentor` : `${API_URL}/api/chat/career-guidance`;

  const payload = isMentor
    ? {
        message: prompt,
        mode: "general",
        history: history.map((h) => ({ role: h.role, content: h.text || h.content }))
      }
    : {
        message: prompt,
        history: history.map((h) => ({ role: h.role, content: h.text || h.content }))
      };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Chat request failed (${res.status})`);
  }

  const data = await res.json();
  return { text: data.response };
}
