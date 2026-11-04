import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import "./Upload.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName && !name) setName(currentUser.displayName);
      if (currentUser.email && !email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleFile = (selectedFile) => {
    setError("");

    if (!selectedFile) {
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Please upload your resume as a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    handleFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    handleFile(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!file) {
      setError("Please upload your resume.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);
      formData.append("name", name.trim());
      formData.append("email", email.trim());

      const response = await fetch(
        `${API_URL}/api/resumes/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        let message = "Failed to upload resume.";

        try {
          const errorData = await response.json();

          if (errorData?.message) {
            message = errorData.message;
          }
        } catch {
          // Backend may return non-JSON error
        }

        throw new Error(message);
      }

      const data = await response.json();

      console.log("Resume uploaded:", data);

      /*
       * Your backend should return the created resume ID.
       *
       * We support common response names so the frontend
       * is slightly more tolerant of your current DTO.
       */
      const resumeId =
        data.resumeId ??
        data.id ??
        data.resume?.id;

      if (!resumeId) {
        console.error("Upload response:", data);

        throw new Error(
          "Resume uploaded, but the server did not return a resume ID."
        );
      }

      /*
       * Move to the preparation / analysis page.
       */
      navigate(`/analysis/${resumeId}`);

    } catch (err) {
      console.error("Resume upload error:", err);

      setError(
        err.message || "Something went wrong while uploading your resume."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">

      {/* Background */}
      <div className="upload-grid" />

      <div className="upload-glow upload-glow-one" />
      <div className="upload-glow upload-glow-two" />

      {/* Main */}
      <main className="upload-container">

        <div className="upload-header">

          <div className="upload-step">
            <span className="upload-step-dot" />
            STEP 01 / PROFILE
          </div>

          <h1>
            Let's get to know
            <span> you first.</span>
          </h1>

          <p>
            Upload your resume and tell us a little about
            yourself. Our AI will use your experience to
            prepare your technical interview.
          </p>

        </div>

        <form
          className="upload-card"
          onSubmit={handleSubmit}
        >

          {/* Candidate information */}

          <div className="form-section">

            <div className="form-section-heading">

              <div className="form-number">
                01
              </div>

              <div>
                <h2>Your information</h2>

                <p>
                  We'll use this to personalize your
                  interview experience.
                </p>
              </div>

            </div>

            <div className="form-fields">

              <div className="field">

                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="name"
                />

              </div>

              <div className="field">

                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="email"
                />

              </div>

            </div>

          </div>

          <div className="form-divider" />

          {/* Resume */}

          <div className="form-section">

            <div className="form-section-heading">

              <div className="form-number">
                02
              </div>

              <div>
                <h2>Your resume</h2>

                <p>
                  Upload a PDF so our AI can understand
                  your technical background.
                </p>
              </div>

            </div>

            {!file ? (
              <div
                className={`resume-dropzone ${
                  dragActive ? "drag-active" : ""
                }`}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  hidden
                />

                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  Drop your resume here
                </h3>

                <p>
                  or click to browse from your computer
                </p>

                <span className="file-format">
                  PDF only
                </span>

              </div>
            ) : (
              <div className="selected-file">

                <div className="file-icon">
                  PDF
                </div>

                <div className="file-details">

                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {formatFileSize(file.size)}
                  </span>

                </div>

                <button
                  type="button"
                  className="remove-file"
                  onClick={removeFile}
                  disabled={loading}
                >
                  Remove
                </button>

              </div>
            )}

          </div>

          {/* Error */}

          {error && (
            <div className="upload-error">

              <span>!</span>

              <p>{error}</p>

            </div>
          )}

          {/* Submit */}

          <div className="upload-submit">

            <div className="privacy-note">

              <span>◇</span>

              <p>
                Your resume is used only to prepare
                your interview.
              </p>

            </div>

            <button
              type="submit"
              className="analyze-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner" />
                  Analyzing resume...
                </>
              ) : (
                <>
                  Analyze My Resume
                  <span>→</span>
                </>
              )}

            </button>

          </div>

        </form>

        <div className="upload-footer">

          <span>
            Secure resume processing
          </span>

          <span>•</span>

          <span>
            AI-powered analysis
          </span>

          <span>•</span>

          <span>
            Personalized interview
          </span>

        </div>

      </main>

    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  const mb = bytes / (1024 * 1024);

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  return `${Math.max(
    1,
    Math.round(bytes / 1024)
  )} KB`;
}

export default Upload;