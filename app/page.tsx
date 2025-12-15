// "use client";

// import { PhotoUploadWithID } from "@/components/PhotoUploadWithID";
// import { PhotoUploadBasic } from "@/components/PhotoUploadBasic";
// import { Suspense, useState } from "react";
// import { ArrowRight, Upload, Images } from "lucide-react";
// import { AdaVideoRetrieval } from "@/components/ADAVideoRetrieval";

// type HomeView = "home" | "upload-info" | "upload-photo" | "view-images";

// export default function Home() {
//   const [currentView, setCurrentView] = useState<HomeView>("home");

//   return (
//     <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center px-4 py-8 relative overflow-hidden">
//       {/* Animated decorative blur elements - Amway green theme */}
//       <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />
//       <div className="absolute bottom-0 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

//       <main className="relative w-full">
//         {currentView === "home" && (
//           <div className="max-w-4xl mx-auto">
//             <div className="flex justify-center items-center  gap-6 mb-8 ">
//               {/* Option 1: Upload Information */}
//               <button
//                 onClick={() => setCurrentView("upload-info")}
//                 className="group relative p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br max-w-sm from-primary/5 via-white to-primary/5 hover:border-primary/60 hover:shadow-2xl transition-all duration-300 overflow-hidden"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                 <div className="relative space-y-4">
//                   <div className="inline-flex p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
//                     <Upload className="h-6 w-6 text-primary" />
//                   </div>
//                   <div className="text-left">
//                     <h2 className="text-2xl font-bold text-foreground mb-2">
//                       Your Personalized Video
//                     </h2>
//                     <p className="text-muted-foreground mb-4">
//                       Like to see your personalized video? Give it a go — Enter your Mobile number and get your video!
//                     </p>
//                   </div>
//                   <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-all">
//                     Get Started
//                     <ArrowRight className="h-5 w-5" />
//                   </div>
//                 </div>
//               </button>

//               {/* Option 2: Upload Photo */}
//               {/* <button
//                 onClick={() => setCurrentView("upload-photo")}
//                 className="group relative p-8 rounded-2xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 via-white to-secondary/5 hover:border-secondary/60 hover:shadow-2xl transition-all duration-300 overflow-hidden"
//               >
//                 <div className="absolute inset-0 bg-linear-to-r from-secondary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                 <div className="relative space-y-4">
//                   <div className="inline-flex p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
//                     <Images className="h-6 w-6 text-secondary" />
//                   </div>
//                   <div className="text-left">
//                     <h2 className="text-2xl font-bold text-foreground mb-2">
//                       Get Your Photos
//                     </h2>
//                     <p className="text-muted-foreground mb-4">
//                       Upload a photo and find all matching images from our
//                       database
//                     </p>
//                   </div>
//                   <div className="flex items-center text-secondary font-semibold group-hover:gap-3 gap-2 transition-all">
//                     Get Started
//                     <ArrowRight className="h-5 w-5" />
//                   </div>
//                 </div>
//               </button> */}
//             </div>
//           </div>
//         )}

//         {currentView === "upload-info" && (
//           <div className="max-w-md mx-auto">
//             <button
//               onClick={() => setCurrentView("home")}
//               className="mb-6 text-primary hover:text-primary/80 font-semibold flex items-center gap-2 transition-colors"
//             >
//               ← Back to Home
//             </button>
//             <Suspense
//               fallback={
//                 <div className="flex items-center justify-center w-full h-64">
//                   <div className="photo-upload-spinner" />
//                 </div>
//               }
//             >
//               <AdaVideoRetrieval />
//             </Suspense>
//           </div>
//         )}

//         {currentView === "upload-photo" && (
//           <div className="max-w-md mx-auto">
//             <button
//               onClick={() => setCurrentView("home")}
//               className="mb-6 text-primary hover:text-primary/80 font-semibold flex items-center gap-2 transition-colors"
//             >
//               ← Back to Home
//             </button>
//             <Suspense
//               fallback={
//                 <div className="flex items-center justify-center w-full h-64">
//                   <div className="photo-upload-spinner" />
//                 </div>
//               }
//             >
//               <PhotoUploadBasic />
//             </Suspense>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


"use client";

import { PhotoUploadWithID } from "@/components/PhotoUploadWithID";
import { PhotoUploadBasic } from "@/components/PhotoUploadBasic";
import { Suspense, useState, useEffect } from "react";
import { ArrowRight, Upload, Images } from "lucide-react";
import { AdaVideoRetrieval } from "@/components/ADAVideoRetrieval";
import { useSearchParams } from "next/navigation";

type HomeView = "home" | "upload-info" | "upload-photo" | "view-images";

function HomeContent() {
  const [currentView, setCurrentView] = useState<HomeView>("home");
  const searchParams = useSearchParams();
  const mobileNo = searchParams.get("mobile_no");

  useEffect(() => {
    if (mobileNo ) {
      setCurrentView("upload-info");
    }
  }, [mobileNo]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated decorative blur elements */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <main className="relative w-full">
        {currentView === "home" && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center gap-6 mb-8">
              <button
                onClick={() => setCurrentView("upload-info")}
                className="group relative p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br max-w-sm from-primary/5 via-white to-primary/5 hover:border-primary/60 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative space-y-4">
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Your Personalized Video
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Like to see your personalized video? Give it a go — Enter your Mobile number and get your video!
                    </p>
                  </div>
                  <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-all">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {currentView === "upload-info" && (
          <div className="max-w-3xl mx-auto">
            {!mobileNo && (
              <button
                onClick={() => setCurrentView("home")}
                className="mb-6 text-primary hover:text-primary/80 font-semibold flex items-center gap-2 transition-colors"
              >
                ← Back to Home
              </button>
            )}
            <Suspense
              fallback={
                <div className="flex items-center justify-center w-full h-64">
                  <div className="photo-upload-spinner" />
                </div>
              }
            >
              <AdaVideoRetrieval initialMobileNo={mobileNo} />
            </Suspense>
          </div>
        )}

        {currentView === "upload-photo" && (
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setCurrentView("home")}
              className="mb-6 text-primary hover:text-primary/80 font-semibold flex items-center gap-2 transition-colors"
            >
              ← Back to Home
            </button>
            <Suspense
              fallback={
                <div className="flex items-center justify-center w-full h-64">
                  <div className="photo-upload-spinner" />
                </div>
              }
            >
              <PhotoUploadBasic />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="photo-upload-spinner" /></div>}>
      <HomeContent />
    </Suspense>
  );
}