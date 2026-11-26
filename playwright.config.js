// @ts-check
const { defineConfig } = require("@playwright/test");

const baseURL = process.env.PW_BASE_URL || "http://localhost:3000";
const isLocal = !process.env.PW_BASE_URL;

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 600_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 10_000,
    navigationTimeout: 25_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  ...(isLocal
    ? {
        webServer: {
          command: "npm run start",
          url: "http://localhost:3000/login",
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }
    : {}),
});
