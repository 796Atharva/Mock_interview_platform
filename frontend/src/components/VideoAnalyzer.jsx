import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

import "./VideoAnalyzer.css";

const VideoAnalyzer = forwardRef(function VideoAnalyzer(
  { active, onMetricsUpdate },
  ref
) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationRef = useRef(null);

  const onMetricsUpdateRef = useRef(onMetricsUpdate);

  const statsRef = useRef({
    totalFrames: 0,
    faceFrames: 0,
    attentionFrames: 0,
    leftRightMovement: 0,
    upDownMovement: 0,
    lastX: null,
    lastY: null,
  });

  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [metrics, setMetrics] = useState({
    facePresencePercentage: 0,
    attentionScore: 0,
    cameraActivePercentage: 0,
    headMovement: "Normal",
  });

  useEffect(() => {
    onMetricsUpdateRef.current = onMetricsUpdate;
  }, [onMetricsUpdate]);

  // =====================================================
  // START CAMERA AND INITIALIZE MEDIAPIPE
  // =====================================================

  useEffect(() => {
    let cancelled = false;
    let localStream = null;
    let localLandmarker = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera access is unavailable. Use HTTPS or localhost."
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

        localStream = stream;

        // The component may have unmounted while permission was pending.
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;

        if (!video) {
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          return;
        }

        video.muted = true;
        video.playsInline = true;
        video.srcObject = stream;

        try {
          await video.play();
        } catch (error) {
          // Ignore interruptions caused by cleanup or a new video load.
          if (
            cancelled ||
            error?.name === "AbortError"
          ) {
            return;
          }

          throw error;
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setCameraReady(true);
        setCameraError("");

        console.log("Camera started successfully");
      } catch (error) {
        if (!cancelled) {
          console.error("Camera error:", error);

          setCameraError(
            error?.name === "NotAllowedError"
              ? "Camera permission denied. Allow camera access in your browser."
              : error?.name === "NotFoundError"
                ? "No camera was found on this device."
                : error?.message || "Unable to start the camera."
          );
        }
      }
    }

    async function initializeFaceLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm"
        );

        if (cancelled) {
          return;
        }

        let landmarker;

        try {
          landmarker = await FaceLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath: "/models/face_landmarker.task",
                delegate: "GPU",
              },
              runningMode: "VIDEO",
              numFaces: 1,
              minFaceDetectionConfidence: 0.5,
              minFacePresenceConfidence: 0.5,
              minTrackingConfidence: 0.5,
            }
          );
        } catch (gpuError) {
          // Retry with CPU if GPU initialization is unavailable.
          console.warn(
            "GPU initialization failed. Retrying with CPU:",
            gpuError
          );

          if (cancelled) {
            return;
          }

          landmarker = await FaceLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath: "/models/face_landmarker.task",
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              numFaces: 1,
              minFaceDetectionConfidence: 0.5,
              minFacePresenceConfidence: 0.5,
              minTrackingConfidence: 0.5,
            }
          );
        }

        // Do not retain a model created after the component unmounted.
        if (cancelled) {
          landmarker.close();
          return;
        }

        localLandmarker = landmarker;
        faceLandmarkerRef.current = landmarker;

        setModelReady(true);

        console.log("MediaPipe FaceLandmarker ready");
      } catch (error) {
        if (!cancelled) {
          console.error(
            "MediaPipe initialization error:",
            error
          );
        }
      }
    }

    startCamera();
    initializeFaceLandmarker();

    return () => {
      cancelled = true;

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      if (streamRef.current === localStream) {
        streamRef.current = null;
      }

      const video = videoRef.current;

      if (video) {
        video.pause();
        video.srcObject = null;
      }

      if (localLandmarker) {
        localLandmarker.close();
      }

      if (faceLandmarkerRef.current === localLandmarker) {
        faceLandmarkerRef.current = null;
      }
    };
  }, []);

  // =====================================================
  // PROCESS VIDEO FRAMES
  // =====================================================

  useEffect(() => {
    if (!active || !cameraReady || !modelReady) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      return;
    }

    let stopped = false;

    function processFrame() {
      if (stopped) {
        return;
      }

      const video = videoRef.current;
      const landmarker = faceLandmarkerRef.current;

      if (
        !video ||
        !landmarker ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      try {
        const timestamp = performance.now();

        const result = landmarker.detectForVideo(
          video,
          timestamp
        );

        const stats = statsRef.current;

        stats.totalFrames++;

        const landmarks = result.faceLandmarks?.[0];

        if (landmarks && landmarks.length > 0) {
          stats.faceFrames++;

          const nose = landmarks[1];

          if (nose) {
            if (
              stats.lastX !== null &&
              stats.lastY !== null
            ) {
              const dx = Math.abs(nose.x - stats.lastX);
              const dy = Math.abs(nose.y - stats.lastY);

              if (dx > 0.015) {
                stats.leftRightMovement++;
              }

              if (dy > 0.015) {
                stats.upDownMovement++;
              }
            }

            stats.lastX = nose.x;
            stats.lastY = nose.y;
          }

          // This is an approximate visibility-based score,
          // not a definitive measurement of attention.
          stats.attentionFrames++;
        }

        const facePercentage =
          stats.totalFrames > 0
            ? (stats.faceFrames / stats.totalFrames) * 100
            : 0;

        const attention =
          stats.totalFrames > 0
            ? (stats.attentionFrames / stats.totalFrames) * 100
            : 0;

        const movement =
          stats.leftRightMovement +
          stats.upDownMovement;

        let headMovement = "Normal";

        if (movement > stats.totalFrames * 0.35) {
          headMovement = "High";
        } else if (movement > stats.totalFrames * 0.15) {
          headMovement = "Moderate";
        }

        const updatedMetrics = {
          facePresencePercentage: Math.round(facePercentage),
          attentionScore: Math.round(attention),
          cameraActivePercentage: streamRef.current ? 100 : 0,
          headMovement,
        };

        setMetrics(updatedMetrics);

        if (onMetricsUpdateRef.current) {
          onMetricsUpdateRef.current(updatedMetrics);
        }

        // =================================================
        // DRAW FACE LANDMARKS
        // =================================================

        const canvas = canvasRef.current;

        if (canvas) {
          const ctx = canvas.getContext("2d");

          if (ctx) {
            if (
              canvas.width !== video.videoWidth ||
              canvas.height !== video.videoHeight
            ) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }

            ctx.clearRect(
              0,
              0,
              canvas.width,
              canvas.height
            );

            if (landmarks) {
              ctx.fillStyle = "rgba(139, 92, 246, 0.7)";

              for (const point of landmarks) {
                ctx.beginPath();

                ctx.arc(
                  point.x * canvas.width,
                  point.y * canvas.height,
                  1.5,
                  0,
                  Math.PI * 2
                );

                ctx.fill();
              }
            }
          }
        }
      } catch (error) {
        console.error("Video frame processing error:", error);
      }

      if (!stopped) {
        animationRef.current = requestAnimationFrame(processFrame);
      }
    }

    animationRef.current = requestAnimationFrame(processFrame);

    return () => {
      stopped = true;

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [active, cameraReady, modelReady]);

  // =====================================================
  // FINAL METRICS
  // =====================================================

  function getFinalMetrics() {
    return { ...metrics };
  }

  useImperativeHandle(
    ref,
    () => ({
      getFinalMetrics,
    }),
    [metrics]
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="video-analyzer">
      <video
        ref={videoRef}
        className="video-feed"
        muted
        playsInline
        autoPlay
      />

      <canvas
        ref={canvasRef}
        className="landmark-canvas"
      />

      {!cameraReady && (
        <div className="camera-loading">
          <div className="loading-ring" />

          <span>
            {cameraError || "Initializing camera..."}
          </span>
        </div>
      )}

      <div className="camera-overlay">
        <div className="corner top-left" />
        <div className="corner top-right" />
        <div className="corner bottom-left" />
        <div className="corner bottom-right" />
      </div>

      <div className="camera-status">
        <span
          className="camera-status-dot"
          style={{
            backgroundColor: cameraReady ? "#22c55e" : "#ef4444",
          }}
        />

        {cameraReady ? "Camera active" : "Camera inactive"}
      </div>
    </div>
  );
});

export default VideoAnalyzer;