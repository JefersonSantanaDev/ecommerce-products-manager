import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { slowMo: 600 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run api:mock:e2e',
      url: 'http://127.0.0.1:3000/products',
      timeout: 60_000,
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: 'npm run start -- --host 127.0.0.1 --port 4200',
      url: 'http://127.0.0.1:4200',
      timeout: 120_000,
      reuseExistingServer: !process.env['CI'],
    },
  ],
});
