import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
 try {
 let response = NextResponse.next({
 request: {
 headers: new Headers(request.headers),
 },
 });

 const { pathname } = request.nextUrl;

 // 1. Skip static assets, manifest, and icons
 if (
 pathname.startsWith("/_next") ||
 pathname.startsWith("/icons") ||
 pathname === "/manifest.json" ||
 pathname === "/favicon.ico"
 ) {
 return response;
 }

 // 2. Setup Supabase SSR client to refresh cookies
 const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const urlMatch = rawUrl && !rawUrl.includes("placeholder") ? rawUrl.match(/https?:\/\/[^\s"'“”‘’\r\n]+/i) : null;
 const supabaseUrl = urlMatch ? urlMatch[0].replace(/\/+$/, "") : "https://lrghfxcmygytjkzaeccd.supabase.co";

 const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 const keyClean = rawKey ? rawKey.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t"']/g, "").trim().replace(/^bearer\s+/i, "") : "";
 const keyMatch = keyClean.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
 const supabaseAnonKey = keyMatch && keyMatch[0].length > 40
 ? keyMatch[0]
 : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2hmeGNteWd5dGpremFlY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5Mjk5NjMsImV4cCI6MjExMDUwNTk2M30.3khqrllzC1S69EFGFXDdNp-f87dZSpqkogiWYk9tJBo";

 let userRole: "super_admin" | "owner" | "admin" | "tenant" | null = null;
 let hasSession = false;

 // Check demo cookie override or active persona
 const demoRole = request.cookies.get("pg_demo_role")?.value as
 | "super_admin"
 | "owner"
 | "admin"
 | "tenant"
 | undefined;

 if (demoRole && ["super_admin", "owner", "admin", "tenant"].includes(demoRole)) {
 userRole = demoRole;
 hasSession = true;
 } else if (!supabaseUrl.includes("placeholder")) {
 try {
 const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
 cookies: {
 getAll() {
 return request.cookies.getAll();
 },
 setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
 cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
 response = NextResponse.next({ request });
 cookiesToSet.forEach(({ name, value, options }) =>
 response.cookies.set(name, value, options)
 );
 },
 },
 });

 const { data: { user } } = await supabase.auth.getUser();
 if (user) {
 hasSession = true;
 const cleanEmail = (user.email || "").toLowerCase().trim();
 const cleanPhone = (user.phone || (user.user_metadata?.phone as string) || "").replace(/\D/g, "");
 if (
 cleanEmail === "anoctic@gmail.com" ||
 cleanEmail.includes("superadmin") ||
 cleanPhone === "9027003865" ||
 cleanPhone === "9999900001" ||
 user.user_metadata?.role === "super_admin"
 ) {
 userRole = "super_admin";
 } else {
 userRole = (user.user_metadata?.role as "super_admin" | "owner" | "admin" | "tenant") || "tenant";
 }
 }
 } catch {
 // Ignore network errors in middleware
 }
 }

 const isAuthPage = pathname === "/login";
 const isRootPage = pathname === "/";
 const isDashboardPage = pathname.startsWith("/dashboard");
 const isSuperAdminPage = pathname.startsWith("/super-admin");
 const isTenantPage = pathname.startsWith("/tenant");
 const isOnboardingPage = pathname.startsWith("/onboarding");

 // Public sign-ups are disabled — redirect to /login
 if (pathname === "/signup") {
 return NextResponse.redirect(new URL("/login", request.url));
 }

 // Helper for role destination
 const getDestinationForRole = (role: "super_admin" | "owner" | "admin" | "tenant") => {
 if (role === "super_admin") return "/super-admin";
 if (role === "owner") {
 const demoNoPg = request.cookies.get("pg_demo_no_pg")?.value;
 if (demoNoPg === "true") return "/onboarding";
 return "/dashboard";
 }
 if (role === "admin") return "/dashboard";
 return "/tenant";
 };

 // If user is on Root ("/")
 if (isRootPage) {
 if (hasSession && userRole) {
 return NextResponse.redirect(new URL(getDestinationForRole(userRole), request.url));
 }
 return NextResponse.redirect(new URL("/login", request.url));
 }

 // If user is on Auth page (/login, /signup) but already authenticated
 if (isAuthPage && hasSession && userRole) {
 return NextResponse.redirect(new URL(getDestinationForRole(userRole), request.url));
 }

 // If user is accessing protected routes without session
 if (!hasSession && (isDashboardPage || isSuperAdminPage || isTenantPage || isOnboardingPage)) {
 // If running in development without auth session, default to /login
 return NextResponse.redirect(new URL("/login", request.url));
 }

 // Role Guarding for Authenticated Users
 if (hasSession && userRole) {
 // 1. Super Admin Portal
 if (isSuperAdminPage && userRole !== "super_admin") {
 return NextResponse.redirect(new URL(getDestinationForRole(userRole), request.url));
 }

 // 2. Owner / Admin Dashboard
 if (isDashboardPage && userRole !== "owner" && userRole !== "admin") {
 return NextResponse.redirect(new URL(getDestinationForRole(userRole), request.url));
 }

 // 3. Tenant Portal
 if (isTenantPage && userRole !== "tenant") {
 return NextResponse.redirect(new URL(getDestinationForRole(userRole), request.url));
 }

 // 4. Onboarding Wizard (Only for Owners)
 if (isOnboardingPage && userRole !== "owner") {
 return NextResponse.redirect(new URL(getDestinationForRole(userRole), request.url));
 }
 }

 return response;
 } catch (err) {
 console.error("Middleware caught runtime exception:", err);
 return NextResponse.next();
 }
}

export const config = {
 matcher: [
 "/",
 "/login",
 "/signup",
 "/onboarding",
 "/dashboard/:path*",
 "/tenant/:path*",
 "/super-admin/:path*",
 ],
};
