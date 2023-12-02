import { PlaywrightTestConfig, devices } from "@playwright/test";
import path from "path";

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;
const projects = [
  {
    name: "Desktop Chrome",
    use: {
      ...devices["Desktop Chrome"],
    },
  },
  {
    name: "Mobile Chrome",
    use: {
      ...devices["Pixel 5"],
    },
  },
];

if (!process.env.SKIP_MACOS)
  projects.push({ name: "Mobile Safari", use: devices["iPhone 12"] });

const config: PlaywrightTestConfig = {
  timeout: 30 * 1000,
  testDir: path.join(__dirname, "src/tests/e2e"),
  retries: 0,
  outputDir: "test-results/",
  webServer: {
    command: "npm run dev",
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL,
    trace: "retry-with-trace",
  },
  projects,
};

export default config;
