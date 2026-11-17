import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { IOSSmartBanner } from "@/components/pwa/IOSSmartBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApnaPG — Mobile-First PG Management SaaS",
  description: "Next-gen PG, hostel & co-living property management platform with 5-level hierarchy and role-based access.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ApnaPG",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className="min-h-full bg-slate-900 flex justify-center text-slate-900 selection:bg-blue-600 selection:text-white">
        {/* Mobile-first PWA Container: max-w-[480px] on desktop, full width on mobile */}
        <div className="w-full max-w-[480px] mx-auto min-h-screen bg-slate-50 shadow-2xl relative pb-20 flex flex-col overflow-x-hidden border-x border-slate-200/60 dark:border-slate-800">
          <IOSSmartBanner />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
