"use client";

import { useState } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PhotoUploadAdvanced } from "@/components/PhotoUploadAdvanced";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SubmittedPhoto {
  name: string;
  size: string;
  url: string;
  timestamp: string;
}

export default function ExamplesPage() {
  const [submitted, setSubmitted] = useState<SubmittedPhoto[]>([]);
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");

  const handleBasicSubmit = async (file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API

    const url = URL.createObjectURL(file);
    setSubmitted((prev) => [
      {
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB",
        url,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const handleAdvancedSubmit = async (file: File, metadata: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API

    const url = URL.createObjectURL(file);
    setSubmitted((prev) => [
      {
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB",
        url,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Photo Upload Examples</h1>
          <p className="text-muted-foreground">
            See both basic and advanced photo upload components in action
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "basic"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Basic Upload
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "advanced"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Advanced Upload
          </button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Component */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">
                {activeTab === "basic" ? "Basic Photo Upload" : "Advanced Photo Upload"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeTab === "basic"
                  ? "Simple, clean interface for file upload and camera capture"
                  : "Includes image metadata, dimensions, and optional compression"}
              </p>
            </div>

            {activeTab === "basic" ? (
              <PhotoUpload onPhotoSubmit={handleBasicSubmit} />
            ) : (
              <PhotoUploadAdvanced
                onPhotoSubmit={handleAdvancedSubmit}
                enableCompression={true}
              />
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {activeTab === "basic" ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">Step 1: Choose Method</h4>
                      <p className="text-muted-foreground">
                        Click the upload area to select a file from your device or choose "Open
                        Camera" to capture a photo
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Step 2: Preview</h4>
                      <p className="text-muted-foreground">
                        Review your photo before submitting. You can retake or select a different
                        image
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Step 3: Submit</h4>
                      <p className="text-muted-foreground">
                        Click Submit to send the photo. The file is sent to your backend for
                        processing
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">Metadata Display</h4>
                      <p className="text-muted-foreground">
                        View image dimensions, file size, and format before submitting
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Automatic Compression</h4>
                      <p className="text-muted-foreground">
                        Images are automatically optimized for web (85% quality JPEG)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">File Info</h4>
                      <p className="text-muted-foreground">
                        See original size before compression and format details
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Works on desktop and mobile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Front camera access on mobile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>File validation (type & size)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Real-time preview</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Error handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Fully typed with TypeScript</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submitted Photos */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Submitted Photos ({submitted.length})
          </h2>

          {submitted.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No photos submitted yet. Upload one above to see it appear here!
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {submitted.map((photo, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium truncate mb-1">{photo.name}</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Size: {photo.size}</p>
                      <p>Submitted: {photo.timestamp}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Code Examples */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Code Examples</h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Usage</CardTitle>
              <CardDescription>Simple file upload and camera capture</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{`import { PhotoUpload } from "@/components/PhotoUpload";

export default function Home() {
  const handlePhotoSubmit = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Uploaded:", data);
  };

  return <PhotoUpload onPhotoSubmit={handlePhotoSubmit} />;
}`}</code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Usage</CardTitle>
              <CardDescription>With metadata and compression</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{`import { PhotoUploadAdvanced } from "@/components/PhotoUploadAdvanced";

export default function Home() {
  const handlePhotoSubmit = async (file: File, metadata: ImageMetadata) => {
    console.log("File size:", metadata.size);
    console.log("Dimensions:", metadata.width, "x", metadata.height);

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("metadata", JSON.stringify(metadata));

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <PhotoUploadAdvanced
      onPhotoSubmit={handlePhotoSubmit}
      enableCompression={true}
    />
  );
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Built with React, TypeScript, shadcn/ui, and Tailwind CSS • Fully responsive
            mobile-first design
          </p>
        </div>
      </div>
    </div>
  );
}
