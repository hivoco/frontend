"use client";

import { useState } from "react";
import { CameraCapture } from "./CameraCapture";
import { Send, Loader2 } from "lucide-react";

interface VideoSubmissionFormProps {
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
}

export function VideoSubmissionForm({
  onSubmit,
  isSubmitting,
}: VideoSubmissionFormProps) {
  const [formData, setFormData] = useState({
    mobileNumber: "",
    gender: "",
    attributeLove: "",
    relationshipStatus: "",
    vibe: "",
  });
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [validationMessage, setValidationMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Photo validation using the backend API
  const validatePhoto = async (file: File) => {
    setValidationStatus("validating");
    setValidationMessage("Checking photo quality and content...");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("http://localhost:8000/api/v1/photo-validation/check_photo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.valid) {
        setValidationStatus("valid");
        setValidationMessage("✓ Photo looks great! You can proceed.");
        setCapturedPhoto(file);
      } else {
        setValidationStatus("invalid");
        setValidationMessage(`✗ ${data.message}\n\nReason: ${data.reason || "Please retake the photo"}`);
        setCapturedPhoto(null);
      }
    } catch (error) {
      console.error("Photo validation error:", error);
      setValidationStatus("invalid");
      setValidationMessage("✗ Failed to validate photo. Please try again.");
      setCapturedPhoto(null);
    }
  };

  const handlePhotoCapture = (file: File) => {
    validatePhoto(file);
  };

  const handleValidationResult = (isValid: boolean, message: string) => {
    if (!isValid) {
      setValidationStatus("idle");
      setValidationMessage("");
      setCapturedPhoto(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.attributeLove) newErrors.attributeLove = "Attribute is required";
    if (!formData.relationshipStatus) newErrors.relationshipStatus = "Relationship status is required";
    if (!formData.vibe) newErrors.vibe = "Vibe is required";
    if (!capturedPhoto) newErrors.photo = "Please capture a valid selfie";
    if (validationStatus !== "valid") newErrors.photo = "Photo must be validated before submitting";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append("mobile_number", formData.mobileNumber);
    submitData.append("gender", formData.gender);
    submitData.append("attribute_love", formData.attributeLove);
    submitData.append("relationship_status", formData.relationshipStatus);
    submitData.append("vibe", formData.vibe);
    if (capturedPhoto) {
      submitData.append("photo", capturedPhoto);
    }

    onSubmit(submitData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-6 bg-white rounded-2xl shadow-lg">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Create Your Video</h1>
        <p className="text-gray-600">Fill in your details and take a selfie</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mobile Number */}
        <div className="space-y-2">
          <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700">
            Mobile Number *
          </label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.mobileNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.mobileNumber && (
            <p className="text-sm text-red-600">{errors.mobileNumber}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
            Gender *
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.gender ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unspecified">Prefer not to say</option>
          </select>
          {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
        </div>

        {/* Attribute Love */}
        <div className="space-y-2">
          <label htmlFor="attributeLove" className="block text-sm font-semibold text-gray-700">
            What do you love most? *
          </label>
          <select
            id="attributeLove"
            name="attributeLove"
            value={formData.attributeLove}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.attributeLove ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select attribute</option>
            <option value="Smile">Smile</option>
            <option value="Eyes">Eyes</option>
            <option value="Hair">Hair</option>
            <option value="Face">Face</option>
            <option value="Vibe">Vibe</option>
            <option value="Sense of Humor">Sense of Humor</option>
            <option value="Heart">Heart</option>
          </select>
          {errors.attributeLove && (
            <p className="text-sm text-red-600">{errors.attributeLove}</p>
          )}
        </div>

        {/* Relationship Status */}
        <div className="space-y-2">
          <label htmlFor="relationshipStatus" className="block text-sm font-semibold text-gray-700">
            Relationship Status *
          </label>
          <select
            id="relationshipStatus"
            name="relationshipStatus"
            value={formData.relationshipStatus}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.relationshipStatus ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select status</option>
            <option value="Married">Married</option>
            <option value="Situationship">Situationship</option>
            <option value="Nanaship">Nanaship</option>
            <option value="Crushing">Crushing</option>
            <option value="Long-Distance">Long-Distance</option>
            <option value="Dating">Dating</option>
          </select>
          {errors.relationshipStatus && (
            <p className="text-sm text-red-600">{errors.relationshipStatus}</p>
          )}
        </div>

        {/* Vibe */}
        <div className="space-y-2">
          <label htmlFor="vibe" className="block text-sm font-semibold text-gray-700">
            Choose Your Vibe *
          </label>
          <select
            id="vibe"
            name="vibe"
            value={formData.vibe}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.vibe ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select vibe</option>
            <option value="Romance">Romance</option>
            <option value="Loud & Electric">Loud & Electric</option>
            <option value="Mic On, No Cap">Mic On, No Cap</option>
          </select>
          {errors.vibe && <p className="text-sm text-red-600">{errors.vibe}</p>}
        </div>

        {/* Camera Capture */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Your Selfie *
          </label>
          <CameraCapture
            onPhotoCapture={handlePhotoCapture}
            onValidationResult={handleValidationResult}
            validationStatus={validationStatus}
            validationMessage={validationMessage}
          />
          {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || validationStatus !== "valid"}
          className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors ${
            isSubmitting || validationStatus !== "valid"
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Submit & Get OTP
            </>
          )}
        </button>
      </form>
    </div>
  );
}
