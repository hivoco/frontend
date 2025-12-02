"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Check, FileImage } from "lucide-react";
import { usePhotoCapture } from "@/hooks/usePhotoCapture";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { compressImage, formatFileSize, getImageDimensions } from "@/lib/image";

interface PhotoUploadAdvancedProps {
  onPhotoSubmit?: (file: File, metadata: ImageMetadata) => Promise<void>;
  enableCompression?: boolean;
  title?: string;
  description?: string;
}

interface ImageMetadata {
  size: number;
  width: number;
  height: number;
  type: string;
  name: string;
}

export function PhotoUploadAdvanced({
  onPhotoSubmit,
  enableCompression = true,
  title = "Upload or Capture Photo",
  description = "Choose a photo from your device or capture using your camera",
}: PhotoUploadAdvancedProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const { preview, file, error, isLoading, handleFileSelect, handleCameraCapture, clearPhoto, reset } =
    usePhotoCapture();

  const updateMetadata = async (imageFile: File) => {
    try {
      const { width, height } = await getImageDimensions(imageFile);
      setMetadata({
        size: imageFile.size,
        width,
        height,
        type: imageFile.type,
        name: imageFile.name,
      });
    } catch (err) {
      console.error("Failed to get image dimensions:", err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (!videoRef.current) {
        console.error("Video element ref not available");
        return;
      }

      const video = videoRef.current;

      // MDN pattern: Connect stream and wait for canplay event
      video.srcObject = stream;

      // Handle canplay event - this fires when video is ready to play
      const handleCanPlay = () => {
        console.log("Video ready:", video.videoWidth, "x", video.videoHeight);
        setIsCameraActive(true);
        video.removeEventListener("canplay", handleCanPlay);
      };

      video.addEventListener("canplay", handleCanPlay);

      // Fallback: if already loaded before listener attached
      video.play().catch((err) => {
        console.warn("Play promise rejected:", err);
      });
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
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await handleFileSelect(selectedFile);
      await updateMetadata(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !onPhotoSubmit || !metadata) return;

    setIsSubmitting(true);
    try {
      let submitFile = file;

      if (enableCompression) {
        submitFile = await compressImage(file);
      }

      const submitMetadata = {
        ...metadata,
        size: submitFile.size,
      };

      await onPhotoSubmit(submitFile, submitMetadata);
      reset();
      setMetadata(null);
    } catch (err) {
      console.error("Failed to submit photo:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {!preview && !isCameraActive && (
            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={cn(
                  "w-full rounded-lg border-2 border-dashed border-border/60 p-8",
                  "flex flex-col items-center justify-center gap-3 transition-all",
                  "hover:border-primary/60 hover:bg-accent/40",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "active:scale-95"
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Choose from device</p>
                  <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP (max 5MB)</p>
                </div>
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-xs text-muted-foreground px-2">or</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              <Button
                onClick={startCamera}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2"
              >
                <Camera className="h-4 w-4" />
                Open Camera
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                disabled={isLoading}
                className="hidden"
              />
            </div>
          )}

          {isCameraActive && (
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden w-full" style={{ aspectRatio: "16 / 9" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover"
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1" disabled={isLoading}>
                  Capture
                </Button>
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {preview && metadata && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-muted w-full aspect-square">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium">{metadata.width} × {metadata.height}px</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-medium">{formatFileSize(metadata.size)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">{metadata.type.split("/")[1].toUpperCase()}</span>
                </div>
                {enableCompression && (
                  <div className="text-muted-foreground pt-2 border-t border-border/50">
                    ℹ️ Image will be optimized for upload
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isLoading || !onPhotoSubmit}
                  className="flex-1 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Submitting
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Submit
                    </>
                  )}
                </Button>

                <Button
                  onClick={clearPhoto}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <X className="h-4 w-4" />
                  Retake
                </Button>
              </div>
            </div>
          )}

          {isLoading && !preview && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Processing image...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
