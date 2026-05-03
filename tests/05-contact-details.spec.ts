import { test, expect } from '@playwright/test';
import * as LandingPage from '@pages/landing-page';
import { ZIP, USER, NAME_ERROR, EMAIL_VALIDATION_MESSAGE, INTEREST_OPTIONS, PROPERTY_OPTIONS } from '../data/test-data';
import ENV from '@utils/env';

// Invalid name cases
const INVALID_NAME_CASES = [
  { description: 'empty name',              name: '',                    error: NAME_ERROR.empty        },
  { description: 'single-word name',        name: USER.nameSingleWord,   error: NAME_ERROR.singleWord   },
  { description: 'name with invalid chars', name: USER.nameInvalidChars, error: NAME_ERROR.invalidChars },
  { description: 'name exceeding 40 chars', name: USER.nameTooLong,      error: NAME_ERROR.tooLong      },
] as const;

// Invalid email cases that trigger validity.valueMissing and validity.typeMismatch
const INVALID_EMAIL_CASES = [
  { description: 'empty email',                email: '',                      messageKey: 'empty',            valueMissing: true,  typeMismatch: false },
  { description: 'email without @',            email: USER.invalidEmail,       messageKey: 'missingAt',        valueMissing: false, typeMismatch: true  },
  { description: 'email with @ but no domain', email: USER.emailMissingDomain, messageKey: 'incompleteDomain', valueMissing: false, typeMismatch: true  },
] as const;

test.describe('Contact details step validation', { tag: ['@contact-details'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENV.BASE_URL);

    // Complete the form up to step 4
    await LandingPage.completeZipStep(page, ZIP.serviceArea);
    await LandingPage.completeInterestStep(page, INTEREST_OPTIONS[0]);
    await LandingPage.completePropertyStep(page, PROPERTY_OPTIONS[0]);
  });

  // ── Name validation ───────────────────────────────────────────────────────

  for (const { description, name, error } of INVALID_NAME_CASES) {
    test(`Verify that ${description} shows a validation error and keeps the form on step 4`, async ({ page }) => {
      // Enter an invalid name and email
      if (name) await LandingPage.fillName(page, name);
      await LandingPage.fillEmail(page, USER.email);
      await LandingPage.submitStep(page, 4);

      // Verify that the form stays on step 4 and does not redirect to step 5
      await expect(LandingPage.getStepContainer(page, 4)).toBeVisible();
      await expect(LandingPage.getStepContainer(page, 5)).not.toBeVisible();

      // Verify that the name error message is displayed and contains the expected text
      await expect(LandingPage.getNameErrorMsg(page)).toBeVisible();
      await expect(LandingPage.getNameErrorMsg(page)).toHaveText(error);
    });
  }

  // ── Email validation ──────────────────────────────────────────────────────

  for (const { description, email, messageKey, valueMissing, typeMismatch } of INVALID_EMAIL_CASES) {
    test(`Verify that ${description} blocks submission and keeps the form on step 4`, async ({ page, browserName }) => {
      // Enter a valid name and an invalid email
      await LandingPage.fillName(page, USER.name);
      if (email) await LandingPage.fillEmail(page, email);
      await LandingPage.submitStep(page, 4);

      // Verify that the form stays on step 4 and does not redirect to step 5
      await expect(LandingPage.getStepContainer(page, 4)).toBeVisible();
      await expect(LandingPage.getStepContainer(page, 5)).not.toBeVisible();

      // Verify that the email input is invalid and does not have a type mismatch
      const validity = await LandingPage.getEmailValidityReason(page);
      expect(validity.valueMissing).toBe(valueMissing);
      expect(validity.typeMismatch).toBe(typeMismatch);

      // Verify that the email validation message is displayed and contains the expected text
      const message = await LandingPage.getEmailValidationMessage(page);
      const expected = EMAIL_VALIDATION_MESSAGE[browserName as keyof typeof EMAIL_VALIDATION_MESSAGE];
      expect(message).toContain(expected[messageKey]);
    });
  }
});
