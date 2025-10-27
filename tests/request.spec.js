import { test, expect } from '@playwright/test';

test.describe('ELLE Website Script & Analytics Verification', () => {
  test.setTimeout(120000);
  let page;
  const GA_MEASUREMENT_ID = 'G-BTTN4BQHSS';
  const collectedRequests = [];
  let domScripts;
  let allScripts;
  let gaRequest;
  let capturedURLs = '';

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    page.on('request', req => {
      const url = req.url();
      if (/google|analytics|gtm|moapt/i.test(url)) {
        collectedRequests.push(url);
      }
      if (url.includes('collect')) {
        capturedURLs += url;
      }
    });

    await page.goto('https://www.elle.com/');
    await page.waitForTimeout(10000);

    gaRequest = await page.waitForRequest(req => {
      const url = req.url();
      const postData = req.postData() || '';
      return (
        /google-analytics\.com|gtm|collect|analytics/i.test(url) &&
        (url.includes(GA_MEASUREMENT_ID) || postData.includes(GA_MEASUREMENT_ID))
      );
    }, { timeout: 60000 });
    
    domScripts = await page.$$eval('script[src]', els => els.map(e => e.src));
    allScripts = [...new Set([...collectedRequests, ...domScripts])];
  });

  test('Verify analytics and script loading on ELLE website', async () => {
    for (const script of ['moapt-data', 'moapt-bundle-hdm']) {
      const exists = allScripts.some(url => url.toLowerCase().includes(script));
      expect(exists, `${script} should be loaded or present in DOM`).toBeTruthy();
    }
  });
    
  test('Verify Google Analytics request with correct Measurement ID', async () => {
    expect(gaRequest.url()).toContain(GA_MEASUREMENT_ID);
  });

  test('Verify pageViewEvent was fired', async () => {
    expect(capturedURLs).toContain('en=PageView');
  });
});
