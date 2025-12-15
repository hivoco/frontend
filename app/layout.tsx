import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Logo from "@/components/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Legacy Lens by HiVoco Studios",
  description: "Your destination for Go-Diamond & ALS 2025 Personalized Videos - Powered by HiVoco Studios.",
  icons: {
    icon: "/amway-svg.svg",
    apple: "/amway-svg.svg",
  },
  openGraph: {
    title: "Legacy Lens by HiVoco Studios",
    description: "Your destination for Go-Diamond & ALS 2025 Personalized Videos - Powered by HiVoco Studios.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://qas.legacylens.me/",
    siteName: "Legacy Lens by HiVoco Studios",
    images: [
      {
        url: "/og-image.jpg", // Change to JPG or PNG
        width: 1200,
        height: 630,
        alt: "Legacy Lens by HiVoco Studios",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legacy Lens by HiVoco Studios",
    description: "Your destination for Go-Diamond & ALS 2025 Personalized Videos - Powered by HiVoco Studios.",
    images: ["/amway-svg.png"], // Change to JPG or PNG
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-linear-to-b from-white to-primary/5`}
      >
        <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <Logo />
            <h1 className="text-2xl font-bold text-primary">Amway Summit</h1>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
