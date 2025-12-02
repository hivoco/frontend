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
  title: "Amway Leadership Summit",
  description: "Capture and upload photos at the Amway Leadership Summit. Professional imaging with stunning modern UI.",
  icons: {
    icon: "/amway-svg.svg",
    apple: "/amway-svg.svg",
  },
  openGraph: {
    title: "Amway Leadership Summit",
    description: "Capture and upload photos at the Amway Leadership Summit",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://qas.legacylens.me/",
    siteName: "Amway Leadership Summit",
    images: [
      {
        url: "/amway-svg.svg",
        width: 200,
        height: 200,
        alt: "Amway Logo",
        type: "image/svg+xml",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amway Leadership Summit | Photo Capture",
    description: "Capture and upload photos at the Amway Leadership Summit.",
    images: ["/amway-svg.svg"],
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
