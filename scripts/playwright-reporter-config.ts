import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    [
      '@estruyf/github-actions-reporter',
      { showError: true },
    ],
  ],
});
