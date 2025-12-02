import {
  Upload,
  CheckCircle,
  Loader2,
  Clock,
  Wifi,
  Eye,
  Network,
  Shield,
} from "lucide-react";

export interface UploadState {
  isUploading: boolean;
  errorMessage: string | null;
  success: boolean;
  successMessage: string | null;
}

export const messages = [
  {
    text: (
      <>
        At 10 Mbps: ~15 mins for 1GB. Upload time depends on your upload
        internet speed.
        <br />
        <br />
        Use{" "}
        <a href="https://fast.com" target="_blank" rel="noopener noreferrer">
          fast.com
        </a>{" "}
        to check your internet speed.
      </>
    ),
    icon: Clock,
  },

  { text: "Uploading your ZIP file...", icon: Upload },
  { text: "Transferring data to backend...", icon: Network },
  { text: "Maintain a stable internet connection", icon: Wifi },
  { text: "Don't close or refresh this page during upload", icon: Eye },
  {
    text: "For very large files, use a wired connection if possible",
    icon: Network,
  },
  { text: "Keep your connection stable...", icon: Shield },
  { text: "You'll see a success message when complete", icon: CheckCircle },
];
