# Capslock QA – Playwright Test Suite

Automated end-to-end tests for [https://test-qa.capslock.global](https://test-qa.capslock.global), a multi-step lead-generation form for a walk-in bath product.

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

---

## Installation

```bash
npm install
npx playwright install --with-deps
```

---

## Running the tests

| Command | Description |
|---|---|
| `npm test` | Run all tests headlessly (Chromium, Firefox, WebKit) |
| `npm run test:headed` | Run with a visible browser window |
| `npm run test:report` | Open the last HTML report |

Tests can also be filtered by tag:

```bash
# Run only ZIP validation tests
npx cross-env test_env=test-qa npx playwright test --grep @zip

# Run only happy-path tests
npx cross-env test_env=test-qa npx playwright test --grep @happy-path
```

---

## Project structure

```
├── pages/
│   ├── landing-page.ts      # Page object for the multi-step form
│   └── thank-you-page.ts    # Page object for the Thank You page
├── tests/
│   └── e2e/
│       ├── 01-happy-path.spec.ts
│       ├── 02-out-of-area.spec.ts
│       ├── 03-zip-validation.spec.ts
│       ├── 04-phone-validation.spec.ts
│       └── 05-email-validation.spec.ts
├── data/
│   └── test-data.ts         # Centralised test constants
├── utils/
│   ├── env.ts               # Environment variable accessor
│   └── globalSetup.ts       # Loads .env.<test_env> before tests
├── .env.test-qa             # Environment config for test-qa
└── playwright.config.ts
```

---

## Full scenario list

| # | Scenario | File | Selected |
|---|---|---|---|
| 1 | Full form completion with service-area ZIP → `/thankyou` redirect | 01 | ✅ |
| 2 | Out-of-area ZIP (11111) shows alternate message + email capture form | 02 | ✅ |
| 3 | Out-of-area email submission shows confirmation message | 02 | ✅ |
| 4 | Empty ZIP is blocked with "Enter your ZIP code." | 03 | ✅ |
| 5 | ZIP with fewer than 5 digits is blocked with "Wrong ZIP code." | 03 | ✅ |
| 6 | ZIP with more than 5 digits is blocked with "Wrong ZIP code." | 03 | ✅ |
| 7 | ZIP with non-numeric characters is blocked with "Wrong ZIP code." | 03 | ✅ |
| 8 | Valid 5-digit ZIP advances to step 2 | 03 | ✅ |
| 9 | Empty phone is blocked with a validation error | 04 | ✅ |
| 10 | Phone with fewer than 10 digits is blocked with a validation error | 04 | ✅ |
| 11 | All-zeros phone (0000000000) is blocked with a validation error (defect — currently accepted) | 04 | ✅ |
| 12 | Input mask limits phone entry to exactly 10 digits | 04 | ✅ |
| 13 | Empty email is blocked by HTML5 `required` validation | 05 | ✅ |
| 14 | Invalid email format is blocked by HTML5 email validation | 05 | ✅ |
| 15 | Empty name is blocked (expected; currently a defect — see below) | 05 | ✅ |
| 16 | Valid name + email advances to step 5 | 05 | ✅ |

### Why these scenarios were selected

The five test files cover the form's two distinct user journeys (service area vs. out-of-area) and every field that has an explicit validation rule in the spec. ZIP, phone, and email are the three fields where incorrect data directly prevents lead capture, making them the highest-risk areas to regress. The happy path validates the entire funnel end-to-end and is the single most important scenario for CI. Name/email validation is included because two defects were discovered there.

---

## Defects found

Tests are written against **expected behaviour**. When a test fails, it means the form behaves incorrectly for that case. Defects 1 and 2 are **semantic / accessibility** issues — the functional test still passes because JavaScript compensates. All other defects have failing tests that pin them.

### 1 · Name field missing `required` attribute

**File:** `05-email-validation.spec.ts`  
**Expected:** `<input name="name">` should have the HTML `required` attribute to support native browser validation when JS is disabled.  
**Actual:** Attribute is absent; JS compensates so the test passes, but the semantics are wrong.

### 2 · Phone field missing `required` attribute

**File:** `04-phone-validation.spec.ts`  
**Expected:** `<input name="phone">` should have the HTML `required` attribute.  
**Actual:** Attribute is absent; JS compensates so the empty-phone test passes.

### 3 · All-zeros phone (0000000000) is accepted

**File:** `04-phone-validation.spec.ts` → *"all-zeros phone (0000000000) shows a validation error"*  
**Expected:** `0000000000` is not a real phone number and should be rejected with "Wrong phone number."  
**Actual:** The form accepts it and redirects to `/thankyou`. The test **fails**.

### 4 · Step counter shows wrong number on property type step

**File:** `01-happy-path.spec.ts` (assertion on progress indicator)  
**Expected:** The progress indicator should read "3 of 5" when the property type step is active.  
**Actual:** It displays "2 of 5", skipping from 2 to 4.

### 5 · Out-of-area step counter is incomplete

**File:** `02-out-of-area.spec.ts` → *"progress indicator shows the correct step count on the out-of-area email step"*  
**Expected:** The indicator should show a total, e.g. "1 of 2".  
**Actual:** It displays "1 of" with the total count missing. The test **fails**.

### 6 · All-zeros ZIP (00000) is silently accepted

**File:** `03-zip-validation.spec.ts` → *"all-zeros (not a real US ZIP) shows a validation error"*  
**Expected:** `00000` is not a real US ZIP code and should be blocked.  
**Actual:** The form neither shows an error nor routes to the out-of-area step. The test **fails**.

### 7 · Headline year is outdated

**Content issue** — the main headline reads *"Here's Why So Many Seniors Have Added This Walk-In Bath In 2020…"* It is currently 2026.

### 8 · Typo in price section

**Content issue** — "Our Price Promice" should read "Our Price Promise".

---

## Ideas for future framework improvements

1. **API-level test data seeding** — Replace multi-step UI setup (beforeEach in phone/email tests) with direct API calls to set form state, making tests faster and more isolated.

2. **Visual regression testing** — Integrate `@playwright/experimental-ct-react` or Percy to catch unintended layout changes introduced by designers, which is especially relevant for a design-team project.

3. **Allure or custom reporter** — Add structured reporting (Allure, GitHub OIDC annotations) so CI pipelines surface pass/fail summaries and defect links directly in pull-request comments.

4. **Mobile viewport coverage** — Add dedicated projects in `playwright.config.ts` for `Pixel 5` and `iPhone 12` to ensure the responsive form layout does not break on mobile, where the majority of landing-page traffic typically originates.
