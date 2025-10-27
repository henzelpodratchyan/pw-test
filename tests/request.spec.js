import { test, expect } from '@playwright/test';

test.describe('ELLE Website Script & Analytics Verification', () => {
  test.setTimeout(120000);
  let page;
  const GA_MEASUREMENT_ID = 'G-BTTN4BQHSS';
  const collectedRequests = [];
  let domScripts;
  let allScripts;
  let gaRequest;
  let capturedURLs = undefined;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    await page.goto('https://www.elle.com/');
    
    gaRequest = await page.waitForRequest(req =>
      req.url().includes(GA_MEASUREMENT_ID) &&
      req.url().toLowerCase().includes('page_view') &&
      req.url().includes('collect'), { timeout: 10000 }
    ).catch(() => undefined);

    capturedURLs = gaRequest.url()
    
    domScripts = await page.$$eval('script[src]', els => els.map(e => e.src));
    allScripts = [...new Set([...collectedRequests, ...domScripts])];
  });

  test('Verify analytics and script loading on ELLE website', async () => {
    for (const script of ['moapt-data', 'moapt-bundle-hdm']) {
      const exists = allScripts.some(url => url.toLowerCase().includes(script));
      expect(exists, `${script} should be loaded or present in DOM`).toBeTruthy();
    }
  });
    
  test('Verify Google Analytics request fires pageViewEvent event', async () => {
    // tests if the url contains the GA measurement id
    expect(gaRequest.url()).toContain(GA_MEASUREMENT_ID);

    // tests if the url contains the pageViewEvent parameter
    expect(capturedURLs).toBeDefined();
  });
});
