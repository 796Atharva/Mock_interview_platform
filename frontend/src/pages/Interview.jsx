
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as VapiModule from "@vapi-ai/web";
import {
  Mic,
  Volume2,
  RotateCcw,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Sparkles,
} from "lucide-react";
import VideoAnalyzer from "../components/VideoAnalyzer";
import "./Interview.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

let VapiClass = VapiModule.default;

if (
  VapiClass &&
  typeof VapiClass !== "function" &&
  VapiClass.default
) {
  VapiClass = VapiClass.default;
}

function safeError(error) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function getEndedReason(call) {
  return (
    call?.endedReason ||
    call?.reason ||
    call?.error?.message ||
    "unknown"
  );
}

async function checkedFetch(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let details = "";

    try {
      details = await response.text();
    } catch {
      // Response body may not be readable.
    }

    throw new Error(
      `${options.method || "GET"} ${url} failed (${response.status})` +
        (details ? `: ${details.slice(0, 300)}` : "")
    );
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

/**
 * Merge cumulative or overlapping transcript fragments.
 *
 * Examples:
 * "I know Java" + "I know Java well"
 * -> "I know Java well"
 *
 * "I know Java" + "Java and Spring Boot"
 * -> "I know Java and Spring Boot"
 */
function mergeTranscript(existing = "", incoming = "") {
  const previous = existing.trim();
  const next = incoming.trim();

  if (!previous) return next;
  if (!next) return previous;

  if (next.startsWith(previous)) return next;
  if (previous.startsWith(next)) return previous;

  const oldWords = previous.split(/\s+/);
  const newWords = next.split(/\s+/);
  const maxOverlap = Math.min(oldWords.length, newWords.length);

  for (let size = maxOverlap; size > 0; size--) {
    const oldEnd = oldWords.slice(-size).join(" ");
    const newStart = newWords.slice(0, size).join(" ");

    if (oldEnd.toLowerCase() === newStart.toLowerCase()) {
      return [...oldWords, ...newWords.slice(size)].join(" ");
    }
  }

  return `${previous} ${next}`;
}

export default function Interview({
  resumeId: resumeIdProp,
  onComplete,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resumeId =
    resumeIdProp || searchParams.get("resumeId");

  const vapiRef = useRef(null);
  const videoAnalyzerRef = useRef(null);
  const interviewRef = useRef(null);

  const processingAnswerRef = useRef(false);
  const pendingAnswerRef = useRef(null);
  const intentionalEndRef = useRef(false);
  const startingCallRef = useRef(false);
  const finishingInterviewRef = useRef(false);
  const completedRef = useRef(false);
  const callActiveRef = useRef(false);
  const mountedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Transcript accumulation and timing.
  const answerBufferRef = useRef("");
  const currentPartialTranscriptRef = useRef("");
  const currentQuestionTextRef = useRef("");
  const autoSubmitTimerRef = useRef(null);
  const userSpeakingRef = useRef(false);
  const aiSpeakingRef = useRef(false);
  const lastSubmittedAnswerRef = useRef("");

  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [answerDraft, setAnswerDraft] = useState("");
  const [videoMetrics, setVideoMetrics] = useState(null);

  const [callActive, setCallActive] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(true);

  const [status, setStatus] = useState(
    "Preparing your technical interview"
  );
  const [error, setError] = useState("");
  const [endedReason, setEndedReason] = useState("");

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const updateCallActive = useCallback((value) => {
    callActiveRef.current = value;
    setCallActive(value);
  }, []);

  const updateAiSpeaking = useCallback((value) => {
    aiSpeakingRef.current = value;
    setAiSpeaking(value);
  }, []);

  const clearAutoSubmitTimer = useCallback(() => {
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
  }, []);

  /**
   * Complete the interview only after any pending answer has been saved.
   * The report is generated before navigating to the report page.
   */
  const finishInterview = useCallback(async () => {
    if (
      finishingInterviewRef.current ||
      completedRef.current
    ) {
      return;
    }

    if (processingAnswerRef.current) {
      setStatus("Saving your answer before finishing...");
      return;
    }

    // Do not silently discard the current unsaved answer.
    const unsavedAnswer = answerBufferRef.current.trim();

    if (unsavedAnswer.length >= 5) {
      setStatus("Saving your final answer first...");
      await saveAnswer(unsavedAnswer);
      return;
    }

    const interviewId = interviewRef.current?.interviewId;

    if (!interviewId) {
      setError("Cannot finish: interview ID is missing.");
      return;
    }

    clearAutoSubmitTimer();
    finishingInterviewRef.current = true;
    setLoading(true);
    setError("");

    try {
      const metrics =
        videoAnalyzerRef.current?.getFinalMetrics?.();

      if (metrics) {
        setVideoMetrics(metrics);

        try {
          await checkedFetch(
            `${API_URL}/api/interviews/${interviewId}/video-metrics`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(metrics),
            }
          );
        } catch (metricError) {
          console.warn("Video metrics save warning:", metricError);
        }
      }

      setStatus("Completing interview...");

      await checkedFetch(
        `${API_URL}/api/interviews/${interviewId}/complete`,
        { method: "POST" }
      );

      setStatus("Evaluating your answers...");

      await checkedFetch(
        `${API_URL}/api/interviews/${interviewId}/evaluate`,
        { method: "POST" }
      );

      setStatus("Generating your interview report...");

      await checkedFetch(
        `${API_URL}/api/interviews/${interviewId}/report`,
        { method: "POST" }
      );

      intentionalEndRef.current = true;

      if (vapiRef.current) {
        try {
          await vapiRef.current.stop();
        } catch (stopError) {
          console.warn("Vapi stop warning:", stopError);
        }
      }

      completedRef.current = true;
      updateCallActive(false);
      updateAiSpeaking(false);
      userSpeakingRef.current = false;
      setUserSpeaking(false);
      setStatus("Interview completed");

      if (onCompleteRef.current) {
        onCompleteRef.current(interviewId);
      }

      navigate(`/report/${interviewId}`);
    } catch (err) {
      console.error("Interview completion failed:", err);
      setError(safeError(err));
      setStatus("Could not finish interview");
    } finally {
      finishingInterviewRef.current = false;
      setLoading(false);
    }
  }, [
    clearAutoSubmitTimer,
    navigate,
    updateCallActive,
    updateAiSpeaking,
  ]);

  /**
   * Persist one complete accumulated answer and advance the interview.
   */
  const saveAnswer = useCallback(async (answerText) => {
    const cleanedAnswer = answerText?.trim();

    if (
      !cleanedAnswer ||
      completedRef.current ||
      finishingInterviewRef.current
    ) {
      return;
    }

    if (cleanedAnswer.length < 5) {
      return;
    }

    if (processingAnswerRef.current) {
      pendingAnswerRef.current = mergeTranscript(
        pendingAnswerRef.current || "",
        cleanedAnswer
      );
      return;
    }

    if (!interviewRef.current) return;

    // Prevent an accidental duplicate submission.
    if (cleanedAnswer === lastSubmittedAnswerRef.current) {
      return;
    }

    processingAnswerRef.current = true;
    clearAutoSubmitTimer();
    setLoading(true);
    setError("");
    setStatus("Saving your answer...");

    try {
      const interviewId = interviewRef.current.interviewId;

      const data = await checkedFetch(
        `${API_URL}/api/interviews/${interviewId}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: cleanedAnswer,
          }),
        }
      );

      // Only clear the buffer after the server accepts the answer.
      lastSubmittedAnswerRef.current = cleanedAnswer;
      answerBufferRef.current = "";
      currentPartialTranscriptRef.current = "";
      pendingAnswerRef.current = null;

      setAnswerDraft("");

      setTranscript((previous) => [
        ...previous,
        {
          role: "user",
          text: cleanedAnswer,
        },
      ]);

      console.log("Complete answer saved:", data);

      if (data?.completed) {
        processingAnswerRef.current = false;
        setLoading(false);
        await finishInterview();
        return;
      }

      if (!data?.nextQuestion) {
        throw new Error(
          "The server saved the answer but did not return the next question."
        );
      }

      interviewRef.current = {
        ...interviewRef.current,
        questionNumber:
          data.nextQuestionNumber ??
          interviewRef.current.questionNumber,
      };

      setInterview((previous) => ({
        ...previous,
        questionNumber:
          data.nextQuestionNumber ??
          previous?.questionNumber,
      }));

      setCurrentQuestion(data.nextQuestion);
      currentQuestionTextRef.current = data.nextQuestion;

      setStatus(
        `Question ${data.nextQuestionNumber ?? ""} of ${
          data.totalQuestions ??
          interviewRef.current.totalQuestions ??
          ""
        }`
      );

      if (!vapiRef.current || !callActiveRef.current) {
        setStatus("Answer saved. Voice connection is not active.");
        return;
      }

      updateAiSpeaking(true);

      await vapiRef.current.send({
        type: "add-message",
        message: {
          role: "system",
          content: `
The application has advanced the interview.

Ask ONLY this exact interview question:
${data.nextQuestion}

Do not invent another question.
Do not evaluate or summarize the previous answer.
Ask the question naturally, then wait for the candidate's response.
          `.trim(),
        },
      });
    } catch (err) {
      console.error("Answer submission failed:", err);
      setError(safeError(err));
      setStatus("Answer could not be saved. Please retry.");

      // Keep the answer buffer intact so it can be retried.
      lastSubmittedAnswerRef.current = "";
    } finally {
      processingAnswerRef.current = false;
      setLoading(false);

      const pending = pendingAnswerRef.current;
      pendingAnswerRef.current = null;

      if (
        pending &&
        !completedRef.current &&
        !finishingInterviewRef.current
      ) {
        const mergedPending = mergeTranscript(
          answerBufferRef.current,
          pending
        );

        answerBufferRef.current = mergedPending;
        setAnswerDraft(mergedPending);
      }
    }
  }, [
    clearAutoSubmitTimer,
    finishInterview,
    updateAiSpeaking,
  ]);

  /**
   * Start a delay after transcript activity.
   * If speech is still active, check again rather than submitting.
   */
  const scheduleAutoSubmit = useCallback(() => {
    clearAutoSubmitTimer();

    if (!autoSubmitEnabled) return;

    const attemptAutoSubmit = () => {
      if (
        !mountedRef.current ||
        completedRef.current ||
        finishingInterviewRef.current ||
        processingAnswerRef.current
      ) {
        return;
      }

      if (
        userSpeakingRef.current ||
        aiSpeakingRef.current
      ) {
        autoSubmitTimerRef.current = setTimeout(
          attemptAutoSubmit,
          1500
        );
        return;
      }

      const fullAnswer = answerBufferRef.current.trim();

      if (fullAnswer.length >= 5) {
        console.log("Auto-submitting accumulated answer:", fullAnswer);
        void saveAnswer(fullAnswer);
      }
    };

    autoSubmitTimerRef.current = setTimeout(
      attemptAutoSubmit,
      15000
    );
  }, [
    autoSubmitEnabled,
    clearAutoSubmitTimer,
    saveAnswer,
  ]);

  /**
   * Initialize Vapi event handlers.
   */
  useEffect(() => {
    mountedRef.current = true;

    if (!VAPI_PUBLIC_KEY) {
      setError("Vapi public key is missing. Check your frontend environment.");
      return;
    }

    if (!VAPI_ASSISTANT_ID) {
      setError("Vapi assistant ID is missing. Check your frontend environment.");
      return;
    }

    if (!VapiClass) {
      setError("Unable to load the Vapi SDK.");
      return;
    }

    const vapi = new VapiClass(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    const handleCallStart = () => {
      if (!mountedRef.current) return;

      updateCallActive(true);
      setStatus("Interview in progress");
      setError("");
      startingCallRef.current = false;
    };

    const handleCallEnd = (call) => {
      if (!mountedRef.current) return;

      const reason = getEndedReason(call);

      updateCallActive(false);
      updateAiSpeaking(false);
      userSpeakingRef.current = false;
      setUserSpeaking(false);
      setEndedReason(reason);
      startingCallRef.current = false;

      if (
        !intentionalEndRef.current &&
        !completedRef.current
      ) {
        setStatus("Voice connection ended");
        setError(
          `Voice interview ended unexpectedly. Reason: ${reason}`
        );
      }
    };

    const handleMessage = (message) => {
      if (!mountedRef.current) return;

      if (message?.type === "speech-start") {
        if (message.role === "assistant") {
          updateAiSpeaking(true);
        }

        if (message.role === "user") {
          userSpeakingRef.current = true;
          setUserSpeaking(true);
        }

        return;
      }

      if (message?.type === "speech-end") {
        if (message.role === "assistant") {
          updateAiSpeaking(false);
        }
      
        if (message.role === "user") {
          userSpeakingRef.current = false;
          setUserSpeaking(false);
        }
      
        return;
      }
      if (
        message?.type !== "transcript" ||
        message?.role !== "user"
      ) {
        return;
      }

      if (
        completedRef.current ||
        finishingInterviewRef.current
      ) {
        return;
      }

      const rawTranscript =
        typeof message.transcript === "string"
          ? message.transcript.trim()
          : "";

      if (!rawTranscript) return;

      // Avoid treating the interview question itself as the answer.
      const question = currentQuestionTextRef.current
        .trim()
        .toLowerCase();

      const normalized = rawTranscript.toLowerCase();

      if (
        question.length > 10 &&
        (
          question === normalized ||
          question.includes(normalized) ||
          normalized.includes(question.slice(0, 30))
        )
      ) {
        console.log("Ignoring question echo:", rawTranscript);
        return;
      }

      const transcriptType = message.transcriptType;

      if (transcriptType && transcriptType !== "final") {
        // Partial transcripts can be revised, so don't save them
        // independently as complete answers.
        currentPartialTranscriptRef.current = rawTranscript;

        const draft = mergeTranscript(
          answerBufferRef.current,
          rawTranscript
        );

        setAnswerDraft(draft);
        console.log("Partial transcript:", rawTranscript);

        return;
      }

      // Reconcile the latest partial transcript with the final one.
      let finalizedSegment = rawTranscript;

      const latestPartial =
        currentPartialTranscriptRef.current.trim();

      if (latestPartial) {
        if (latestPartial.startsWith(rawTranscript)) {
          finalizedSegment = latestPartial;
        } else if (rawTranscript.startsWith(latestPartial)) {
          finalizedSegment = rawTranscript;
        } else {
          finalizedSegment = mergeTranscript(
            latestPartial,
            rawTranscript
          );
        }
      }

      currentPartialTranscriptRef.current = "";

      answerBufferRef.current = mergeTranscript(
        answerBufferRef.current,
        finalizedSegment
      );

      const completeDraft = answerBufferRef.current.trim();

      setAnswerDraft(completeDraft);
      console.log("Accumulated answer:", completeDraft);

      scheduleAutoSubmit();
    };

    const handleVapiError = (vapiError) => {
      console.error("Vapi error:", vapiError);

      if (!mountedRef.current) return;

      setError(safeError(vapiError));
      setStatus("Voice connection error");
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleVapiError);

    return () => {
      mountedRef.current = false;
      clearAutoSubmitTimer();

      try {
        vapi.removeAllListeners();
      } catch (err) {
        console.warn("Vapi listener cleanup warning:", err);
      }

      try {
        void vapi.stop();
      } catch (err) {
        console.warn("Vapi cleanup warning:", err);
      }

      if (vapiRef.current === vapi) {
        vapiRef.current = null;
      }
    };
  }, [
    clearAutoSubmitTimer,
    scheduleAutoSubmit,
    updateCallActive,
    updateAiSpeaking,
  ]);

  /**
   * Create the backend interview and start the voice session.
   */
  async function startInterview() {
    if (
      startingCallRef.current ||
      loading ||
      callActiveRef.current
    ) {
      return;
    }

    if (!resumeId) {
      setError("Resume ID is missing. Return to resume analysis and start again.");
      return;
    }

    if (!vapiRef.current) {
      setError("Vapi is not ready.");
      return;
    }

    startingCallRef.current = true;
    setLoading(true);
    setError("");
    setEndedReason("");

    intentionalEndRef.current = false;
    completedRef.current = false;
    finishingInterviewRef.current = false;
    processingAnswerRef.current = false;

    pendingAnswerRef.current = null;
    answerBufferRef.current = "";
    currentPartialTranscriptRef.current = "";
    currentQuestionTextRef.current = "";
    lastSubmittedAnswerRef.current = "";

    userSpeakingRef.current = false;
    aiSpeakingRef.current = false;

    clearAutoSubmitTimer();
    setAnswerDraft("");
    setTranscript([]);

    try {
      setStatus("Creating interview...");

      const data = await checkedFetch(
        `${API_URL}/api/interviews/start/${resumeId}`,
        { method: "POST" }
      );

      if (!data?.interviewId || !data?.question) {
        throw new Error(
          "The backend returned an invalid interview response."
        );
      }

      interviewRef.current = data;
      setInterview(data);
      setCurrentQuestion(data.question);
      currentQuestionTextRef.current = data.question;

      updateAiSpeaking(true);

      setStatus(
        `Question ${data.questionNumber} of ${data.totalQuestions}`
      );

      await vapiRef.current.start(VAPI_ASSISTANT_ID, {
        variableValues: {
          currentQuestion: data.question,
        },
      });
    } catch (err) {
      console.error("Unable to start interview:", err);
      setError(safeError(err));
      setStatus("Unable to start interview");
      startingCallRef.current = false;
    } finally {
      setLoading(false);
    }
  }

  async function handleRepeatQuestion() {
    if (!vapiRef.current || !callActive || !currentQuestion) {
      return;
    }

    try {
      updateAiSpeaking(true);

      await vapiRef.current.send({
        type: "add-message",
        message: {
          role: "system",
          content: `Repeat this interview question clearly and ask nothing else: "${currentQuestion}"`,
        },
      });
    } catch (err) {
      console.warn("Repeat question error:", err);
    }
  }

  function handleManualSubmitAnswer() {
    const answer = answerDraft.trim();

    if (!answer) {
      setError("No speech detected yet. Speak your answer first.");
      return;
    }

    void saveAnswer(answer);
  }

  function handleSkipQuestion() {
    void saveAnswer("Candidate requested to skip this question.");
  }

  async function handleEndInterview() {
    if (!interviewRef.current || completedRef.current) return;

    if (processingAnswerRef.current) {
      setError("Please wait while your answer is being saved.");
      return;
    }

    await finishInterview();
  }

  const progress =
    interview?.totalQuestions > 0
      ? Math.min(
          100,
          ((interview.questionNumber || 1) /
            interview.totalQuestions) *
            100
        )
      : 0;

  return (
    <div className="interview-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="interview-shell">
        <header className="interview-topbar">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={16} />
            </div>
            <div>
              <strong>Technical Interview Room</strong>
              <span>Interactive AI Voice & Vision Session</span>
            </div>
          </div>

          <div className="topbar-controls">
            <label className="auto-submit-toggle">
              <input
                type="checkbox"
                checked={autoSubmitEnabled}
                onChange={(event) =>
                  setAutoSubmitEnabled(event.target.checked)
                }
              />
              <span className="toggle-label">
                Auto-Advance:{" "}
                <strong>{autoSubmitEnabled ? "ON" : "OFF"}</strong>
              </span>
            </label>

            <div className="live-indicator">
              <span
                className={
                  callActive ? "live-dot" : "live-dot idle"
                }
              />
              {callActive ? "VOICE LIVE" : "READY"}
            </div>
          </div>
        </header>

        <main className="interview-main">
          <section className="question-area">
            <div className="question-meta">
              <div>
                <span className="meta-sub">
                  TECHNICAL EVALUATION
                </span>

                {interview && (
                  <strong>
                    Question {interview.questionNumber} of{" "}
                    {interview.totalQuestions}
                  </strong>
                )}
              </div>

              {interview && (
                <div className="progress-track">
                  <div
                    className="progress-value"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="question-card">
              <div className="question-card-top">
                <div className="question-label">
                  <span className="pulse" />
                  CURRENT QUESTION
                </div>

                {callActive && (
                  <button
                    className="repeat-question-btn"
                    onClick={handleRepeatQuestion}
                    title="Repeat the interview question"
                  >
                    <RotateCcw size={14} />
                    <span>Repeat Question</span>
                  </button>
                )}
              </div>

              <h1 className="question-title">
                {currentQuestion ||
                  "Click Start Interview to begin."}
              </h1>

              <div className="voice-status-banner">
                <div
                  className={`voice-orb ${
                    aiSpeaking ? "speaking" : ""
                  } ${userSpeaking ? "user-speaking" : ""}`}
                >
                  <div className="orb-core">
                    {aiSpeaking ? (
                      <Volume2 size={16} />
                    ) : (
                      <Mic size={16} />
                    )}
                  </div>
                </div>

                <div className="voice-status-text">
                  <strong>
                    {aiSpeaking
                      ? "AI Interviewer is speaking..."
                      : userSpeaking
                        ? "Listening to you..."
                        : callActive
                          ? "Listening for your response..."
                          : "Microphone standby"}
                  </strong>

                  <span>
                    {callActive
                      ? "Speak naturally. Your answer will be transcribed."
                      : "Ensure microphone and camera permissions are granted."}
                  </span>
                </div>
              </div>

              {callActive && (
                <div className="answer-draft-box">
                  <div className="draft-header">
                    <span className="draft-tag">
                      LIVE SPEECH RECOGNITION
                    </span>

                    {answerDraft && (
                      <span className="draft-word-count">
                        {answerDraft.split(/\s+/).length} words
                      </span>
                    )}
                  </div>

                  <p className="draft-content">
                    {answerDraft || (
                      <span className="draft-placeholder">
                        Your spoken answer will appear here...
                      </span>
                    )}
                  </p>

                  <div className="draft-actions">
                    <button
                      className="submit-draft-btn"
                      onClick={handleManualSubmitAnswer}
                      disabled={!answerDraft.trim() || loading}
                    >
                      <Send size={14} />
                      <span>Submit This Answer</span>
                    </button>

                    <button
                      className="skip-btn"
                      onClick={handleSkipQuestion}
                      disabled={loading}
                    >
                      Skip Question
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="interview-actions-row">
              {!callActive && !completedRef.current ? (
                <button
                  className="primary-button"
                  onClick={startInterview}
                  disabled={loading || !resumeId}
                >
                  <Play size={16} />
                  <span>
                    {loading
                      ? "Starting Session..."
                      : "Start Voice Interview"}
                  </span>
                </button>
              ) : callActive ? (
                <button
                  className="end-button"
                  onClick={handleEndInterview}
                  disabled={loading}
                >
                  <Square size={16} />
                  <span>
                    {loading
                      ? "Completing..."
                      : "End & Generate Report"}
                  </span>
                </button>
              ) : null}
            </div>

            {error && (
              <div className="error-panel">
                <AlertTriangle size={18} />
                <div>
                  <strong>Interview Alert</strong>
                  <p>{error}</p>
                  {endedReason && (
                    <small>Reason: {endedReason}</small>
                  )}
                </div>
              </div>
            )}

            {transcript.length > 0 && (
              <section className="answer-history-card">
                <h2>Submitted Answers ({transcript.length})</h2>

                <div className="answers-list">
                  {transcript.map((item, index) => (
                    <div
                      key={`${index}-${item.text}`}
                      className="history-item"
                    >
                      <div className="history-item-header">
                        <CheckCircle2
                          size={14}
                          className="accent-check"
                        />
                        <strong>Question {index + 1} Answer</strong>
                      </div>

                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </section>

          <aside className="interview-sidebar">
            <div className="camera-card">
              <div className="panel-header">
                <div>
                  <span>VIDEO FEED</span>
                  <strong>Live Camera</strong>
                </div>
                <span className="camera-live">● ACTIVE</span>
              </div>

              <div className="camera-container">
                <VideoAnalyzer
                  ref={videoAnalyzerRef}
                  active={callActive}
                  onMetricsUpdate={setVideoMetrics}
                />
              </div>
            </div>

            <div className="metrics-card">
              <div className="panel-header">
                <div>
                  <span>OBSERVATIONS</span>
                  <strong>MediaPipe Signals</strong>
                </div>
              </div>

              <div className="metric-row">
                <div>
                  <span className="metric-icon">◉</span>
                  <span>Face Presence</span>
                </div>
                <strong>
                  {videoMetrics?.facePresencePercentage ?? 0}%
                </strong>
              </div>

              <div className="metric-row">
                <div>
                  <span className="metric-icon">◌</span>
                  <span>Attention Score</span>
                </div>
                <strong>
                  {videoMetrics?.attentionScore ?? 0}%
                </strong>
              </div>

              <div className="metric-row">
                <div>
                  <span className="metric-icon">◎</span>
                  <span>Camera Active</span>
                </div>
                <strong>
                  {videoMetrics?.cameraActivePercentage ?? 0}%
                </strong>
              </div>

              <div className="metric-row">
                <div>
                  <span className="metric-icon">↕</span>
                  <span>Head Movement</span>
                </div>
                <strong>
                  {videoMetrics?.headMovement ?? "Normal"}
                </strong>
              </div>
            </div>

            <div className="session-card">
              <span>STATUS</span>
              <strong>{status}</strong>
              <div className="session-line">
                <span />
              </div>
            </div>
          </aside>
        </main>

        <footer className="interview-footer">
          <span>AI-Powered Technical Interviewing Engine</span>
          <span>
            Camera metrics are observable posture signals and do not
            determine technical skill.
          </span>
        </footer>
      </div>
    </div>
  );
}
