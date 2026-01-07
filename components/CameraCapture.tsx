"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, RotateCcw, CheckCircle, XCircle } from "lucide-react";

interface CameraCaptureProps {
  onPhotoCapture: (file: File) => void;
  onValidationResult: (isValid: boolean, message: string) => void;
  validationStatus: "idle" | "validating" | "valid" | "invalid";
  validationMessage: string;
}

export function CameraCapture({
  onPhotoCapture,
  onValidationResult,
  validationStatus,
  validationMessage,
}: CameraCaptureProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Open camera with front-facing camera preference
  const openCamera = useCallback(async () => {
    try {
      setError("");
      console.log("🎥 Requesting camera access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      console.log("✅ Camera access granted");
      streamRef.current = stream;
      setIsCameraOpen(true);

      // Wait for next tick to ensure state is updated
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
          });
          console.log("📹 Video stream attached");
        }
      }, 100);
    } catch (err) {
      console.error("❌ Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  }, []);

  // Close camera and stop stream
  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setIsVideoReady(false);
    setCapturedImage(null);
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        onPhotoCapture(file);
      }
    }, "image/jpeg");
  }, [onPhotoCapture]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    onValidationResult(false, "");
  }, [onValidationResult]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, [closeCamera]);

  return (
    <div className="w-full space-y-4">
      {!isCameraOpen && !capturedImage && (
        <button
          onClick={openCamera}
          className="w-full py-4 px-6 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors"
        >
          <Camera className="h-5 w-5" />
          Open Camera & Take Selfie
        </button>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {isCameraOpen && !capturedImage && (
        <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto min-h-[400px] max-h-[600px] object-cover"
            style={{
              display: 'block',
              backgroundColor: '#000',
              minHeight: '400px',
              width: '100%'
            }}
            onLoadedMetadata={(e) => {
              console.log("📺 Video metadata loaded");
              const video = e.currentTarget;
              video.play().catch(err => console.error("Play error:", err));
              setIsVideoReady(true);
            }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Loading indicator */}
          {!isVideoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-white text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto" />
                <p className="text-lg font-semibold">Opening camera...</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <div className="flex justify-center gap-6">
              <button
                onClick={closeCamera}
                className="p-4 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
                aria-label="Close camera"
              >
                <X className="h-6 w-6" />
              </button>
              <button
                onClick={capturePhoto}
                className="p-8 bg-white rounded-full text-black hover:bg-gray-100 transition-all hover:scale-110 shadow-2xl border-4 border-white/50"
                aria-label="Take photo"
              >
                <Camera className="h-10 w-10" />
              </button>
            </div>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {/* Circular Photo Preview */}
            <div className="relative">
              <div
                className={`rounded-full overflow-hidden transition-all duration-300 ${
                  validationStatus === "valid"
                    ? "border-8 border-green-500 shadow-2xl shadow-green-500/50"
                    : validationStatus === "invalid"
                    ? "border-8 border-red-500 shadow-2xl shadow-red-500/50"
                    : "border-4 border-gray-300 shadow-xl"
                }`}
                style={{ width: '280px', height: '280px' }}
              >
                <img
                  src={capturedImage}
                  alt="Captured selfie"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Validation Status Overlay */}
              {validationStatus === "validating" && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <div className="text-white text-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
                    <p className="font-semibold text-sm">Validating...</p>
                  </div>
                </div>
              )}

              {/* Validation Status Icon */}
              {validationStatus === "valid" && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-4 rounded-full shadow-xl border-4 border-white">
                  <CheckCircle className="h-8 w-8" />
                </div>
              )}

              {validationStatus === "invalid" && (
                <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-4 rounded-full shadow-xl border-4 border-white">
                  <XCircle className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* Validation Message */}
            {validationMessage && (
              <div
                className={`p-4 rounded-xl border w-full text-center ${
                  validationStatus === "valid"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : validationStatus === "invalid"
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}
              >
                <p className="font-semibold">{validationMessage}</p>
              </div>
            )}
          </div>

          {/* Retake Button */}
          <button
            onClick={retakePhoto}
            className="w-full py-3 px-6 bg-gray-200 text-gray-800 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-300 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            Retake Photo
          </button>
        </div>
      )}
    </div>
  );
}
