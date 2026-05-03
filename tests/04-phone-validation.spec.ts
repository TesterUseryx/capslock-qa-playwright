import { test, expect } from '@playwright/test';
import * as LandingPage from '@pages/landing-page';
import { ZIP, PHONE, PHONE_ERROR, USER, THANK_YOU_PATH, INTEREST_OPTIONS, PROPERTY_OPTIONS } from '../data/test-data';
import ENV from '@utils/env';

// Invalid phone number cases
const INVALID_PHONE_CASES = [
  { description: 'empty phone number',              phone: '',             error: PHONE_ERROR.empty   },
  { description: 'phone with fewer than 10 digits', phone: PHONE.tooShort, error: PHONE_ERROR.invalid },
  { description: 'all-zeros phone (0000000000)',     phone: PHONE.allZeros, error: PHONE_ERROR.invalid },
] as const;

test.describe('Phone number validation', { tag: ['@phone-validation'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENV.BASE_URL);

    // Complete the form up to step 5
    await LandingPage.completeZipStep(page, ZIP.serviceArea);
    await LandingPage.completeInterestStep(page, INTEREST_OPTIONS[0]);
    await LandingPage.completePropertyStep(page, PROPERTY_OPTIONS[0]);
    await LandingPage.completeContactStep(page, USER.name, USER.email);
  });

  for (const { description, phone, error } of INVALID_PHONE_CASES) {
    test(`Verify that ${description} shows a validation error and does not redirect`, async ({ page }) => {
      // Enter the phone number and submit the form
      if (phone) await LandingPage.fillPhone(page, phone);
      await LandingPage.submitStep(page, 5);

      // Verify that the error message is visible and has the correct text
      await expect(LandingPage.getPhoneErrorMsg(page)).toBeVisible();
      await expect(LandingPage.getPhoneErrorMsg(page)).toHaveText(error);

      // Verify that the form does not redirect to the Thank You page
      await expect(page).not.toHaveURL(new RegExp(THANK_YOU_PATH));
    });
  }

  test('Verify that the input mask limits phone entry to 10 digits', async ({ page }) => {
    // Enter the phone number and submit the form
    await LandingPage.getPhoneInput(page).fill(PHONE.tooLong);

    // Get the stored digits
    const value = await LandingPage.getPhoneInput(page).inputValue();

    // Verify that the stored digits are equal to the first 10 typed
    expect(value.replace(/\D/g, '')).toBe(PHONE.tooLong.slice(0, 10));
  });
});
