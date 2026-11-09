import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'chromium-mobile', use: { viewport: { width: 320, height: 800 } } },
    { name: 'chromium-tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'chromium-wide', use: { viewport: { width: 1920, height: 1080 } } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
})
