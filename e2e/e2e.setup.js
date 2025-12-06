const { expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

beforeEach(async () => {
  await page.goto(BASE_URL);
  await page.waitForSelector('canvas', { timeout: 10000 });
});

// Make BASE_URL available globally
global.BASE_URL = BASE_URL;
global.playwrightExpect = expect;