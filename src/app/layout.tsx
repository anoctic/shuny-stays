import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { IOSSmartBanner } from "@/components/pwa/IOSSmartBanner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShunyOS — Multi-Tenant PG & Hostel Operating System",
  description: "Cloud-native PG, hostel & co-living property management operating system with 5-level hierarchy, white-label branding, and role-based access.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ShunyOS",
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
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className="min-h-full bg-[#060913] flex justify-center text-[#0F172A] selection:bg-indigo-600 selection:text-white">
        {/* Mobile-first PWA Container: max-w-[480px] on desktop, full width on mobile */}
        <div className="w-full max-w-[480px] mx-auto min-h-screen bg-[#F8FAFC] shadow-2xl relative pb-20 flex flex-col overflow-x-hidden border-x border-[#E2E8F0]">
          <IOSSmartBanner />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
