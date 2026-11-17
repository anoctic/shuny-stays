import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  let userRole: "super_admin" | "owner" | "admin" | "tenant" | null = null;
  let hasSession = false;

  // Check demo cookie override first
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
        // In user metadata or query profile
        userRole = (user.user_metadata?.role as "super_admin" | "owner" | "admin" | "tenant") || "tenant";
      }
    } catch {
      // Ignore network errors in middleware
    }
  }

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isRootPage = pathname === "/";
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isSuperAdminPage = pathname.startsWith("/super-admin");
  const isTenantPage = pathname.startsWith("/tenant");
  const isOnboardingPage = pathname.startsWith("/onboarding");

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
