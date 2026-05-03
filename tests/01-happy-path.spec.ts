import { test, expect } from '@playwright/test';
import * as LandingPage from '@pages/landing-page';
import * as ThankYouPage from '@pages/thank-you-page';
import { ZIP, PHONE, USER, THANK_YOU_PATH, INTEREST_OPTIONS, PROPERTY_OPTIONS } from '../data/test-data';
import ENV from '@utils/env';

test.describe('Happy path – full form submission', { tag: ['@happy-path'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENV.BASE_URL);
  });

  test('Completes the walk-in bath quote form with valid data and redirects to the Thank You page', async ({
    page,
  }) => {
    // Step 1 – enter service-area ZIP and advance to step 2
    await LandingPage.fillZipCode(page, ZIP.serviceArea);
    await LandingPage.submitStep(page, 1);
    await expect(LandingPage.getStepContainer(page, 2)).toBeVisible();
    // DEFECT: step counter shows wrong number on step 3 (see README)
    await expect(LandingPage.getProgressCurrentStep(page)).toHaveText('2');

    // Step 2 – all interest options rendered; select one and confirm it is checked
    for (const option of INTEREST_OPTIONS) {
      await expect(LandingPage.getInterestOption(page, option)).toBeVisible();
    }
    await LandingPage.selectInterest(page, INTEREST_OPTIONS[0]);
    await expect(LandingPage.getInterestCheckbox(page, INTEREST_OPTIONS[0])).toBeChecked();
    await LandingPage.submitStep(page, 2);
    await expect(LandingPage.getStepContainer(page, 3)).toBeVisible();
    // DEFECT: step counter should read '3' here but currently shows '2'
    await expect(LandingPage.getProgressCurrentStep(page)).toHaveText('3');

    // Step 3 – all property options rendered; select one and confirm it is checked
    for (const option of PROPERTY_OPTIONS) {
      await expect(LandingPage.getPropertyOption(page, option)).toBeVisible();
    }
    await LandingPage.selectProperty(page, PROPERTY_OPTIONS[0]);
    await expect(LandingPage.getPropertyRadio(page, PROPERTY_OPTIONS[0])).toBeChecked();
    await LandingPage.submitStep(page, 3);
    await expect(LandingPage.getStepContainer(page, 4)).toBeVisible();
    await expect(LandingPage.getProgressCurrentStep(page)).toHaveText('4');

    // Step 4 – fill name and email, advance to phone step
    await LandingPage.fillName(page, USER.name);
    await LandingPage.fillEmail(page, USER.email);
    await LandingPage.submitStep(page, 4);
    await expect(LandingPage.getStepContainer(page, 5)).toBeVisible();
    await expect(LandingPage.getProgressCurrentStep(page)).toHaveText('5');

    // Step 5 – submit phone number and expect redirect to Thank You page
    await LandingPage.fillPhone(page, PHONE.valid);
    await LandingPage.submitStep(page, 5);

    // Thank You page – URL and heading confirm successful submission
    await expect(page).toHaveURL(new RegExp(THANK_YOU_PATH));
    await expect(ThankYouPage.getHeading(page)).toBeVisible();
  });
});
