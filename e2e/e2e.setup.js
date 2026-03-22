const { expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const normalizeComparableString = (value) => {
  return (value ?? '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

expect.extend({
  toLookSame(received, expected) {
    const normalizedReceived = normalizeComparableString(received);
    const normalizedExpected = normalizeComparableString(expected);
    const pass = normalizedReceived === normalizedExpected;

    return {
      pass,
      message: () =>
        pass
          ? `Expected strings not to look the same after normalization.`
          : `Expected normalized strings to match.\nReceived: ${normalizedReceived}\nExpected: ${normalizedExpected}`,
    };
  },
});

beforeEach(async () => {
  await page.goto(BASE_URL);
  await page.waitForSelector('canvas', { timeout: 10000 });
});

// Make BASE_URL available globally
global.BASE_URL = BASE_URL;
global.playwrightExpect = expect;