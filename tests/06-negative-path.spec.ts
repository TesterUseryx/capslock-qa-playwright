import { test, expect } from '@playwright/test';
import * as LandingPage from '@pages/landing-page';
import { ZIP, USER, INTEREST_OPTIONS, PROPERTY_OPTIONS } from '../data/test-data';
import ENV from '@utils/env';

test.describe('Negative path – step validation and recovery', { tag: ['@negative-path'] }, () => {
  test('Verify that all fields in the form are required and block progression when left empty', async ({ page }) => {
    await page.goto(ENV.BASE_URL);

    // Try to submit without a ZIP; verify error; fill valid ZIP; proceed
    await LandingPage.submitStep(page, 1);
    await expect(LandingPage.getStepErrorMsg(page, 1)).toBeVisible();
    await LandingPage.fillZipCode(page, ZIP.serviceArea);
    await LandingPage.submitStep(page, 1);
    await expect(LandingPage.getStepContainer(page, 2)).toBeVisible();

    // Try to submit without any selection; verify error; select an option; proceed
    await LandingPage.submitStep(page, 2);
    // DEFECT: no validation - form advances to step 3 without requiring a selection
    await expect.soft(LandingPage.getStepErrorMsg(page, 2)).toBeVisible({ timeout: 2000 });
    if (await LandingPage.getStepContainer(page, 2).isVisible()) {
      // only reached when the defect is fixed
      await LandingPage.selectInterest(page, INTEREST_OPTIONS[0]);
      await LandingPage.submitStep(page, 2);
    }
    await expect(LandingPage.getStepContainer(page, 3)).toBeVisible();

    // Radio buttons with no separate error block - select one and proceed
    await LandingPage.selectProperty(page, PROPERTY_OPTIONS[0]);
    await LandingPage.submitStep(page, 3);
    await expect(LandingPage.getStepContainer(page, 4)).toBeVisible();

    // Pre-fill email so HTML5 email validation does not fire before the name check
    await LandingPage.fillEmail(page, USER.email);
    await LandingPage.submitStep(page, 4);
    await expect(LandingPage.getNameErrorMsg(page)).toBeVisible();
    await LandingPage.fillName(page, USER.name);

    // Clear the email field; verify HTML5 marks it as missing; fill valid email; proceed
    await LandingPage.fillEmail(page, '');
    await LandingPage.submitStep(page, 4);
    const validity = await LandingPage.getEmailValidityReason(page);
    expect(validity.valueMissing).toBe(true);
    await LandingPage.fillEmail(page, USER.email);
    await LandingPage.submitStep(page, 4);
    await expect(LandingPage.getStepContainer(page, 5)).toBeVisible();

    // Try to submit without a phone number; verify error
    await LandingPage.submitStep(page, 5);
    await expect(LandingPage.getPhoneErrorMsg(page)).toBeVisible();
  });
});
