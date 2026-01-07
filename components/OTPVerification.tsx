"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";

interface OTPVerificationProps {
  mobileNumber: string;
  jobId: number;
  onVerified: (jobId: number) => void;
  onBack?: () => void;
}

export function OTPVerification({
  mobileNumber,
  jobId,
  onVerified,
  onBack,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          otp: otpString,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Verification failed");
      }

      if (data.status === "verified") {
        setSuccess(true);
        setTimeout(() => {
          onVerified(data.job_id || jobId);
        }, 1500);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    try {
      // Resend OTP by calling the submit endpoint again
      // This will just send a new OTP without creating a new job
      const response = await fetch("http://localhost:8000/api/v1/video/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number: mobileNumber,
        }),
      });

      if (response.ok) {
        alert("New OTP sent successfully!");
      }
    } catch (err) {
      console.error("Failed to resend OTP:", err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-8 bg-white rounded-2xl shadow-lg">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}

      <div className="text-center space-y-2">
        {success ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verified!</h2>
            <p className="text-gray-600">Your video is being processed...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
            <p className="text-gray-600">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold">{mobileNumber}</span>
            </p>
          </>
        )}
      </div>

      {!success && (
        <>
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying || otp.join("").length !== 6}
            className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors ${
              isVerifying || otp.join("").length !== 6
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="text-center">
            <button
              onClick={handleResendOTP}
              disabled={isVerifying}
              className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
            >
              Didn't receive code? Resend OTP
            </button>
          </div>
        </>
      )}
    </div>
  );
}
