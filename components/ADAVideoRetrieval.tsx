// "use client";

// import { useState, useEffect } from "react";
// import { Download, AlertCircle, Loader2, Search } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "./ui/input";
// import { getVideoByAda } from "@/lib/fetch";


// const loadingMessages = [
//     "Searching video...",
//     "Processing request...",
//     "Fetching your video...",
//     "Almost there...",
// ];

// interface VideoResponse {
//     status: string;
//     cached: boolean;
//     ada_no: string;
//     video_url: string;
// }

// interface ErrorResponse {
//     detail: string;
// }

// export function AdaVideoRetrieval() {
//     const [adaNumber, setAdaNumber] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [loadingIndex, setLoadingIndex] = useState(0);
//     const [videoUrl, setVideoUrl] = useState<string | null>(null);
//     const [apiError, setApiError] = useState<string | null>(null);

//     // Cycle through loading messages
//     useEffect(() => {
//         if (!isSubmitting) return;

//         const interval = setInterval(() => {
//             setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
//         }, 450);

//         return () => clearInterval(interval);
//     }, [isSubmitting]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!adaNumber.trim()) {
//             setApiError("Please enter your ADA number");
//             return;
//         }

//         setIsSubmitting(true);
//         setApiError(null);
//         setVideoUrl(null);

//         try {
//             const result = await getVideoByAda(adaNumber.trim());

//             if (result.status === "success" && result.videoUrl) {
//                 setVideoUrl(result.videoUrl);
//             } else {
//                 setApiError(result.message || "No video found for this ADA number");
//             }
//         } catch (err) {
//             console.error("Failed to fetch video:", err);
//             setApiError("Video not found or service unavailable");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const [isDownloading, setIsDownloading] = useState(false);

//     const handleDownload = async () => {
//         if (!videoUrl) return;

//         setIsDownloading(true);
//         try {
//             const response = await fetch(videoUrl);
//             const blob = await response.blob();
//             const blobUrl = window.URL.createObjectURL(blob);

//             const link = document.createElement("a");
//             link.href = blobUrl;
//             link.download = `ada-${adaNumber}-video.mp4`;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);

//             window.URL.revokeObjectURL(blobUrl);
//         } catch (error) {
//             console.error("Download failed:", error);
//             window.open(videoUrl, '_blank');
//         } finally {
//             setIsDownloading(false);
//         }
//     };
//     const resetForm = () => {
//         setAdaNumber("");
//         setVideoUrl(null);
//         setApiError(null);
//     };

//     return (
//         <div className="max-w-md mx-auto">
//             <Card className="border-primary/30 shadow-2xl hover:shadow-3xl card-lift backdrop-blur-sm bg-white/95">
//                 <CardHeader className="bg-gradient-to-br from-primary/10 via-purple-50 to-accent/5 border-b border-primary/20 pb-8 pt-8">
//                     <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//                         Get Your Personalized Video
//                     </CardTitle>
//                     <CardDescription className="text-base mt-2 text-foreground/70">
//                         Enter your ADA number to retrieve your video
//                     </CardDescription>
//                 </CardHeader>

//                 <CardContent className="space-y-5 pt-6">
//                     {apiError && (
//                         <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200/60 animate-in fade-in">
//                             <div className="flex items-center gap-3">
//                                 <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
//                                 <div className="flex-1">
//                                     <Badge className="bg-amber-600 hover:bg-amber-700 mb-2">
//                                         Not found
//                                     </Badge>
//                                     <p className="text-sm text-amber-900 font-medium">
//                                         {apiError}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {!videoUrl ? (
//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             <div className="space-y-2">
//                                 <label
//                                     htmlFor="ada-number"
//                                     className="text-sm font-semibold text-foreground"
//                                 >
//                                     ADA Number
//                                 </label>
//                                 <Input
//                                     id="ada-number"
//                                     type="text"
//                                     placeholder="Enter your ADA number"
//                                     value={adaNumber}
//                                     onChange={(e) => setAdaNumber(e.target.value)}
//                                     disabled={isSubmitting}
//                                     className="h-12 rounded-2xl border-primary/20 focus:border-primary/40 text-base"
//                                 />
//                             </div>

//                             <Button
//                                 type="submit"
//                                 disabled={isSubmitting || !adaNumber.trim()}
//                                 className="w-full h-12 rounded-2xl font-semibold gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 {isSubmitting ? (
//                                     <>
//                                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
//                                         <Loader2 className="h-5 w-5 animate-spin" />
//                                         <span className="relative">
//                                             {loadingMessages[loadingIndex]}
//                                         </span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Search className="h-5 w-5" />
//                                         Get Video
//                                     </>
//                                 )}
//                             </Button>
//                         </form>
//                     ) : (
//                         <div className="space-y-4">
//                             <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/30">
//                                 <video
//                                     src={videoUrl}
//                                     controls
//                                     className="w-full h-auto"
//                                     controlsList="nodownload"
//                                 >
//                                     Your browser does not support the video tag.
//                                 </video>
//                                 <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
//                             </div>

//                             <div className="flex gap-3">
//                                 <Button
//                                     onClick={handleDownload}
//                                     disabled={isDownloading}
//                                     className="flex-1 h-12 rounded-2xl font-semibold gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary"
//                                 >
//                                     {isDownloading ? (
//                                         <>
//                                             <Loader2 className="h-5 w-5 animate-spin" />
//                                             Downloading...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Download className="h-5 w-5" />
//                                             Download Video
//                                         </>
//                                     )}
//                                 </Button>

//                                 <Button
//                                     onClick={resetForm}
//                                     className="flex-1 h-12 rounded-2xl font-semibold bg-muted hover:bg-muted/80 hover:border-primary/30 border-2 border-primary/10 transition-all duration-300 text-foreground"
//                                 >
//                                     Try Another
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }


// "use client";

// import { useState, useEffect } from "react";
// import { Download, AlertCircle, Loader2, Search } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "./ui/input";
// // import { getVideoByMobile } from "@/lib/fetch";
// import { getVideoByAda } from "@/lib/fetch";

// const loadingMessages = [
//     "Searching video...",
//     "Processing request...",
//     "Fetching your video...",
//     "Almost there...",
// ];

// export function AdaVideoRetrieval() {
//     const [mobileNumber, setMobileNumber] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [loadingIndex, setLoadingIndex] = useState(0);
//     const [videoUrl, setVideoUrl] = useState<string | null>(null);
//     const [apiError, setApiError] = useState<string | null>(null);
//     const [isDownloading, setIsDownloading] = useState(false);

//     useEffect(() => {
//         if (!isSubmitting) return;

//         const interval = setInterval(() => {
//             setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
//         }, 450);

//         return () => clearInterval(interval);
//     }, [isSubmitting]);

//     const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const value = e.target.value.replace(/\D/g, "");
//         if (value.length <= 10) {
//             setMobileNumber(value);
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (mobileNumber.length !== 10) {
//             setApiError("Please enter a valid 10-digit mobile number");
//             return;
//         }

//         setIsSubmitting(true);
//         setApiError(null);
//         setVideoUrl(null);

//         try {
//             const result = await getVideoByAda(mobileNumber);

//             if (result.status === "success" && result.videoUrl) {
//                 setVideoUrl(result.videoUrl);
//             } else {
//                 setApiError(result.message || "No video found for this mobile number");
//             }
//         } catch (err) {
//             console.error("Failed to fetch video:", err);
//             setApiError("Video not found or service unavailable");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleDownload = async () => {
//         if (!videoUrl) return;

//         setIsDownloading(true);
//         try {
//             const response = await fetch(videoUrl);
//             const blob = await response.blob();
//             const blobUrl = window.URL.createObjectURL(blob);

//             const link = document.createElement("a");
//             link.href = blobUrl;
//             link.download = `mobile-${mobileNumber}-video.mp4`;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);

//             window.URL.revokeObjectURL(blobUrl);
//         } catch (error) {
//             console.error("Download failed:", error);
//             window.open(videoUrl, '_blank');
//         } finally {
//             setIsDownloading(false);
//         }
//     };

//     const resetForm = () => {
//         setMobileNumber("");
//         setVideoUrl(null);
//         setApiError(null);
//     };

//     return (
//         <div className="max-w-md mx-auto">
//             <Card className="border-primary/30 shadow-2xl hover:shadow-3xl card-lift backdrop-blur-sm bg-white/95">
//                 <CardHeader className="bg-gradient-to-br from-primary/10 via-purple-50 to-accent/5 border-b border-primary/20 pb-8 pt-8">
//                     <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//                         Get Your Personalized Video
//                     </CardTitle>
//                     <CardDescription className="text-base mt-2 text-foreground/70">
//                         Enter your mobile number to retrieve your video
//                     </CardDescription>
//                 </CardHeader>

//                 <CardContent className="space-y-5 pt-6">
//                     {apiError && (
//                         <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200/60 animate-in fade-in">
//                             <div className="flex items-center gap-3">
//                                 <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
//                                 <div className="flex-1">
//                                     <Badge className="bg-amber-600 hover:bg-amber-700 mb-2">
//                                         Not found
//                                     </Badge>
//                                     <p className="text-sm text-amber-900 font-medium">
//                                         {apiError}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {!videoUrl ? (
//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             <div className="space-y-2">
//                                 <label
//                                     htmlFor="mobile-number"
//                                     className="text-sm font-semibold text-foreground"
//                                 >
//                                     Mobile Number
//                                 </label>
//                                 <Input
//                                     id="mobile-number"
//                                     type="tel"
//                                     placeholder="Enter your 10-digit mobile number"
//                                     value={mobileNumber}
//                                     onChange={handleMobileChange}
//                                     disabled={isSubmitting}
//                                     maxLength={10}
//                                     className="h-12 rounded-2xl border-primary/20 focus:border-primary/40 text-base"
//                                 />
//                                 {mobileNumber.length > 0 && mobileNumber.length < 10 && (
//                                     <p className="text-xs text-muted-foreground">
//                                         {10 - mobileNumber.length} digits remaining
//                                     </p>
//                                 )}
//                             </div>

//                             <Button
//                                 type="submit"
//                                 disabled={isSubmitting || mobileNumber.length !== 10}
//                                 className="w-full h-12 rounded-2xl font-semibold gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 {isSubmitting ? (
//                                     <>
//                                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
//                                         <Loader2 className="h-5 w-5 animate-spin" />
//                                         <span className="relative">
//                                             {loadingMessages[loadingIndex]}
//                                         </span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Search className="h-5 w-5" />
//                                         Get Video
//                                     </>
//                                 )}
//                             </Button>
//                         </form>
//                     ) : (
//                         <div className="space-y-4">
//                             <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/30">
//                                 <video
//                                     src={videoUrl}
//                                     controls
//                                     className="w-full h-auto"
//                                     controlsList="nodownload"
//                                 >
//                                     Your browser does not support the video tag.
//                                 </video>
//                                 <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
//                             </div>

//                             <div className="flex gap-3">
//                                 <Button
//                                     onClick={handleDownload}
//                                     disabled={isDownloading}
//                                     className="flex-1 h-12 rounded-2xl font-semibold gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary"
//                                 >
//                                     {isDownloading ? (
//                                         <>
//                                             <Loader2 className="h-5 w-5 animate-spin" />
//                                             Downloading...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Download className="h-5 w-5" />
//                                             Download Video
//                                         </>
//                                     )}
//                                 </Button>

//                                 <Button
//                                     onClick={resetForm}
//                                     className="flex-1 h-12 rounded-2xl font-semibold bg-muted hover:bg-muted/80 hover:border-primary/30 border-2 border-primary/10 transition-all duration-300 text-foreground"
//                                 >
//                                     Try Another
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }



"use client";

import { useState, useEffect } from "react";
import { Download, AlertCircle, Loader2, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "./ui/input";
import { getVideoByAda } from "@/lib/fetch";

const loadingMessages = [
    "Searching video...",
    "Processing request...",
    "Fetching your video...",
    "Almost there...",
];

interface AdaVideoRetrievalProps {
    initialMobileNo?: string | null;
}

export function AdaVideoRetrieval({ initialMobileNo }: AdaVideoRetrievalProps) {
    const [mobileNumber, setMobileNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingIndex, setLoadingIndex] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showCard, setShowCard] = useState(true);

    useEffect(() => {
        if (initialMobileNo ) {
            setMobileNumber(initialMobileNo);
            setShowCard(false);
            fetchVideo(initialMobileNo);
        }
    }, [initialMobileNo]);

    useEffect(() => {
        if (!isSubmitting) return;

        const interval = setInterval(() => {
            setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 450);

        return () => clearInterval(interval);
    }, [isSubmitting]);

    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 10) {
            setMobileNumber(value);
        }
    };

    const fetchVideo = async (mobile: string) => {
        setIsSubmitting(true);
        setApiError(null);
        setVideoUrl(null);

        try {
            const result = await getVideoByAda(mobile);

            if (result.status === "success" && result.videoUrl) {
                setVideoUrl(result.videoUrl);
            } else {
                setApiError(result.message || "No video found for this mobile number");
            }
        } catch (err) {
            console.error("Failed to fetch video:", err);
            setApiError("Video not found or service unavailable");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // if (mobileNumber.length !== 10) {
        //     setApiError("Please enter a valid 10-digit mobile number");
        //     return;
        // }

        await fetchVideo(mobileNumber);
    };

    const handleDownload = async () => {
        if (!videoUrl) return;

        setIsDownloading(true);
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `legacylens-${mobileNumber}-video.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(videoUrl, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    const goToHome = () => {
        window.location.href = '/';
    };

    // Direct video view without card (for URL parameter)
    if (!showCard) {
        return (
            <div className="w-full space-y-6">
                {isSubmitting && (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-lg font-semibold text-foreground animate-pulse">
                            {loadingMessages[loadingIndex]}
                        </p>
                    </div>
                )}

                {apiError && !isSubmitting && (
                    <div className="rounded-2xl bg-amber-50/80 p-6 border border-amber-200/60 animate-in fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                            <div className="flex-1">
                                <Badge className="bg-amber-600 hover:bg-amber-700 mb-2">
                                    Not found
                                </Badge>
                                <p className="text-base text-amber-900 font-medium">
                                    {apiError}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={goToHome}
                            className="w-full h-12 rounded-2xl font-semibold gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
                        >
                            <Home className="h-5 w-5" />
                            Go to Home
                        </Button>
                    </div>
                )}

                {videoUrl && !isSubmitting && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/30">
                            <video
                                src={videoUrl}
                                controls
                                autoPlay
                                className="w-full h-auto"
                            >
                                Your browser does not support the video tag.
                            </video>
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex-1 h-12 rounded-2xl font-semibold gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-5 w-5" />
                                        Download Video
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={goToHome}
                                className="flex-1 h-12 rounded-2xl font-semibold bg-muted hover:bg-muted/80 hover:border-primary/30 border-2 border-primary/10 transition-all duration-300 text-foreground gap-2"
                            >
                                <Home className="h-5 w-5" />
                                Home
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Card view (for manual entry)
    return (
        <div className="max-w-md mx-auto">
            <Card className="border-primary/30 shadow-2xl hover:shadow-3xl card-lift backdrop-blur-sm bg-white/95">
                <CardHeader className="bg-gradient-to-br from-primary/10 via-purple-50 to-accent/5 border-b border-primary/20 pb-8 pt-8">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Get Your Personalized Video
                    </CardTitle>
                    <CardDescription className="text-base mt-2 text-foreground/70">
                        Enter your mobile number to retrieve your video
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 pt-6">
                    {apiError && (
                        <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200/60 animate-in fade-in">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <Badge className="bg-amber-600 hover:bg-amber-700 mb-2">
                                        Not found
                                    </Badge>
                                    <p className="text-sm text-amber-900 font-medium">
                                        {apiError}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!videoUrl ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="mobile-number"
                                    className="text-sm font-semibold text-foreground"
                                >
                                    Mobile Number
                                </label>
                                <Input
                                    id="mobile-number"
                                    type="tel"
                                    placeholder="Enter your 10-digit mobile number"
                                    value={mobileNumber}
                                    onChange={handleMobileChange}
                                    disabled={isSubmitting}
                                    maxLength={10}
                                    className="h-12 rounded-2xl border-primary/20 focus:border-primary/40 text-base"
                                />
                                {mobileNumber.length > 0 && mobileNumber.length < 10 && (
                                    <p className="text-xs text-muted-foreground">
                                        {10 - mobileNumber.length} digits remaining
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || mobileNumber.length !== 10}
                                className="w-full h-12 rounded-2xl font-semibold gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="relative">
                                            {loadingMessages[loadingIndex]}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-5 w-5" />
                                        Get Video
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/30">
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-auto"
                                >
                                    Your browser does not support the video tag.
                                </video>
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="flex-1 h-12 rounded-2xl font-semibold gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-white glow-primary"
                                >
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-5 w-5" />
                                            Download Video
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={() => {
                                        setMobileNumber("");
                                        setVideoUrl(null);
                                        setApiError(null);
                                    }}
                                    className="flex-1 h-12 rounded-2xl font-semibold bg-muted hover:bg-muted/80 hover:border-primary/30 border-2 border-primary/10 transition-all duration-300 text-foreground"
                                >
                                    Try Another
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}