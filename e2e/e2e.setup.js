const { expect: playwrightExpect } = require('@playwright/test');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

const BASE_URL = 'http://localhost:3000';
const SNAPSHOT_DIRECTORY = 'e2e/__snapshots__';

// Save the true Jest global expect BEFORE we overwrite 'global.expect'
const originalJestExpect = global.expect;

const normalizeComparableString = (value) => {
  return (value ?? '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const isImageBuffer = (value) => {
  return Buffer.isBuffer(value) || value instanceof Uint8Array;
};

// 1. Register custom matchers onto Jest's original expect system
originalJestExpect.extend({
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
  toMatchImageSnapshot,
});

// 2. Smart expect prioritizing Playwright, safely falling back to originalJestExpect
const smartExpect = (received, ...args) => {
  if (isImageBuffer(received)) {
    // Use the saved original Jest expect to prevent infinite recursion
    return originalJestExpect(received, ...args);
  }
  return playwrightExpect(received, ...args);
};

Object.assign(smartExpect, playwrightExpect);

beforeEach(async () => {
  await page.goto(BASE_URL);
  await page.waitForSelector('canvas', { timeout: 10000 });
});

afterEach(async () => {  
  const contexts = browser.contexts();
  for (const context of contexts) {
    const pages = context.pages();
    for (let idx = 0; idx < pages.length; idx++) {
      if (idx > 0) {
        await pages[idx].close();
      }
    }
  }
});

global.BASE_URL = BASE_URL;
global.expect = smartExpect;
global.SNAPSHOT_DIRECTORY = SNAPSHOT_DIRECTORY;