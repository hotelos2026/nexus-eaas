import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXUS.OS | Living Infrastructure",
  description:
    "Ecosystem as a Service (EaaS). Infrastructure modulaire, intelligente et isolée.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          bg-[#0a0a0f] 
          text-slate-200 
          selection:bg-purple-500/30
        `}
      >

        {/* 🌌 BACKGROUND BASE (plus doux que noir pur) */}
        <div className="fixed inset-0 -z-10 bg-[#0a0a0f]" />

        {/* 🔲 GRID (subtil SaaS) */}
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[40px_40px]" />

        {/* ✨ RADIAL GLOW (branding premium) */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.08),transparent_60%)]" />

        {/* 🎛️ NOISE OVERLAY (corrigé propre) */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {children}

      </body>
    </html>
  );
}