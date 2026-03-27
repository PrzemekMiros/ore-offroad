const { chromium } = require('playwright-chromium');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('api') || url.includes('results')) {
      const status = resp.status();
      let text = '';
      try { text = await resp.text(); } catch (e) {}
      console.log('API', status, url);
      console.log(text.slice(0,400));
    }
  });
  await page.goto('https://results4x4.com/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(8000);
  await browser.close();
})();
