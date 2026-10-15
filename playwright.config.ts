import { defineConfig, devices } from '@playwright/test'

// E2E runs against its own throwaway API (port 3011, fresh DB in .e2e-data/) and its own
// Vite server (port 5183), so it never touches the dev servers on 5173/3001 or data/calendar.db.
const API_PORT = 3011
const WEB_PORT = 5183

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    testIdAttribute: 'data-test',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'rm -rf .e2e-data && mkdir -p .e2e-data && node server/index.ts',
      env: { PORT: String(API_PORT), DB: '.e2e-data/calendar.db' },
      url: `http://localhost:${API_PORT}/api/events`,
      reuseExistingServer: false,
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      env: { API_PORT: String(API_PORT) },
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
    },
  ],
})
