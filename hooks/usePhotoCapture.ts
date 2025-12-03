import { useState, useRef, useCallback } from "react";

interface PhotoCaptureState {
  preview: string | null;
  file: File | null;
  error: string | null;
  isLoading: boolean;
}

interface UsePhotoCaptureReturn extends PhotoCaptureState {
  handleFileSelect: (file: File) => Promise<void>;
  handleCameraCapture: (stream: MediaStream) => Promise<void>;
  isMobile: boolean;
  clearPhoto: () => void;
  reset: () => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Detect if device is mobile
const detectMobile = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export function usePhotoCapture(): UsePhotoCaptureReturn {
  const [state, setState] = useState<PhotoCaptureState>({
    preview: null,
    file: null,
    error: null,
    isLoading: false,
  });

  const isMobile = detectMobile();

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "File must be JPEG, PNG, or WebP format";
    }
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      return `File size must be less than 10MB. Your file is ${fileSizeMB}MB`;
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const validationError = validateFile(file);
      if (validationError) {
        setState((prev) => ({
          ...prev,
          error: validationError,
          isLoading: false,
        }));
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setState({
            preview: dataUrl,
            file,
            error: null,
            isLoading: false,
          });
        };
        reader.onerror = () => {
          setState((prev) => ({
            ...prev,
            error: "Failed to read file",
            isLoading: false,
          }));
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: "Failed to process file",
          isLoading: false,
        }));
      }
    },
    [validateFile]
  );

  const handleCameraCapture = useCallback(
    async (stream: MediaStream) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        ctx.drawImage(video, 0, 0);
        stream.getTracks().forEach((track) => track.stop());

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-photo.jpg", {
              type: "image/jpeg",
            });
            const preview = canvas.toDataURL("image/jpeg");
            setState({
              preview,
              file,
              error: null,
              isLoading: false,
            });
          }
        }, "image/jpeg");
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: "Failed to capture photo",
          isLoading: false,
        }));
      }
    },
    []
  );

  const clearPhoto = useCallback(() => {
    setState((prev) => ({
      ...prev,
      preview: null,
      file: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      preview: null,
      file: null,
      error: null,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    isMobile,
    handleFileSelect,
    handleCameraCapture,
    clearPhoto,
    reset,
  };
}
