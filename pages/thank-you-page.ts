import { type Page } from '@playwright/test';

// ─── ELEMENTS ────────────────────────────────────────────────────────────────

const heading = (page: Page) => page.getByRole('heading', { name: 'Thank you!', exact: true });

// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

export function getHeading(page: Page) {
  return heading(page);
}

export function getUrl(page: Page): string {
  return page.url();
}
