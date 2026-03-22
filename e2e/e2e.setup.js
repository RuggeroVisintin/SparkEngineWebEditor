const { expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const ISOLATED_TEST_NAMES = new Set();

const isolatedState = {
  page: undefined,
  context: undefined,
  sharedPage: undefined,
  sharedContext: undefined,
};

const isCurrentTestIsolated = () => {
  const currentTestName = expect.getState().currentTestName ?? '';

  return Array.from(ISOLATED_TEST_NAMES).some(testName => currentTestName.endsWith(testName));
};

const registerIsolatedTest = (base) => {
  const isolated = (name, fn, timeout) => {
    ISOLATED_TEST_NAMES.add(name);
    return base(name, fn, timeout);
  };

  return isolated;
};

global.it.isolated = registerIsolatedTest(global.it);
global.test.isolated = registerIsolatedTest(global.test);

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
  if (isCurrentTestIsolated()) {
    isolatedState.sharedPage = global.page;
    isolatedState.sharedContext = global.context;
    isolatedState.context = await browser.newContext();
    isolatedState.page = await isolatedState.context.newPage();

    global.context = isolatedState.context;
    global.page = isolatedState.page;
  }

  await page.goto(BASE_URL);
  await page.waitForSelector('canvas', { timeout: 10000 });
});

afterEach(async () => {
  if (!isCurrentTestIsolated()) {
    return;
  }

  await isolatedState.page?.close();
  await isolatedState.context?.close();

  global.page = isolatedState.sharedPage;
  global.context = isolatedState.sharedContext;

  isolatedState.page = undefined;
  isolatedState.context = undefined;
  isolatedState.sharedPage = undefined;
  isolatedState.sharedContext = undefined;
});

// Make BASE_URL available globally
global.BASE_URL = BASE_URL;
global.playwrightExpect = expect;