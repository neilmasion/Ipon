import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Ipon — Minimalist Daily Savings Tracker",
  description: "Build a saving habit, track your money, maintain streaks, and reach your savings goals with a clean, minimalist experience.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FF4F81",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FFF5F8] text-ipon-text antialiased selection:bg-ipon-light selection:text-ipon-primary relative overflow-x-hidden">
        {/* Ambient Glassmorphic Background Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          {/* Top Left Rose Orb */}
          <div className="absolute -top-24 -left-24 w-[520px] h-[520px] bg-gradient-to-br from-[#FF4F81]/20 via-[#FF85A2]/15 to-transparent rounded-full blur-[120px] animate-float-slow" />
          
          {/* Top Right Lavender Orb */}
          <div className="absolute -top-32 right-[-10%] w-[500px] h-[500px] bg-gradient-to-bl from-purple-300/25 via-pink-200/20 to-transparent rounded-full blur-[130px] animate-float-reverse" />
          
          {/* Center Mid Soft Peach-Pink Orb */}
          <div className="absolute top-[35%] left-[20%] w-[420px] h-[420px] bg-gradient-to-tr from-[#FFE4EC]/40 to-transparent rounded-full blur-[140px] animate-float-slow" />
          
          {/* Bottom Right Warm Amber-Rose Orb */}
          <div className="absolute bottom-[-10%] right-[5%] w-[480px] h-[480px] bg-gradient-to-tl from-[#FF7096]/15 via-rose-100/30 to-transparent rounded-full blur-[130px] animate-float-reverse" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>

        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
