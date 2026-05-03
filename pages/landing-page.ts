import { type Page } from '@playwright/test';
import { type InterestOption, type PropertyOption } from '../data/test-data';

const FORM = '#form-container-1';

// ─── ELEMENTS ────────────────────────────────────────────────────────────────

// Next/Submit button - shared across all steps via data-tracking="btn-step-N"
const nextBtn = (page: Page, step: number) => page.locator(`${FORM} [data-tracking="btn-step-${step}"]`);

// Error message - shared across steps 1-4 via .step-N [data-error-block]
const stepErrorMsg = (page: Page, step: number) => page.locator(`${FORM} .step-${step} [data-error-block]`);

// Step 1 - ZIP code
const zipInput = (page: Page) => page.locator(`${FORM} [data-zip-code-input]`);

// Step 2 - Why interested (multi-select checkboxes)
const interestLabel = (page: Page, option: InterestOption) => page.locator(`${FORM} label[for="why-interested-${option}-1"]`);
const interestCheckbox = (page: Page, option: InterestOption) => page.locator(`${FORM} #why-interested-${option}-1`);

// Step 3 - Property type (radio buttons)
const propertyLabel = (page: Page, type: PropertyOption) => page.locator(`${FORM} label[for="homeowner-${type}-1"]`);
const propertyRadio = (page: Page, type: PropertyOption) => page.locator(`${FORM} #homeowner-${type}-1`);

// Step 4 - Name & Email (scoped to .step-4 to avoid matching the sorry-form's input[name="email"])
const nameInput = (page: Page) => page.locator(`${FORM} .step-4 [data-name-input]`);
const emailInput = (page: Page) => page.locator(`${FORM} .step-4 input[name="email"]`);
const nameErrorMsg = (page: Page) => page.locator(`${FORM} .step-4 .col-12:has([data-name-input]) > [data-error-block]`);

// Step 5 - Phone
const phoneInput = (page: Page) => page.locator(`${FORM} [data-phone-input]`);
const phoneErrorMsg = (page: Page) => page.locator(`${FORM} [data-phone-step] [data-error-block]`);
export const getPhoneInput = (page: Page) => phoneInput(page);

// Out-of-area step
const outOfAreaStep = (page: Page) => page.locator(`${FORM} [data-sorry-step]`);
const outOfAreaMessage = (page: Page) => page.locator(`${FORM} [data-sorry-fade-out]`);
const outOfAreaEmailInput = (page: Page) => page.locator(`${FORM} [data-sorry-step] [data-email-input]`);
const outOfAreaSubmitBtn = (page: Page) => page.locator(`${FORM} [data-sorry-step] button[type="submit"]`);
const outOfAreaConfirmation = (page: Page) => page.locator(`${FORM} [data-sorry-fade-in]`);

// Step containers (for visibility checks)
const stepContainer = (page: Page, n: number) => page.locator(`${FORM} .step-${n}`);

// Progress indicator
const progressCurrentStep = (page: Page) => page.locator(`${FORM} [data-form-progress-current-step]`);

// ─── STEP 1 ACTIONS ──────────────────────────────────────────────────────────

export async function fillZipCode(page: Page, zip: string): Promise<void> {
  await zipInput(page).fill(zip);
}

export async function submitStep(page: Page, step: number): Promise<void> {
  await nextBtn(page, step).click();
}

// ─── STEP 2 ACTIONS ──────────────────────────────────────────────────────────

export function getInterestOption(page: Page, option: InterestOption) {
  return interestLabel(page, option);
}

export function getInterestCheckbox(page: Page, option: InterestOption) {
  return interestCheckbox(page, option);
}

export async function selectInterest(page: Page, option: InterestOption): Promise<void> {
  await interestLabel(page, option).click();
}

// ─── STEP 3 ACTIONS ──────────────────────────────────────────────────────────

export function getPropertyOption(page: Page, type: PropertyOption) {
  return propertyLabel(page, type);
}

export function getPropertyRadio(page: Page, type: PropertyOption) {
  return propertyRadio(page, type);
}

export async function selectProperty(page: Page, type: PropertyOption): Promise<void> {
  await propertyLabel(page, type).click();
}

// ─── STEP 4 ACTIONS ──────────────────────────────────────────────────────────

export async function fillName(page: Page, name: string): Promise<void> {
  await nameInput(page).fill(name);
}

export async function fillEmail(page: Page, email: string): Promise<void> {
  await emailInput(page).fill(email);
}

export async function getEmailValidityReason(page: Page): Promise<{ valueMissing: boolean; typeMismatch: boolean }> {
  return emailInput(page).evaluate((el: HTMLInputElement) => ({
    valueMissing: el.validity.valueMissing,
    typeMismatch: el.validity.typeMismatch,
  }));
}

// Returns the native browser tooltip text (e.g. "Please fill out this field.").
// Expected messages vary per browser - use EMAIL_VALIDATION_MESSAGE[browserName] in assertions.
export async function getEmailValidationMessage(page: Page): Promise<string> {
  return emailInput(page).evaluate((el: HTMLInputElement) => el.validationMessage);
}

// ─── STEP 5 ACTIONS ──────────────────────────────────────────────────────────

export async function fillPhone(page: Page, phone: string): Promise<void> {
  await phoneInput(page).fill(phone);
}

// ─── OUT-OF-AREA ACTIONS ─────────────────────────────────────────────────────

export async function fillOutOfAreaEmail(page: Page, email: string): Promise<void> {
  await outOfAreaEmailInput(page).fill(email);
}

export async function submitOutOfAreaForm(page: Page): Promise<void> {
  await outOfAreaSubmitBtn(page).click();
}

// ─── VISIBILITY HELPERS ──────────────────────────────────────────────────────

export function getStepContainer(page: Page, n: number) {
  return stepContainer(page, n);
}

export function getOutOfAreaStep(page: Page) {
  return outOfAreaStep(page);
}

export function getOutOfAreaMessage(page: Page) {
  return outOfAreaMessage(page);
}

export function getOutOfAreaEmailInput(page: Page) {
  return outOfAreaEmailInput(page);
}

export function getOutOfAreaConfirmation(page: Page) {
  return outOfAreaConfirmation(page);
}

export async function getOutOfAreaEmailValidityReason(page: Page): Promise<{ valueMissing: boolean; typeMismatch: boolean }> {
  return outOfAreaEmailInput(page).evaluate((el: HTMLInputElement) => ({
    valueMissing: el.validity.valueMissing,
    typeMismatch: el.validity.typeMismatch,
  }));
}

export async function getOutOfAreaEmailValidationMessage(page: Page): Promise<string> {
  return outOfAreaEmailInput(page).evaluate((el: HTMLInputElement) => el.validationMessage);
}

export function getStepErrorMsg(page: Page, step: number) {
  return stepErrorMsg(page, step);
}

export function getNameErrorMsg(page: Page) {
  return nameErrorMsg(page);
}

export function getPhoneErrorMsg(page: Page) {
  return phoneErrorMsg(page);
}

export function getProgressCurrentStep(page: Page) {
  return progressCurrentStep(page);
}

// ─── FLOW HELPERS (for test setup / preconditions only) ──────────────────────

export async function completeZipStep(page: Page, zip: string): Promise<void> {
  await zipInput(page).fill(zip);
  await nextBtn(page, 1).click();
  await stepContainer(page, 2).waitFor({ state: 'visible' });
}

export async function completeInterestStep(page: Page, interest: InterestOption): Promise<void> {
  await interestLabel(page, interest).click();
  await nextBtn(page, 2).click();
  await stepContainer(page, 3).waitFor({ state: 'visible' });
}

export async function completePropertyStep(page: Page, property: PropertyOption): Promise<void> {
  await propertyLabel(page, property).click();
  await nextBtn(page, 3).click();
  await stepContainer(page, 4).waitFor({ state: 'visible' });
}

export async function completeContactStep(page: Page, name: string, email: string): Promise<void> {
  await nameInput(page).fill(name);
  await emailInput(page).fill(email);
  await nextBtn(page, 4).click();
  await stepContainer(page, 5).waitFor({ state: 'visible' });
}
