"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { usePhotoCapture } from "@/hooks/usePhotoCapture";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const loadingMessages = [
  "Analyzing image...",
  "Processing details...",
  "Scanning content...",
  "Extracting metadata...",
  "Validating quality...",
  "Optimizing file...",
  "Almost done...",
];

interface PhotoUploadProps {
  onPhotoSubmit?: (file: File) => Promise<void>;
  title?: string;
  description?: string;
}

export function PhotoUpload({
  onPhotoSubmit,
  title = "Upload or Capture Photo",
  description = "Choose a photo from your device or capture using your camera",
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const {
    preview,
    file,
    error,
    isLoading,
    handleFileSelect,
    handleCameraCapture,
    clearPhoto,
    reset,
  } = usePhotoCapture();

  // Cycle through loading messages
  useEffect(() => {
    if (!isSubmitting) return;

    const interval = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 450);

    return () => clearInterval(interval);
  }, [isSubmitting]);

  // Connect stream when video element becomes available
  useEffect(() => {
    if (!isCameraActive || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      console.error("Video element still not available");
      return;
    }

    console.log("useEffect: Connecting stream to video element");
    video.srcObject = streamRef.current;

    // Wait for video to load metadata
    const handleLoadedMetadata = () => {
      console.log(
        "Video metadata loaded:",
        video.videoWidth,
        "x",
        video.videoHeight
      );

      // Calculate dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const constrainedWidth = 320;
      const constrainedHeight = videoHeight / (videoWidth / constrainedWidth);

      if (canvasRef.current) {
        canvasRef.current.width = constrainedWidth;
        canvasRef.current.height = constrainedHeight;
      }

      console.log("Video ready for streaming");
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      console.log("Stream obtained, storing and activating camera...");
      streamRef.current = stream;
      setIsCameraActive(true);
      console.log("Camera state set, useEffect will handle stream connection");
    } catch (err) {
      const error = err as DOMException;
      console.error("Camera error:", error.name, error.message);

      let message = "Unable to access camera.";
      if (error.name === "NotAllowedError") {
        message = "Camera permission denied. Check browser settings.";
      } else if (error.name === "NotFoundError") {
        message = "No camera found on this device.";
      } else if (error.name === "NotReadableError") {
        message = "Camera in use by another app.";
      } else if (error.name === "SecurityError") {
        message = "Camera requires HTTPS or localhost.";
      }

      alert(message);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const stream = videoRef.current.srcObject as MediaStream | null;
    if (stream) {
      await handleCameraCapture(stream);
      stopCamera();
    }
  };

  const stopCamera = () => {
    // Stop all tracks from the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !onPhotoSubmit) return;

    setIsSubmitting(true);
    try {
      await onPhotoSubmit(file);
      reset();
    } catch (err) {
      console.error("Failed to submit photo:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-primary/30 shadow-2xl hover:shadow-3xl card-lift overflow-hidden backdrop-blur-sm bg-white/95">
        <CardHeader className="bg-linear-to-br from-primary/10 via-purple-50 to-accent/5 border-b border-primary/20 pb-8 pt-8">
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <CardDescription className="text-base mt-2 text-foreground/70">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {error && (
            <div className="rounded-2xl bg-destructive/10 p-4 border border-destructive/20 animate-pulse">
              <p className="text-sm text-destructive font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                {error}
              </p>
            </div>
          )}

          {!preview && !isCameraActive && (
            <div className="space-y-4 ">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={cn(
                  "photo-upload-input mx-auto",
                  isLoading && "opacity-50 cursor-not-allowed "
                )}
              >
                <div className="relative ">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-accent/20 rounded-full blur-2xl animate-pulse" />
                  <Upload className="relative h-12 w-12 text-primary transition-all duration-300 drop-shadow-lg" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">
                    Choose from device
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    Drag & drop or click
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2 tracking-wide">
                    JPEG, PNG, WebP • Max 10MB
                  </p>
                </div>
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-linear-to-r from-transparent via-border/40 to-transparent" />
                <span className="text-xs font-medium text-muted-foreground px-2 uppercase tracking-wide">
                  or
                </span>
                <div className="flex-1 h-px bg-linear-to-r from-transparent via-border/40 to-transparent" />
              </div>

              <Button
                onClick={startCamera}
                disabled={isLoading}
                className="w-full gap-2 h-12 rounded-2xl font-semibold bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary"
              >
                <Camera className="h-5 w-5" />
                Open Camera
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                disabled={isLoading}
                className="hidden"
                aria-hidden="true"
              />
            </div>
          )}

          {isCameraActive && (
            <div className="space-y-4 ">
              <div className="photo-upload-camera ">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full block bg-black aspect-square"
                />
                <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl pointer-events-none" />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-2xl font-semibold bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary"
                >
                  Capture
                </Button>
                <Button
                  onClick={stopCamera}
                  className="flex-1 h-12 rounded-2xl font-semibold bg-muted/80 hover:bg-muted border-2 border-destructive/20 hover:border-destructive/40 transition-all duration-300 text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {preview && (
            <div className="space-y-4">
              <div className="photo-upload-preview group relative ">
                <img
                  src={preview}
                  alt="Preview"
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300 rounded-2xl ",
                    isSubmitting && "opacity-75 brightness-95"
                  )}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-2xl" />

                {/* Scanning animation overlay */}
                {isSubmitting && (
                  <div className="scan-overlay rounded-2xl">
                    <div className="scan-line" />
                    <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-primary/5 to-transparent opacity-60 rounded-2xl" />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isLoading || !onPhotoSubmit}
                  className="flex-1 h-12 rounded-2xl font-semibold gap-2 bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      <span className="photo-upload-spinner" />
                      <span className="relative">
                        {loadingMessages[loadingIndex]}
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Submit
                    </>
                  )}
                </Button>

                <Button
                  onClick={clearPhoto}
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-2xl font-semibold bg-muted hover:bg-muted/80 hover:border-primary/30 border-2 border-primary/10 transition-all duration-300 text-foreground"
                >
                  <X className="h-5 w-5" />
                  Retake
                </Button>
              </div>
            </div>
          )}

          {isLoading && !preview && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="photo-upload-spinner" />
              <p className="text-sm text-muted-foreground font-medium">
                Processing...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
