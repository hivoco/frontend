"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, Check, AlertCircle } from "lucide-react";
import { usePhotoCapture } from "@/hooks/usePhotoCapture";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { searchFace } from "@/lib/fetch";
import ImageDisplay from "./ImageDisplay";
import Image from "next/image";

const loadingMessages = [
  "Analyzing image...",
  "Processing details...",
  "Scanning content...",
  "Extracting metadata...",
  "Validating quality...",
  "Optimizing file...",
  "Almost done...",
];

interface PhotoUploadBasicProps {
  onPhotoSubmit?: (file: File) => Promise<void>;
}

export function PhotoUploadBasic() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [imageArray, setImageArray] = useState([]);
  const [showNoImagesMessage, setShowNoImagesMessage] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    preview,
    file,
    error,
    isLoading,
    isMobile,
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

  // Auto-hide "No Images" message after 3 seconds
  useEffect(() => {
    if (!showNoImagesMessage) return;

    const timer = setTimeout(() => {
      setShowNoImagesMessage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showNoImagesMessage]);

  // Connect stream when video element becomes available (PC webcam modal)
  useEffect(() => {
    if (!isWebcamModalOpen || !streamRef.current) {
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
  }, [isWebcamModalOpen]);

  // Handle camera button click - different behavior for mobile vs PC
  const handleCameraClick = () => {
    if (isMobile) {
      // On mobile: use native camera input
      cameraInputRef.current?.click();
    } else {
      // On PC: open webcam modal
      openWebcam();
    }
  };

  const openWebcam = async () => {
    try {
      console.log("Starting webcam...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      console.log("Stream obtained, opening webcam modal...");
      streamRef.current = stream;
      setIsWebcamModalOpen(true);
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

  const capturePhotoFromWebcam = async () => {
    if (!videoRef.current) return;

    const stream = videoRef.current.srcObject as MediaStream | null;
    if (stream) {
      await handleCameraCapture(stream);
      closeWebcam();
    }
  };

  const closeWebcam = () => {
    // Stop all tracks from the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsWebcamModalOpen(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      const response = await searchFace(file);
      if (response.results.length > 0) {
        setImageArray(response.results);
      } else {
        setShowNoImagesMessage(true);
      }
      reset();
    } catch (err) {
      console.error("Failed to submit photo:", err);
      setApiError("Image not found");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (imageArray.length > 0) {
    return <ImageDisplay images={imageArray} />;
  }

  return (
    <div className=" max-w-md mx-auto ">
      <Card className="border-primary/30 shadow-2xl hover:shadow-3xl card-lift backdrop-blur-sm bg-white/95">
        <CardHeader className="bg-linear-to-br from-primary/10 via-purple-50 to-accent/5 border-b border-primary/20 pb-8 pt-8">
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Upload a photo and get all matching images
          </CardTitle>
          <CardDescription className="text-base mt-2 text-foreground/70">
            Choose a photo from your device or capture using your camera
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

          {apiError && (
            <div className="rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200/60 animate-in fade-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 mb-2 text-white">
                    Info
                  </Badge>
                  <p className="text-sm text-emerald-900 font-medium">
                    {apiError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showNoImagesMessage && (
            <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200/60 animate-in fade-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <Badge className="bg-amber-600 hover:bg-amber-700 mb-2">
                    No Images
                  </Badge>
                  <p className="text-sm text-amber-900 font-medium">
                    No matching faces found. Try uploading another photo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!preview && !isWebcamModalOpen && (
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={cn(
                  "photo-upload-input mx-auto",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="relative">
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
                onClick={handleCameraClick}
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

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraInputChange}
                disabled={isLoading}
                className="hidden"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Webcam Modal for PC */}
          {isWebcamModalOpen && (
            <div className="z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
              <div className="text-center w-full max-w-3xl animate-in fade-in duration-200 will-change-contents">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto max-h-[70vh] object-contain rounded-3xl shadow-2xl mb-6 border-4 border-primary/30"
                />

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    onClick={capturePhotoFromWebcam}
                    disabled={isLoading}
                    className="h-12 px-6 sm:px-8 rounded-2xl font-semibold bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Capture Photo
                  </Button>
                  <Button
                    onClick={closeWebcam}
                    className="h-12 px-6 sm:px-8 rounded-2xl font-semibold bg-destructive/80 hover:bg-destructive text-white transition-all duration-300"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {preview && (
            <div className="space-y-4">
              <div className="photo-upload-preview group relative">
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={400}
                  className={cn(
                    "w-full h-full object-contain transition-all duration-300 rounded-2xl",
                    isSubmitting && "opacity-75 brightness-95"
                  )}
                  priority
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
                  disabled={isSubmitting || isLoading}
                  className="flex-1 h-12 rounded-2xl font-semibold gap-2 bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
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
