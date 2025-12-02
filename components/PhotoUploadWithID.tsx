"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateCSVrecord } from "@/lib/fetch";

const loadingMessages = [
  "Analyzing image...",
  "Processing details...",
  "Scanning content...",
  "Extracting metadata...",
  "Validating quality...",
  "Optimizing file...",
  "Almost done...",
];

export function PhotoUploadWithID() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [adaNumber, setAdaNumber] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [csvOption, setCsvOption] = useState("thailand_data_phuket");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
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

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file || !adaNumber || !phoneNumber || !csvOption) return;

    setIsSubmitting(true);
    try {
      const response = await updateCSVrecord(
        file,
        adaNumber,
        phoneNumber,
        csvOption
      );

      if (response.status === "success") {
        setSuccessMessage(response.message);
        setFailureMessage(null);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setFailureMessage(response.message || "Failed to update record");
        setSuccessMessage(null);
        setTimeout(() => setFailureMessage(null), 4000);
      }

      reset();
      setAdaNumber(null);
      setPhoneNumber(null);
      setCsvOption("thailand_data_phuket");
    } catch (err) {
      console.error("Failed to submit photo:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-primary/30 shadow-2xl hover:shadow-3xl card-lift overflow-hidden backdrop-blur-sm bg-white/95">
        <CardHeader className="bg-linear-to-br from-primary/10 via-purple-50 to-accent/5 border-b border-primary/20 pb-6 pt-6">
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Input Details here
          </CardTitle>
          <CardDescription className="text-base mt-2 text-foreground/70">
            Enter Ada, phone, select data source, and upload/capture image.
          </CardDescription>
          {/* Form Inputs - At the very top */}
          <form
            ref={formRef}
            onSubmit={handleFormSubmit}
            className="space-y-4 mb-6"
            id="photo-form"
          >
            {/* ADA Number Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                ADA Number <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="adaNumber"
                value={adaNumber || ""}
                onChange={(e) => setAdaNumber(e.target.value)}
                placeholder="Enter ADA number"
                disabled={isSubmitting}
                required
                pattern="[A-Za-z0-9\-]+"
                minLength={1}
                maxLength={20}
                title="ADA number must be 3-20 characters and contain only letters, numbers, and hyphens"
                className="w-full px-4 py-3 rounded-2xl border border-primary/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-white/50 placeholder:text-muted-foreground/50 font-medium"
              />
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={phoneNumber || ""}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                disabled={isSubmitting}
                required
                pattern="[0-9]{10}"
                minLength={10}
                maxLength={10}
                title="Phone number must be at least 10 characters and contain only digits, spaces, hyphens, parentheses, and optional plus sign"
                className="w-full px-4 py-3 rounded-2xl border border-primary/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-white/50 placeholder:text-muted-foreground/50 font-medium"
              />
            </div>

            {/* CSV Option Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Select Data Source <span className="text-destructive">*</span>
              </label>
              <select
                name="csvOption"
                value={csvOption}
                onChange={(e) => setCsvOption(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full px-4 py-3 rounded-2xl border border-primary/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-white/50 text-foreground font-medium appearance-none cursor-pointer"
              >
                {/* <option value="thailand_data_bangkok">
                  Thailand Data - Bangkok
                </option> */}
                <option value="thailand_data_phuket">
                  Thailand Data - Phuket
                </option>
              </select>
            </div>
          </form>
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

          {successMessage && (
            <div className="rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200/60 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 mb-2">
                    Success
                  </Badge>
                  <p className="text-sm text-emerald-900 font-medium">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {failureMessage && (
            <div className="rounded-2xl bg-red-50/80 p-4 border border-red-200/60 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <X className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <Badge className="bg-red-600 hover:bg-red-700 mb-2">
                    Failed
                  </Badge>
                  <p className="text-sm text-red-900 font-medium">
                    {failureMessage}
                  </p>
                </div>
              </div>
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
            <div className="space-y-4">
              <div className="photo-upload-camera">
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
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={400}
                  className={cn(
                    "w-full h-full object-contain transition-all duration-300 rounded-2xl",
                    isSubmitting && "opacity-75 brightness-95"
                  )}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-2xl" />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  form="photo-form"
                  disabled={isSubmitting || isLoading || !file}
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
