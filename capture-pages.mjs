import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });
  
  // Navigate to reports page
  await page.goto('http://localhost:3011/reports', { waitUntil: 'networkidle0' });
  
  // Click Export PDF for first player (Vitinha)
  await page.click('button:has-text("Export PDF")');
  
  // Wait for print dialog to open
  await page.waitForTimeout(3000);
  
  // Get the print preview pages
  // In Chrome's print preview, pages are rendered in the preview area
  // We need to use CDP to access the print mode
  
  await browser.close();
})();
