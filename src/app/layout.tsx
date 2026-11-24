import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { IOSSmartBanner } from "@/components/pwa/IOSSmartBanner";
import { StartupSplashScreen } from "@/components/common/StartupSplashScreen";

export const runtime = "edge";

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
 metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://shunystays.com"),
 title: "Shuny Stays — Multi-Tenant PG & Hostel Operating System",
 description: "Cloud-native PG, hostel & co-living property management operating system with 5-level hierarchy, white-label branding, and role-based access.",
 manifest: "/manifest.webmanifest",
 icons: {
 icon: "/icons/icon-192.png",
 apple: "/apple-touch-icon.png",
 },
 appleWebApp: {
 capable: true,
 statusBarStyle: "default",
 title: "Shuny Stays",
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
 <script
 dangerouslySetInnerHTML={{
 __html: `
 (function() {
 try {
 var cookies = document.cookie.split(';');
 var theme = null;
 for (var i = 0; i < cookies.length; i++) {
 var c = cookies[i].trim();
 if (c.indexOf('shuny_theme_') === 0 || c.indexOf('shuny_theme=') === 0) {
 theme = c.split('=')[1];
 break;
 }
 }
 if (!theme) {
 for (var k in localStorage) {
 if (k.indexOf('shuny_theme') === 0) {
 theme = localStorage.getItem(k);
 if (theme) break;
 }
 }
 }
 if (theme === 'dark') {
 document.documentElement.classList.add('dark');
 } else {
 document.documentElement.classList.remove('dark');
 }
 } catch (e) {}
 })();
 `,
 }}
 />
 </head>
 <body className="min-h-full bg-slate-50 flex justify-center text-[#0F172A] selection:bg-indigo-600 selection:text-white">
 {/* Mobile-first PWA Container: max-w-[480px] on mobile (< lg), full width widescreen on desktop (>= lg) */}
 <div className="w-full max-w-[480px] lg:max-w-none mx-auto min-h-screen bg-[#F8FAFC] shadow-2xl lg:shadow-none relative flex flex-col overflow-x-hidden border-x border-slate-200/80 lg:border-x-0">
 <StartupSplashScreen />
 <IOSSmartBanner />
 <main className="flex-1 flex flex-col">{children}</main>
 </div>
 </body>
 </html>
 );
}
