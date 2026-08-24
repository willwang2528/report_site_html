import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/ui",
  outputDir: "./test-results/playwright",
  reporter: "line",
  timeout: 30_000,
  workers: 1,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "npm exec -- vinext dev --hostname 127.0.0.1 --port 4173",
    reuseExistingServer: true,
    timeout: 120_000,
    url: `${baseURL}/research-mobile/popup/cookieverse`,
  },
});
