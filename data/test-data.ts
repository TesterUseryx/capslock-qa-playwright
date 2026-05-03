export const ZIP = {
  serviceArea: '68901',
  outOfArea: '11111',
  tooShort: '1234',
  tooLong: '123456',
  alphabetic: 'ABCDE',
  allZeros: '00000',
} as const;

export const PHONE = {
  valid: '5551234567',
  tooShort: '555123456',
  tooLong: '55512345678',
  allZeros: '0000000000',
} as const;

export const USER = {
  name: 'John Doe',
  email: 'john.doe@test.com',
  invalidEmail: 'notanemail',
  emailMissingDomain: 'notanemail@',
  emailNoTld: 'notanemail@domain',
  nameSingleWord: 'John',
  nameInvalidChars: '1223',
  nameTooLong: 'This Is A Very Long Full Name That Exceeds',
} as const;

export const THANK_YOU_PATH = '/thankyou';

export const ZIP_ERROR = {
  empty: 'Enter your ZIP code.',
  invalid: 'Wrong ZIP code.',
} as const;

export const PHONE_ERROR = {
  empty: 'Enter your phone number.',
  invalid: 'Wrong phone number.',
} as const;

// Out-of-area email uses type="text" + JS validation — not HTML5 native (see defect in README)
export const OUT_OF_AREA_EMAIL_ERROR = {
  empty: 'Enter your email address.',
  invalid: 'Wrong email.',
} as const;

export const NAME_ERROR = {
  empty: 'Please enter your name.',
  singleWord: 'Your full name should contain both first and last name.',
  invalidChars: 'Your name should consist only of latin letters, apostrophes, underscores, dots and dashes.',
  tooLong: 'This value is too long. Your name should have 40 characters or less.',
} as const;

// Native browser validation messages, keyed by Playwright's browserName value.
// Chromium format messages include the typed value dynamically; we store only the stable prefix.
// Firefox and WebKit return a single generic message for all email format errors.
export const EMAIL_VALIDATION_MESSAGE = {
  chromium: {
    empty:            'Please fill out this field.',
    missingAt:        "Please include an '@' in the email address.",
    incompleteDomain: "Please enter a part following '@'.",
  },
  firefox: {
    empty:            'Please fill out this field.',
    missingAt:        'Please enter an email address.',
    incompleteDomain: 'Please enter an email address.',
  },
  webkit: {
    empty:            'Fill out this field',
    missingAt:        'Enter an email address',
    incompleteDomain: 'Enter an email address',
  },
} as const;

export const INTEREST_OPTIONS = ['independence', 'safety', 'therapy', 'other'] as const;
export type InterestOption = (typeof INTEREST_OPTIONS)[number];

export const PROPERTY_OPTIONS = ['owned', 'rental', 'mobile'] as const;
export type PropertyOption = (typeof PROPERTY_OPTIONS)[number];
