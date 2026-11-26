// @ts-check
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

/**
 * Reads key=value pairs from .env.local without logging secrets.
 */
function loadLocalEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  const result = {};
  if (!fs.existsSync(envPath)) return result;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

const DESTRUCTIVE_OR_SKIP_RE =
  /\b(delete|trash|remove|wipe|vacate|checkout|suspend|deactivate|reject|reset password|sign out|log out|logout|exit setup|back to super admin|confirm delete|confirm suspend|confirm free up|yes, vacate|approve|collect|refund|submit|create pg|assign bed|import .* now|save|reset default|upload|generate|onboard & create|whatsapp|wa\.me|tel:|mailto:|export sql|run query)\b/i;

const MODAL_CLOSE_RE = /^(close|cancel|done|ok|got it|×|x)$/i;

test.describe("Shuny Stays Full PWA Monkey & Error Crawler", () => {
  /** @type {{ email: string, password: string, ephemeralUserId: string | null, samplePgSlug: string | null, sampleTenantId: string | null }} */
  let authCtx = {
    email: process.env.PW_SUPERADMIN_EMAIL || "",
    password: process.env.PW_SUPERADMIN_PASSWORD || "",
    ephemeralUserId: null,
    samplePgSlug: null,
    sampleTenantId: null,
  };

  /** @type {any} */
  let adminSupabase = null;

  test.beforeAll(async () => {
    const localEnv = loadLocalEnv();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || localEnv.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || localEnv.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      try {
        const [{ data: samplePg }, { data: sampleTenant }] = await Promise.all([
          adminSupabase.from("pgs").select("slug").limit(1).maybeSingle(),
          adminSupabase.from("tenants").select("id").eq("is_active", true).limit(1).maybeSingle(),
        ]);
        authCtx.samplePgSlug = samplePg?.slug || null;
        authCtx.sampleTenantId = sampleTenant?.id || null;
      } catch {
        // ignore optional discovery
      }
    }

    if (authCtx.email && authCtx.password) return;

    if (!adminSupabase) {
      throw new Error(
        "Provide PW_SUPERADMIN_EMAIL & PW_SUPERADMIN_PASSWORD or ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY exist in .env.local."
      );
    }

    const ts = Date.now();
    const email = `qa.superadmin.${ts}@shunystays.test`;
    const password = `QaMonkey!${String(ts).slice(-6)}Aa`;

    const { data: created, error: createErr } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "super_admin",
        full_name: "QA Monkey Superadmin",
        phone: "9999900099",
        email_verified: true,
      },
    });

    if (createErr || !created?.user?.id) {
      throw new Error(`Failed to provision temporary QA superadmin: ${createErr?.message}`);
    }

    authCtx.email = email;
    authCtx.password = password;
    authCtx.ephemeralUserId = created.user.id;

    await adminSupabase.from("profiles").upsert({
      id: created.user.id,
      full_name: "QA Monkey Superadmin",
      email,
      phone: "9999900099",
      role: "super_admin",
      pg_id: null,
      updated_at: new Date().toISOString(),
    });
  });

  test.afterAll(async () => {
    if (adminSupabase && authCtx.ephemeralUserId) {
      try {
        await adminSupabase.from("profiles").delete().eq("id", authCtx.ephemeralUserId);
        await adminSupabase.auth.admin.deleteUser(authCtx.ephemeralUserId);
      } catch (cleanupErr) {
        console.warn("Cleanup warning for ephemeral QA superadmin:", cleanupErr);
      }
    }
  });

  test("Crawl entire PWA as Superadmin & detect all runtime, console, blank screen & HTTP >= 400 bugs", async ({
    page,
    baseURL,
  }) => {
    const resolvedBaseUrl = baseURL || "http://localhost:3000";
    let currentAction = "Initial Load";

    /** @type {Array<{ context: string, url: string, message: string, stack?: string }>} */
    const pageErrors = [];
    /** @type {Array<{ context: string, url: string, text: string, location?: string }>} */
    const consoleErrors = [];
    /** @type {Array<{ context: string, pageUrl: string, status: number, statusText: string, method: string, resourceType: string, responseUrl: string }>} */
    const badResponses = [];
    /** @type {Array<{ context: string, pageUrl: string, method: string, resourceType: string, requestUrl: string, errorText: string }>} */
    const failedRequests = [];
    /** @type {Array<{ context: string, url: string, reason: string, sampleText: string }>} */
    const blankOrCrashScreens = [];

    const visitedRoutes = new Set();
    const clickedControls = [];

    page.on("pageerror", (err) => {
      pageErrors.push({
        context: currentAction,
        url: page.url(),
        message: err?.message || String(err),
        stack: err?.stack ? String(err.stack).split("\n").slice(0, 6).join(" | ") : undefined,
      });
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        const loc = msg.location();
        consoleErrors.push({
          context: currentAction,
          url: page.url(),
          text,
          location: loc?.url ? `${loc.url}:${loc.lineNumber}` : undefined,
        });
      }
    });

    page.on("response", (res) => {
      const status = res.status();
      if (status >= 400) {
        const req = res.request();
        badResponses.push({
          context: currentAction,
          pageUrl: page.url(),
          status,
          statusText: res.statusText(),
          method: req.method(),
          resourceType: req.resourceType(),
          responseUrl: res.url(),
        });
      }
    });

    page.on("requestfailed", (req) => {
      const errorText = req.failure()?.errorText || "unknown";
      // Ignore Chromium abort noise caused strictly by rapid route transitions
      if (errorText === "net::ERR_ABORTED") return;
      failedRequests.push({
        context: currentAction,
        pageUrl: page.url(),
        method: req.method(),
        resourceType: req.resourceType(),
        requestUrl: req.url(),
        errorText,
      });
    });

    /**
     * Checks rendered page is neither blank nor showing a Next.js / React crash overlay.
     */
    async function verifyHealthyScreen(label, settleMs = 120) {
      await page.waitForLoadState("domcontentloaded");
      if (settleMs > 0) await page.waitForTimeout(settleMs);

      const check = await page.evaluate(() => {
        const body = document.body;
        if (!body) {
          return { ok: false, reason: "Missing document.body", sampleText: "" };
        }
        const text = (body.innerText || "").replace(/\s+/g, " ").trim();
        const rect = body.getBoundingClientRect();

        if (text.length < 20) {
          return { ok: false, reason: "Blank or near-empty screen", sampleText: text };
        }
        if (rect.height < 50) {
          return { ok: false, reason: `Collapsed body height (${rect.height}px)`, sampleText: text.slice(0, 120) };
        }

        const crashSignatures = [
          "Application error: a client-side exception has occurred",
          "Unhandled Runtime Error",
          "This page could not be found",
          "NEXT_HTTP_ERROR_FALLBACK;404",
          "__next_error__",
        ];
        for (const sig of crashSignatures) {
          if (text.includes(sig)) {
            return {
              ok: false,
              reason: `Detected error UI signature: ${sig}`,
              sampleText: text.slice(0, 220),
            };
          }
        }
        return { ok: true, reason: "", sampleText: text.slice(0, 120) };
      });

      if (!check.ok) {
        blankOrCrashScreens.push({
          context: label,
          url: page.url(),
          reason: check.reason,
          sampleText: check.sampleText,
        });
      }
    }

    /**
     * Dismisses any currently open modal/drawer safely.
     */
    async function closeAnyModal() {
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(80);

      const closeBtns = page.locator(
        'div.fixed button, [role="dialog"] button'
      );
      const count = await closeBtns.count().catch(() => 0);
      for (let i = 0; i < Math.min(count, 8); i++) {
        const btn = closeBtns.nth(i);
        const visible = await btn.isVisible().catch(() => false);
        if (!visible) continue;
        const txt = ((await btn.innerText().catch(() => "")) || "").trim();
        const aria = ((await btn.getAttribute("aria-label").catch(() => "")) || "").trim();
        const title = ((await btn.getAttribute("title").catch(() => "")) || "").trim();
        if (
          MODAL_CLOSE_RE.test(txt) ||
          /close|cancel|dismiss/i.test(`${aria} ${title}`)
        ) {
          await btn.click({ timeout: 2000 }).catch(() => {});
          await page.waitForTimeout(80);
          break;
        }
      }
    }

    /**
     * Safely clicks visible non-destructive tabs, filters, details triggers & modals on current screen.
     */
    async function monkeyInteractCurrentScreen(scopeLabel, maxClicks = 6) {
      const originUrl = page.url();
      const candidates = await page.evaluate(
        ({ maxCount }) => {
          const skipRe =
            /\b(delete|trash|remove|wipe|vacate|checkout|suspend|deactivate|reject|reset password|sign out|log out|logout|exit setup|back to super admin|confirm delete|confirm suspend|confirm free up|yes, vacate|approve|collect|refund|submit|create pg|assign bed|import .* now|save|reset default|upload|generate|onboard & create|whatsapp|wa\.me|tel:|mailto:|export sql|run query|setup pg)\b/i;

          const els = Array.from(document.querySelectorAll('[role="tab"], main button'));
          const seen = new Set();
          const chosen = [];

          for (const el of els) {
            if (chosen.length >= maxCount) break;
            if (!(el instanceof HTMLElement)) continue;
            if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") continue;
            const typeAttr = el.getAttribute("type") || "";
            if (typeAttr === "submit" || typeAttr === "file") continue;

            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              rect.width === 0 ||
              rect.height === 0
            ) {
              continue;
            }

            const txt = (el.innerText || "").replace(/\s+/g, " ").trim();
            const aria = (el.getAttribute("aria-label") || "").trim();
            const title = (el.getAttribute("title") || "").trim();
            const label = `${txt} ${aria} ${title}`.trim();
            if (!label || skipRe.test(label)) continue;

            const key = label.slice(0, 50);
            if (seen.has(key)) continue;
            seen.add(key);

            const token = `monkey-${chosen.length}-${Date.now()}`;
            el.setAttribute("data-monkey-id", token);
            chosen.push({ token, label: label.slice(0, 45) });
          }
          return chosen;
        },
        { maxCount: maxClicks }
      );

      for (const item of candidates) {
        const el = page.locator(`[data-monkey-id="${item.token}"]`).first();
        if ((await el.count()) === 0) continue;
        if (!(await el.isVisible().catch(() => false))) continue;

        currentAction = `[${scopeLabel}] Click "${item.label}"`;
        clickedControls.push(currentAction);

        await el.click({ timeout: 2500 }).catch(() => {});
        await verifyHealthyScreen(currentAction, 80);

        const openModalCount = await page.locator("div.fixed.inset-0, [role='dialog']").count().catch(() => 0);
        if (openModalCount > 0) {
          await closeAnyModal();
        }

        if (page.url() !== originUrl && !page.url().startsWith(originUrl.split("?")[0])) {
          await page.goto(originUrl, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(120);
        }
      }
    }

    async function visitRoute(routePath, label) {
      const targetUrl = routePath.startsWith("http")
        ? routePath
        : `${resolvedBaseUrl}${routePath}`;
      currentAction = `Navigate ${label} (${routePath})`;
      console.log(`[MONKEY] -> ${currentAction}`);
      visitedRoutes.add(routePath);
      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("load", { timeout: 8000 }).catch(() => {});
      await verifyHealthyScreen(currentAction, 250);
    }

    // =========================================================================
    // STEP 1: OPEN LOGIN & SIGN IN AS SUPERADMIN
    // =========================================================================
    try {
      await visitRoute("/login", "Login Page");
      await page.fill('input[name="username"]', authCtx.email);
      await page.fill('input[name="password"]', authCtx.password);

      currentAction = "Submit Superadmin Sign In";
      console.log(`[MONKEY] -> ${currentAction}`);
      await Promise.all([
        page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 25_000 }),
        page.click('button[type="submit"]'),
      ]);

      await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
      await verifyHealthyScreen("Post-Login Landing (/super-admin)");
      expect(page.url()).toContain("/super-admin");

    // =========================================================================
    // PHASE 1: SUPER ADMIN SIDEBAR, TOPBAR, TABS & DEDICATED PAGES
    // =========================================================================
    // Collect & click all sidebar nav links dynamically
    const sidebarHrefs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("aside a[href]"));
      return links
        .map((a) => ({
          href: a.getAttribute("href") || "",
          label: (a.textContent || "").replace(/\s+/g, " ").trim(),
        }))
        .filter((x) => x.href.startsWith("/"));
    });

    for (const item of sidebarHrefs) {
      if (DESTRUCTIVE_OR_SKIP_RE.test(item.label) || DESTRUCTIVE_OR_SKIP_RE.test(item.href)) continue;
      await visitRoute(item.href, `Sidebar: ${item.label}`);
      await monkeyInteractCurrentScreen(`SuperAdmin ${item.label}`, 8);
    }

    // Also test explicit Super Admin sub-routes & tabs + Topbar notification/settings links
    const explicitSuperAdminRoutes = [
      "/super-admin?tab=overview",
      "/super-admin?tab=pgs",
      "/super-admin?tab=billing",
      "/super-admin?tab=settings",
      "/super-admin/organizations",
      "/super-admin/subscriptions",
      "/super-admin/database",
      "/super-admin/health",
      "/super-admin/settings",
    ];

    for (const route of explicitSuperAdminRoutes) {
      if (!visitedRoutes.has(route)) {
        await visitRoute(route, `Route ${route}`);
        await monkeyInteractCurrentScreen(`Route ${route}`, 7);
      }
    }

    // Test TopBar Notification Bell & KeyRound Settings icon
    await visitRoute("/super-admin", "SuperAdmin TopBar Check");
    const notifBtn = page.locator('header button[title*="Notification"]:visible, header button[aria-label*="Notification"]:visible').first();
    if ((await notifBtn.count()) > 0) {
      currentAction = "TopBar Notification Bell Toggle";
      await notifBtn.click().catch(() => {});
      await page.waitForTimeout(150);
      await verifyHealthyScreen(currentAction, 80);
      await notifBtn.click().catch(() => {});
    }

    // Verify SWITCH DEMO ROLE PERSONA is completely removed
    const demoSwitcherCount = await page.getByText(/Switch Demo Role Persona/i).count();
    if (demoSwitcherCount > 0) {
      blankOrCrashScreens.push({
        context: "TopBar Role Switcher Removal Check",
        url: page.url(),
        reason: "SWITCH DEMO ROLE PERSONA UI is still rendered!",
        sampleText: "Found forbidden demo role switcher",
      });
    }

    // =========================================================================
    // PHASE 2: SUPER ADMIN "SETUP PG" MODE -> CRAWL FULL OWNER PORTAL
    // =========================================================================
    await visitRoute("/super-admin?tab=pgs", "Find PG for Setup PG Flow");
    const setupPgButton = page
      .locator('button:has-text("Setup PG"):visible, a:has-text("Setup PG"):visible')
      .first();
    const hasSetupPg = (await setupPgButton.count()) > 0;

    if (hasSetupPg) {
      currentAction = "Enter Setup PG Mode (/api/super-admin/setup-pg)";
      clickedControls.push(currentAction);
      await Promise.all([
        page.waitForURL((u) => u.pathname.startsWith("/dashboard"), { timeout: 30_000 }),
        setupPgButton.click({ noWaitAfter: true }),
      ]);
      await page.waitForLoadState("load", { timeout: 15_000 }).catch(() => {});
      await verifyHealthyScreen("Setup PG Dashboard Entry");

      // Collect Owner Dashboard sidebar hrefs dynamically
      const ownerSidebarHrefs = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("aside a[href]"));
        return links
          .map((a) => ({
            href: a.getAttribute("href") || "",
            label: (a.textContent || "").replace(/\s+/g, " ").trim(),
          }))
          .filter((x) => x.href.startsWith("/dashboard"));
      });

      for (const item of ownerSidebarHrefs) {
        await visitRoute(item.href, `Owner Sidebar: ${item.label}`);
        await monkeyInteractCurrentScreen(`Owner ${item.label}`, 8);
      }

      const extraDashboardRoutes = [
        "/dashboard",
        "/dashboard/rooms",
        "/dashboard/tenants",
        "/dashboard/attendance",
        "/dashboard/meal-poll",
        "/dashboard/mess",
        "/dashboard/ledger",
        "/dashboard/finance",
        "/dashboard/passes",
        "/dashboard/complaints",
        "/dashboard/staff",
        "/dashboard/ops",
        "/dashboard/settings",
      ];

      for (const route of extraDashboardRoutes) {
        if (!visitedRoutes.has(route)) {
          await visitRoute(route, `Dashboard Route ${route}`);
          await monkeyInteractCurrentScreen(`Dashboard ${route}`, 7);
        }
      }

      // Specifically exercise Rooms filters, Bulk Modal, Walk-In Modal & BedProfileSheet safely
      await visitRoute("/dashboard/rooms", "Rooms Explorer Deep Interactive Check");
      for (const filterPattern of [
        /3 Days Left/i,
        /4–7 Days Left/i,
        /Expired/i,
        /Active/i,
        /Show All Rooms/i,
      ]) {
        const btn = page.locator("main button:visible").filter({ hasText: filterPattern }).first();
        if ((await btn.count()) > 0) {
          currentAction = `Rooms Filter Pill: ${filterPattern}`;
          await btn.click().catch(() => {});
          await verifyHealthyScreen(currentAction, 100);
        }
      }

      // Open Bulk Setup Modal if visible -> switch tabs -> close
      const bulkBtn = page.locator('main button:has-text("Bulk"):visible').first();
      if ((await bulkBtn.count()) > 0) {
        currentAction = "Open BulkSetupModal";
        await bulkBtn.click().catch(() => {});
        await verifyHealthyScreen(currentAction, 150);
        await closeAnyModal();
      }

      // Open first Occupied Bed -> inspect 3 WhatsApp presets -> open/close Edit Resident -> close
      const occupiedBedBtn = page
        .locator('main button:visible')
        .filter({ hasNotText: /\+ Walk-In|Vacant|Add|Bulk|Days Left|Expired|Active|Delete/i })
        .filter({ hasText: /Bed|Room/i })
        .first();
      if ((await occupiedBedBtn.count()) > 0) {
        currentAction = "Open Occupied Bed Profile";
        await occupiedBedBtn.click().catch(() => {});
        await page.waitForTimeout(200);
        for (const preset of ["Rent Reminder", "Welcome & Wi-Fi", "Custom Msg"]) {
          const presetBtn = page.locator(`button:has-text("${preset}"):visible`).first();
          if ((await presetBtn.count()) > 0) {
            currentAction = `BedProfile Preset: ${preset}`;
            await presetBtn.click().catch(() => {});
            await page.waitForTimeout(100);
          }
        }
        await closeAnyModal();
      }

      // Mobile Viewport Check inside Setup Mode
      await page.setViewportSize({ width: 390, height: 844 });
      for (const mRoute of ["/dashboard/rooms", "/dashboard/settings"]) {
        await visitRoute(mRoute, `Mobile Viewport ${mRoute}`);
      }

      // Exit Setup PG back to Super Admin
      await page.setViewportSize({ width: 1440, height: 900 });
      const exitBtn = page.locator('a[href="/api/super-admin/exit-setup"]:visible').first();
      if ((await exitBtn.count()) > 0) {
        currentAction = "Exit Setup PG Mode -> Back to Super Admin";
        await Promise.all([
          page.waitForURL((u) => u.pathname.startsWith("/super-admin"), { timeout: 20_000 }),
          exitBtn.click(),
        ]);
        await verifyHealthyScreen(currentAction, 150);
      } else {
        await visitRoute("/api/super-admin/exit-setup", "Force Exit Setup Mode");
      }
    }

    // =========================================================================
    // PHASE 3: MOBILE VIEWPORT CHECK + PUBLIC WHITE-LABEL / VERIFY ID CHECK
    // =========================================================================
    if (authCtx.samplePgSlug) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await visitRoute(`/pg/${authCtx.samplePgSlug}`, `Public White-Label /pg/${authCtx.samplePgSlug}`);
    }
    if (authCtx.sampleTenantId) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await visitRoute(`/verify/id/${authCtx.sampleTenantId}`, `Digital ID QR /verify/id/${authCtx.sampleTenantId}`);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    for (const mRoute of [
      "/super-admin",
      "/super-admin/organizations",
      "/super-admin/database",
      "/super-admin/health",
    ]) {
      await visitRoute(mRoute, `Mobile SuperAdmin ${mRoute}`);
    }
    } finally {
      // =======================================================================
      // ALWAYS COMPILE & WRITE BUG REPORT EVEN IF AN INTERMEDIATE STEP FAILS
      // =======================================================================
      const report = {
        timestamp: new Date().toISOString(),
        baseUrl: resolvedBaseUrl,
        lastAction: currentAction,
        summary: {
          visitedRoutesCount: visitedRoutes.size,
          clickedControlsCount: clickedControls.length,
          pageErrorsCount: pageErrors.length,
          consoleErrorsCount: consoleErrors.length,
          badResponsesCount: badResponses.length,
          failedRequestsCount: failedRequests.length,
          blankOrCrashScreensCount: blankOrCrashScreens.length,
        },
        visitedRoutes: Array.from(visitedRoutes),
        pageErrors,
        consoleErrors,
        badResponses,
        failedRequests,
        blankOrCrashScreens,
      };

      const outDir = path.resolve(__dirname, "..", "test-results");
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(
        path.join(outDir, "monkey-bug-report.json"),
        JSON.stringify(report, null, 2),
        "utf8"
      );

      console.log("\n================ MONKEY TEST BUG REPORT ================");
      console.log(JSON.stringify(report, null, 2));
      console.log("========================================================\n");
    }

    const totalBugs =
      pageErrors.length +
      consoleErrors.length +
      badResponses.length +
      failedRequests.length +
      blankOrCrashScreens.length;

    expect(
      totalBugs,
      `Detected ${totalBugs} bug(s): ${pageErrors.length} pageErrors, ${consoleErrors.length} consoleErrors, ${badResponses.length} HTTP>=400 responses, ${failedRequests.length} failedRequests, ${blankOrCrashScreens.length} blank/crash screens. See test-results/monkey-bug-report.json`
    ).toBe(0);
  });
});
