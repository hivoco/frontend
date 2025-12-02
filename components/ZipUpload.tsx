"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { uploadFacesZipFile } from "@/lib/fetch";
import { messages, UploadState } from "./ZipUpload.constants";

export function ZipUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    errorMessage: null,
    success: false,
    successMessage: null,
  });
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cycle through messages during upload
  useEffect(() => {
    if (!uploadState.isUploading) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [uploadState.isUploading]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadState.isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploadState.isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;

    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".zip") && file.type !== "application/zip") {
      setUploadState((prev) => ({
        ...prev,
        errorMessage: "Please select a valid ZIP file (.zip)",
      }));
      return;
    }

    const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
    if (file.size > maxSize) {
      setUploadState((prev) => ({
        ...prev,
        errorMessage: `File size must be less than 10GB (Your file: ${formatFileSize(
          file.size
        )})`,
      }));
      return;
    }

    setUploadState({
      isUploading: true,
      errorMessage: null,
      success: false,
      successMessage: null,
    });

    abortControllerRef.current = new AbortController();

    try {
      const response = await uploadFacesZipFile(
        file,
        abortControllerRef.current.signal
      );
      console.log("Upload response:", response);

      if (response.status) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          success: true,
          successMessage: "Upload successful " + response.message,
        }));
      } else {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          errorMessage: response.message || "Upload failed",
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      console.error("Upload error:", errorMessage);

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        errorMessage: errorMessage,
      }));
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploadState({
      isUploading: false,
      errorMessage: null,
      success: false,
      successMessage: null,
    });
  };

  const handleReset = () => {
    setUploadState({
      isUploading: false,
      errorMessage: null,
      success: false,
      successMessage: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Upload Card */}
      {!uploadState.success ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-2xl border-2 border-dashed p-12 transition-all duration-300",
            isDragging && !uploadState.isUploading
              ? "border-primary bg-linear-to-br from-primary/15 via-primary/8 to-accent/8 shadow-2xl shadow-primary/20"
              : "border-primary/30 bg-linear-to-br from-primary/5 via-transparent to-accent/5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={handleFileSelect}
            disabled={uploadState.isUploading}
            className="hidden"
            id="zip-input"
            aria-hidden="true"
          />

          {uploadState.isUploading ? (
            // Uploading State
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-linear-to-r from-primary/30 to-accent/20 rounded-full blur-2xl animate-pulse" />
                  <Loader2 className="relative w-12 h-12 text-primary animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {messages[currentMessageIndex].text}
                </h3>
              </div>

              {/* Cancel Button */}
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full rounded-xl font-semibold border-destructive/30 hover:border-destructive hover:bg-destructive/5"
              >
                <X className="w-4 h-4" />
                Cancel Upload
              </Button>
            </div>
          ) : (
            // Default/Idle State
            <div className="space-y-4 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-accent/20 rounded-full blur-2xl" />
                <div
                  className={cn(
                    "relative p-4 rounded-full transition-all duration-300",
                    isDragging
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <Upload className="w-10 h-10" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  Upload Your ZIP File
                </h3>
                <p className="text-muted-foreground">
                  Drag and drop your file here or click to browse
                </p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadState.isUploading}
                className="w-full h-12 rounded-xl font-semibold text-base gap-2 bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary"
              >
                <Upload className="w-5 h-5" />
                Select ZIP File
              </Button>

              <div className="pt-3 space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Maximum file size:{" "}
                    <strong className="text-primary">10 GB</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Error Alert */}
      {uploadState.errorMessage && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-semibold text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {uploadState.errorMessage}
          </p>
        </div>
      )}

      {/* Success State */}
      {uploadState.success && uploadState.successMessage && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Success Card */}
          <Card className="bg-linear-to-br from-primary/10 via-secondary/5 to-accent/5 border-primary/30 p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg" />
                <CheckCircle className="relative w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Upload Complete!
                </h3>
                <p className="text-muted-foreground">
                  {uploadState.successMessage}
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              className="flex-1 h-11 rounded-xl font-semibold text-base gap-2 bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary"
            >
              <Upload className="w-5 h-5" />
              Upload Another File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
