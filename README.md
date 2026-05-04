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

## Environment setup

The test suite reads `BASE_URL` from an environment file. A template is provided:

```bash
cp .env.template .env.test-qa
```

Open `.env.test-qa` and fill in the value:

```
BASE_URL=https://test-qa.capslock.global
```

The `globalSetup.ts` automatically loads `.env.<test_env>` before the tests run. The `test_env` variable is set by the npm scripts (e.g. `test_env=test-qa`), so once the file exists you can run tests without any further configuration.

> **Never commit `.env.test-qa`** -it is listed in `.gitignore`. In CI the `BASE_URL` secret is injected directly as an environment variable (see CI section).

---

## Running the tests

| Command | Description |
|---|---|
| `npm test` | Run all tests headlessly |
| `npm run test:headed` | Run with a visible browser window |
| `npm run test:report` | Open the last HTML report |

> **Browser configuration:** Firefox and WebKit are temporarily commented out in `playwright.config.ts` for a faster local run. To enable cross-browser execution, uncomment the Firefox and WebKit project blocks in that file. All three browsers are fully supported.

Tests can also be filtered by tag:

```bash
npx cross-env test_env=test-qa npx playwright test --grep @zip-validation
npx cross-env test_env=test-qa npx playwright test --grep @happy-path
npx cross-env test_env=test-qa npx playwright test --grep @out-of-area
npx cross-env test_env=test-qa npx playwright test --grep @contact-details
npx cross-env test_env=test-qa npx playwright test --grep @negative-path
```

Or run a single test by name:

```bash
npx cross-env test_env=test-qa npx playwright test --grep "input mask"
```

---

## CI

A manually triggered GitHub Actions workflow runs the full suite against Chromium and publishes a structured results report to the workflow Summary page. The full Playwright HTML report is uploaded as a downloadable artifact for 30 days.

To trigger: **Actions → Playwright Tests → Run workflow**

Example run: [Playwright Tests #7](https://github.com/TesterUseryx/capslock-qa-playwright/actions/runs/25283699082)

---

## Project structure

```
├── pages/
│   ├── landing-page.ts      # Page object for the multi-step form
│   └── thank-you-page.ts    # Page object for the Thank You page
├── scripts/
│   └── playwright-reporter-config.ts  # Reporter config used by the CI merge step
├── tests/
│   ├── 01-happy-path.spec.ts
│   ├── 02-out-of-area.spec.ts
│   ├── 03-zip-validation.spec.ts
│   ├── 04-phone-validation.spec.ts
│   ├── 05-contact-details.spec.ts
│   └── 06-negative-path.spec.ts
├── data/
│   └── test-data.ts         # Centralised test constants
├── utils/
│   ├── env.ts               # Environment variable accessor
│   └── globalSetup.ts       # Loads .env.<test_env> before tests
├── .env.template            # Copy this to .env.test-qa and fill in BASE_URL
└── playwright.config.ts
```

---

## Full scenario list

24 automated tests across 6 spec files.

**Priority** ⭐ = top-5 scenario · **Status** ✅ = passing · ⚠️ = intentionally failing to document a known defect

| # | Test name | File | Priority | Status |
|---|---|---|---|---|
| 1 | Completes the walk-in bath quote form with valid data and redirects to the Thank You page | 01 | ⭐ | ⚠️ |
| 2 | Verify that out-of-area message is shown, email notification can be submitted, and confirmation is displayed | 02 | ⭐ | ✅ |
| 3 | Verify that the progress indicator shows the correct step count on the out-of-area email step | 02 | | ⚠️ |
| 4 | Verify that empty email blocks submission via HTML5 validation | 02 | | ⚠️ |
| 5 | Verify that email without @ blocks submission via HTML5 validation | 02 | | ⚠️ |
| 6 | Verify that email with @ but no domain blocks submission via HTML5 validation | 02 | | ⚠️ |
| 7 | Verify that email without TLD blocks submission via HTML5 validation | 02 | | ⚠️ |
| 8 | Verify that empty submission shows a validation error and keeps the form on step 1 | 03 | | ✅ |
| 9 | Verify that fewer than 5 digits shows a validation error and keeps the form on step 1 | 03 | ⭐ | ✅ |
| 10 | Verify that more than 5 digits shows a validation error and keeps the form on step 1 | 03 | | ✅ |
| 11 | Verify that non-numeric characters shows a validation error and keeps the form on step 1 | 03 | | ✅ |
| 12 | Verify that all-zeros (not a real US ZIP) shows a validation error and keeps the form on step 1 | 03 | | ⚠️ |
| 13 | Verify that empty phone number shows a validation error and does not redirect | 04 | | ✅ |
| 14 | Verify that phone with fewer than 10 digits shows a validation error and does not redirect | 04 | ⭐ | ✅ |
| 15 | Verify that all-zeros phone (0000000000) shows a validation error and does not redirect | 04 | | ⚠️ |
| 16 | Verify that the input mask limits phone entry to 10 digits | 04 | | ✅ |
| 17 | Verify that empty name shows a validation error and keeps the form on step 4 | 05 | | ✅ |
| 18 | Verify that single-word name shows a validation error and keeps the form on step 4 | 05 | | ✅ |
| 19 | Verify that name with invalid chars shows a validation error and keeps the form on step 4 | 05 | | ✅ |
| 20 | Verify that name exceeding 40 chars shows a validation error and keeps the form on step 4 | 05 | | ✅ |
| 21 | Verify that empty email blocks submission and keeps the form on step 4 | 05 | | ✅ |
| 22 | Verify that email without @ blocks submission and keeps the form on step 4 | 05 | | ✅ |
| 23 | Verify that email with @ but no domain blocks submission and keeps the form on step 4 | 05 | | ✅ |
| 24 | Verify that all fields in the form are required and block progression when left empty | 06 | ⭐ | ⚠️ |

### Top 5 selected scenarios and why

> **Note:** Each of these scenarios directly covers a stated requirement -(1) complete form flow, (2) "All fields are required", (3) "ZIP Code: must be a valid 5-digit US ZIP code", (4) out-of-area detection and alternate lead-capture flow, (5) "Phone: must be exactly 10 digits".

| # | Exact test name | Why selected |
|---|---|---|
| 1 | Completes the walk-in bath quote form with valid data and redirects to the Thank You page | Validates the entire lead-capture funnel end-to-end. If this fails, no leads are captured at all -the single highest business impact scenario. |
| 2 | Verify that all fields in the form are required and block progression when left empty | Proves that every step enforces the required-field rule. Without this a lead could be submitted with a blank name, phone, or ZIP -making it uncontactable and effectively a question mark in the CRM. |
| 3 | Verify that fewer than 5 digits shows a validation error and keeps the form on step 1 | ZIP is the routing gate for both user journeys. A code with fewer than 5 digits cannot be resolved to a service area, stalling the entire flow before a single decision is made. |
| 4 | Verify that out-of-area message is shown, email notification can be submitted, and confirmation is displayed | Validates the second user journey end-to-end. Users outside the service area are a significant lead pool; if this flow breaks they are silently lost with no fallback. |
| 5 | Verify that phone with fewer than 10 digits shows a validation error and does not redirect | A US phone number must be 10 digits for the sales team to call back. This test confirms the requirement is enforced at the last step before lead data leaves the front end. |

---

## Defects found

6 defects were identified, causing **9 tests to fail**. All failing tests assert the **expected (correct) behaviour**; they are intentionally failing until each defect is fixed.

> **Note on HTML5 email and TLD:** HTML5 email validation (`type="email"`) technically allows addresses without a top-level domain, e.g. `user@hotmail`. Accepting such addresses on the main form is therefore **correct per the spec** -the task requirement is "use native HTML5 email validation" and that is what the main form does. However, in practice `user@hotmail` is not a deliverable email address, which may warrant stricter product requirements in future. The out-of-area form defect (Defect 6) is different: it uses `type="text"` with custom JavaScript validation instead of HTML5, which is a specification violation.

---

### Defect 1 · Step 2 (interest selection) can be skipped without choosing an option

**File:** `06-negative-path.spec.ts`  
**Test:** *"Verify that all fields in the form are required and block progression when left empty"* (fails on the step-2 assertion via `expect.soft`)

**Expected:** Clicking Next on step 2 without selecting any interest option shows a validation error and keeps the user on step 2.  
**Actual:** The form silently advances to step 3. No error is shown and no selection is required.

---

### Defect 2 · All-zeros ZIP (00000) is silently accepted

**File:** `03-zip-validation.spec.ts`  
**Test:** *"Verify that all-zeros (not a real US ZIP) shows a validation error and keeps the form on step 1"*  
**Expected:** Entering `00000` shows the "Wrong ZIP code." error and keeps the form on step 1.  
**Actual:** The form neither shows an error nor routes to the out-of-area step. The ZIP is silently accepted.

---

### Defect 3 · Step counter skips number 3 on the property-type step

**File:** `01-happy-path.spec.ts`  
**Test:** *"Completes the walk-in bath quote form with valid data and redirects to the Thank You page"*  
**Expected:** Progress indicator reads `3` when the property-type step (step 3) is active.  
**Actual:** After advancing from step 2, the counter still shows `2`. It then jumps directly to `4` on the contact-details step, skipping `3` entirely. This is why the happy path test is marked ⚠️ even though the rest of the flow works.

---

### Defect 4 · Out-of-area step counter shows wrong number

**File:** `02-out-of-area.spec.ts`  
**Test:** *"Verify that the progress indicator shows the correct step count on the out-of-area email step"*  
**Expected:** Progress indicator reads `2` when the out-of-area email step is active (it is the second step in that flow).  
**Actual:** The indicator displays `1`.

---

### Defect 5 · All-zeros phone (0000000000) is accepted as valid

**File:** `04-phone-validation.spec.ts`  
**Test:** *"Verify that all-zeros phone (0000000000) shows a validation error and does not redirect"*  
**Expected:** Entering `0000000000` shows the "Wrong phone number." error and keeps the user on step 5.  
**Actual:** The form accepts the all-zeros number and redirects to `/thankyou`.

---

### Defect 6 · Out-of-area email input uses `type="text"` instead of `type="email"`

**File:** `02-out-of-area.spec.ts`  
**Tests (4):**
- *"Verify that empty email blocks submission via HTML5 validation"*
- *"Verify that email without @ blocks submission via HTML5 validation"*
- *"Verify that email with @ but no domain blocks submission via HTML5 validation"*
- *"Verify that email without TLD blocks submission via HTML5 validation"*

**Expected:** The email input in the out-of-area step is `<input type="email">`, so that native HTML5 validation fires exactly as it does on the main form -as required by the specification.  
**Actual:** The input is `type="text"`. All validation falls back to custom JavaScript logic that is stricter than the HTML5 spec (it rejects addresses without a TLD). Because the `validity` API behaves differently on a `type="text"` input, all four HTML5 assertion checks fail.

---

## Ideas for future framework improvements

1. **More granular Page Object Model** -introduce a `pages/landing/` folder with a shared `base.ts` (flow helpers, progress bar) and individual page files per step (`zip.ts`, `interest.ts`, `property.ts`, `contact.ts`, `phone.ts`, `out-of-area.ts`). This improves traceability -a failing test immediately points to the responsible page file rather than searching through one large file.

2. **API-level test data seeding** -replace multi-step UI `beforeEach` setup with direct API calls to pre-populate form state, making tests faster and fully isolated from upstream step failures.

3. **Accessibility (a11y) audits** -integrate `axe-playwright` to run automated WCAG checks in CI, catching missing `required` attributes, contrast issues, and missing ARIA labels at the moment they are introduced.

4. **Visual regression testing** -integrate Percy or Playwright's built-in snapshot comparison to catch unintended layout changes from design updates.

5. **Smoke vs regression tag strategy** -add `@smoke` tags to the top-5 scenarios so CI can run a fast smoke suite (< 1 min) on every deploy and the full regression suite nightly or on demand.

6. **CI notification integration** -send structured test-result summaries to Slack or Microsoft Teams automatically after each CI run so the whole team is aware of failures without checking GitHub.

7. **Test case management integration** -sync automated results with TestRail, Xray, or a similar tool to get a single source of truth for test coverage alongside any manual test cases.

8. **Jira integration** -auto-create or update Jira defect tickets for consistently failing tests, linking CI run details and failure screenshots directly to the issue tracker.

9. **AI-assisted test generation** -use AI tooling to generate initial test cases from user stories or acceptance criteria, suggest maintenance fixes when selectors break after page updates, and assist with manual test case authoring.

---

## Part 2 – Written Evaluation

The written evaluation (answers to the four management and process questions) is included in this repository as a separate document:

[Part 2 - Written Evaluation.pdf](./Part%202%20-%20Written%20Evaluation.pdf)
