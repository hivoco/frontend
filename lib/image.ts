/**
 * Image utility functions for validation and processing
 */

export const IMAGE_CONFIG = {
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 1920,
  maxHeight: 1440,
  quality: 0.85,
};

/**
 * Validate if a file is a valid image
 */
export function isValidImage(file: File): { valid: boolean; error?: string } {
  if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be JPEG, PNG, or WebP. Got ${file.type}`,
    };
  }

  if (file.size > IMAGE_CONFIG.maxSize) {
    const sizeMB = (IMAGE_CONFIG.maxSize / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `File size must be less than ${sizeMB}MB. Got ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions from a file or URL
 */
export async function getImageDimensions(
  source: File | string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    if (source instanceof File) {
      const url = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    } else {
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = source;
    }
  });
}

/**
 * Compress image while maintaining quality
 */
export async function compressImage(
  file: File,
  quality: number = IMAGE_CONFIG.quality
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Scale down if necessary
        if (width > IMAGE_CONFIG.maxWidth || height > IMAGE_CONFIG.maxHeight) {
          const ratio = Math.min(
            IMAGE_CONFIG.maxWidth / width,
            IMAGE_CONFIG.maxHeight / height
          );
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: file.lastModified,
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert File to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to convert file to base64"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
