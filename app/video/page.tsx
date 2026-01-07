"use client";

import { useState } from "react";
import { VideoSubmissionForm } from "@/components/VideoSubmissionForm";
import { OTPVerification } from "@/components/OTPVerification";
import { CheckCircle } from "lucide-react";

type FlowStep = "form" | "otp" | "success";

export default function VideoPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("form");
  const [submittedData, setSubmittedData] = useState<{
    mobileNumber: string;
    jobId: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/video/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Submission failed");
      }

      if (data.status === "otp_sent") {
        setSubmittedData({
          mobileNumber: formData.get("mobile_number") as string,
          jobId: data.job_id,
        });
        setCurrentStep("otp");
      } else if (data.status === "video_created") {
        // If user is already verified, go directly to success
        setSubmittedData({
          mobileNumber: formData.get("mobile_number") as string,
          jobId: data.job_id,
        });
        setCurrentStep("success");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerified = (jobId: number) => {
    setCurrentStep("success");
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
    setSubmittedData(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated decorative blur elements */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />

      <main className="relative w-full max-w-4xl">
        {/* Step Indicator */}
        <div className="mb-8 flex justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                currentStep === "form"
                  ? "bg-primary text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {currentStep === "form" ? "1" : <CheckCircle className="h-5 w-5" />}
            </div>
            <span className="text-sm font-medium">Form</span>
          </div>

          <div className="w-16 h-1 bg-gray-300 rounded">
            <div
              className={`h-full bg-primary rounded transition-all duration-500 ${
                currentStep !== "form" ? "w-full" : "w-0"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                currentStep === "otp"
                  ? "bg-primary text-white"
                  : currentStep === "success"
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {currentStep === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                "2"
              )}
            </div>
            <span className="text-sm font-medium">OTP</span>
          </div>

          <div className="w-16 h-1 bg-gray-300 rounded">
            <div
              className={`h-full bg-primary rounded transition-all duration-500 ${
                currentStep === "success" ? "w-full" : "w-0"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                currentStep === "success"
                  ? "bg-primary text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {currentStep === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                "3"
              )}
            </div>
            <span className="text-sm font-medium">Done</span>
          </div>
        </div>

        {/* Content */}
        {currentStep === "form" && (
          <VideoSubmissionForm
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === "otp" && submittedData && (
          <OTPVerification
            mobileNumber={submittedData.mobileNumber}
            jobId={submittedData.jobId}
            onVerified={handleVerified}
            onBack={handleBackToForm}
          />
        )}

        {currentStep === "success" && submittedData && (
          <div className="w-full max-w-md mx-auto space-y-6 p-8 bg-white rounded-2xl shadow-lg text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-6 bg-green-100 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Success!
              </h2>
              <p className="text-gray-600">
                Your video is being processed. You'll receive it on WhatsApp at{" "}
                <span className="font-semibold">{submittedData.mobileNumber}</span>{" "}
                once it's ready.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                <p className="font-semibold mb-1">Job ID: {submittedData.jobId}</p>
                <p>Keep this for reference</p>
              </div>
              <button
                onClick={handleBackToForm}
                className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Create Another Video
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
