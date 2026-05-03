import { test, expect } from '@playwright/test';
import * as LandingPage from '@pages/landing-page';
import { ZIP, ZIP_ERROR } from '../data/test-data';
import ENV from '@utils/env';


// Invalid ZIP code cases
const INVALID_ZIP_CASES = [
  { description: 'empty submission',              zip: '',             error: ZIP_ERROR.empty   },
  { description: 'fewer than 5 digits',           zip: ZIP.tooShort,   error: ZIP_ERROR.invalid },
  { description: 'more than 5 digits',            zip: ZIP.tooLong,    error: ZIP_ERROR.invalid },
  { description: 'non-numeric characters',        zip: ZIP.alphabetic, error: ZIP_ERROR.invalid },
  { description: 'all-zeros (not a real US ZIP)', zip: ZIP.allZeros,   error: ZIP_ERROR.invalid },
];

test.describe('ZIP code validation', { tag: ['@zip-validation'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENV.BASE_URL);
  });

  for (const { description, zip, error } of INVALID_ZIP_CASES) {
    test(`Verify that ${description} shows a validation error and keeps the form on step 1`, async ({ page }) => {
      // Enter the ZIP code and submit the form
      if (zip) await LandingPage.fillZipCode(page, zip);
      await LandingPage.submitStep(page, 1);

      // Verify that the error message is visible and has the correct text
      await expect(LandingPage.getStepErrorMsg(page, 1)).toBeVisible();
      await expect(LandingPage.getStepErrorMsg(page, 1)).toHaveText(error);

      // Verify that the form does not advance to step 2
      await expect(LandingPage.getStepContainer(page, 2)).not.toBeVisible();
    });
  }
});
