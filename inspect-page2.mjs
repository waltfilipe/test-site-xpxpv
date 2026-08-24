import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1122, height: 793, deviceScaleFactor: 2 });
    
    await page.goto('http://localhost:3011/reports', { waitUntil: 'networkidle0' });
    
    const buttons = await page.$$('button');
    let exportBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Export PDF')) {
        exportBtn = btn;
        break;
      }
    }
    
    await exportBtn.click();
    await page.waitForFunction(() => document.body.dataset.printMode === 'dedicated', { timeout: 10000 });
    await sleep(3000);
    await page.emulateMediaType('print');
    
    // Get page 2 HTML structure
    const page2HTML = await page.evaluate(() => {
      const page2 = document.querySelector('.report-page-2');
      if (!page2) return null;
      return page2.innerHTML.substring(0, 5000); // First 5000 chars
    });
    
    console.log('=== Page 2 HTML (first 5000 chars) ===');
    console.log(page2HTML);
    
  } finally {
    await browser.close();
  }
})();
