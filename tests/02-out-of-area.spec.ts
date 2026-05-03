import { test, expect } from '@playwright/test';
import * as LandingPage from '@pages/landing-page';
import { ZIP, USER, EMAIL_VALIDATION_MESSAGE } from '../data/test-data';
import ENV from '@utils/env';

// Invalid email cases that trigger validity.valueMissing and validity.typeMismatch
const INVALID_OUT_OF_AREA_EMAIL_CASES = [
  { description: 'empty email',                email: '',                      messageKey: 'empty',            valueMissing: true,  typeMismatch: false },
  { description: 'email without @',            email: USER.invalidEmail,       messageKey: 'missingAt',        valueMissing: false, typeMismatch: true  },
  { description: 'email with @ but no domain', email: USER.emailMissingDomain, messageKey: 'incompleteDomain', valueMissing: false, typeMismatch: true  },
  { description: 'email without TLD',          email: USER.emailNoTld,         messageKey: 'missingAt',        valueMissing: false, typeMismatch: true  },
] as const;

test.describe('Out-of-area ZIP code flow', { tag: ['@out-of-area'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENV.BASE_URL);

    // Fill out the zip code and submit the form
    await LandingPage.fillZipCode(page, ZIP.outOfArea);
    await LandingPage.submitStep(page, 1);
    await expect(LandingPage.getOutOfAreaStep(page)).toBeVisible();
  });

  test('Verify that out-of-area message is shown, email notification can be submitted, and confirmation is displayed', async ({
    page,
  }) => {
    // The "Sorry" message and email input are displayed
    await expect(LandingPage.getOutOfAreaMessage(page)).toBeVisible();
    await expect(LandingPage.getOutOfAreaMessage(page)).toContainText(
      /unfortunately we don.t yet install in your area/,
    );
    await expect(LandingPage.getOutOfAreaEmailInput(page)).toBeVisible();

    // Submit email – confirmation message replaces the sorry message
    await LandingPage.fillOutOfAreaEmail(page, USER.email);
    await LandingPage.submitOutOfAreaForm(page);
    await expect(LandingPage.getOutOfAreaConfirmation(page)).toBeVisible();
    await expect(LandingPage.getOutOfAreaConfirmation(page)).toContainText(
      'we will contact you when our service becomes available',
    );
  });

  test('Verify that the progress indicator shows the correct step count on the out-of-area email step', async ({ page }) => {
    // Verify that the progress indicator shows the correct step count
    await expect(LandingPage.getProgressCurrentStep(page)).toHaveText('2');
  });
});

test.describe('Out-of-area email field validation', { tag: ['@out-of-area', '@email-validation'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENV.BASE_URL);

    // Fill out the zip code and submit the form
    await LandingPage.fillZipCode(page, ZIP.outOfArea);
    await LandingPage.submitStep(page, 1);
    await expect(LandingPage.getOutOfAreaStep(page)).toBeVisible();
  });

  for (const { description, email, messageKey, valueMissing, typeMismatch } of INVALID_OUT_OF_AREA_EMAIL_CASES) {
    test(`Verify that ${description} blocks submission via HTML5 validation`, async ({ page, browserName }) => {
      // Enter an invalid email and submit the form 
      if (email) await LandingPage.fillOutOfAreaEmail(page, email);
      await LandingPage.submitOutOfAreaForm(page);

      // Verify that the email input is invalid and does not have a type mismatch
      const validity = await LandingPage.getOutOfAreaEmailValidityReason(page);
      expect(validity.valueMissing).toBe(valueMissing);
      expect(validity.typeMismatch).toBe(typeMismatch);

      // Verify that the email validation message is displayed and contains the expected text
      const message = await LandingPage.getOutOfAreaEmailValidationMessage(page);
      const expected = EMAIL_VALIDATION_MESSAGE[browserName as keyof typeof EMAIL_VALIDATION_MESSAGE];
      expect(message).toContain(expected[messageKey]);

      // Verify that the confirmation message is not displayed
      await expect(LandingPage.getOutOfAreaConfirmation(page)).not.toBeVisible();
    });
  }
});
