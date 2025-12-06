import { Page, Browser, BrowserContext, Locator } from 'playwright';

declare global {
  const page: Page;
  const browser: Browser;
  const context: BrowserContext;
  
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): Promise<R>;
      toHaveText(expected: string): Promise<R>;
    }
  }
}