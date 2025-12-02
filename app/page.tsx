"use client";

import ImageDisplay from "@/components/ImageDisplay";
import { PhotoUploadWithID } from "@/components/PhotoUploadWithID";
import { PhotoUploadBasic } from "@/components/PhotoUploadBasic";
import { Suspense, useState } from "react";
import { searchFace } from "@/lib/fetch";

type HomeView = "home" | "view";

export default function Home() {
  const [currentView, setCurrentView] = useState<HomeView>("home");

  const handlePhotoSubmitBasic = async (file: File) => {
    const response = await searchFace(file);
    console.log("Photo submitted:", response);
    setCurrentView("view");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated decorative blur elements - Amway green theme */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <main className="relative w-full">
        {currentView === "home" && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center w-full h-64">
                    <div className="photo-upload-spinner" />
                  </div>
                }
              >
                <div>
                  <PhotoUploadWithID />
                </div>
              </Suspense>

              <Suspense
                fallback={
                  <div className="flex items-center justify-center w-full h-64">
                    <div className="photo-upload-spinner" />
                  </div>
                }
              >
                <div>
                  <PhotoUploadBasic />
                </div>
              </Suspense>
            </div>
          </div>
        )}

        {/* {currentView === "view" && (
          <div className="flex flex-col items-center justify-center gap-4">
            <ImageDisplay />
            <button
              onClick={() => setCurrentView("home")}
              className="text-primary hover:text-primary/80 font-semibold underline transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        )} */}
      </main>
    </div>
  );
}
