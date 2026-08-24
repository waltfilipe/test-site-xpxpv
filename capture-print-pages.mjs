import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to A4 landscape dimensions (roughly)
    await page.setViewport({ 
      width: 1122, // 297mm at 96dpi
      height: 793,  // 210mm at 96dpi
      deviceScaleFactor: 2
    });
    
    console.log('Navigating to reports page...');
    await page.goto('http://localhost:3011/reports', { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('Clicking Export PDF button...');
    // Wait for and click the first "Export PDF" button
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    let exportBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Export PDF')) {
        exportBtn = btn;
        break;
      }
    }
    
    if (!exportBtn) {
      console.error('Export PDF button not found');
      process.exit(1);
    }
    
    await exportBtn.click();
    
    console.log('Waiting for print content to load...');
    // Wait for print mode to be set
    await page.waitForFunction(
      () => document.body.dataset.printMode === 'dedicated',
      { timeout: 10000 }
    );
    
    // Wait a bit more for images to load
    await sleep(3000);
    
    // Emulate print media
    await page.emulateMediaType('print');
    
    console.log('Capturing pages...');
    
    // Get the print root element
    const printRoot = await page.$('#report-print-root');
    if (!printRoot) {
      console.error('Print root not found');
      process.exit(1);
    }
    
    // Capture page 1
    const page1 = await page.$('.report-page-1');
    if (page1) {
      console.log('Capturing page 1...');
      const box = await page1.boundingBox();
      if (box) {
        await page.screenshot({
          path: '/tmp/refined-page-1.png',
          clip: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height
          }
        });
        console.log('✓ Page 1 saved to /tmp/refined-page-1.png');
      }
    }
    
    // Capture page 2
    const page2 = await page.$('.report-page-2');
    if (page2) {
      console.log('Capturing page 2...');
      const box = await page2.boundingBox();
      if (box) {
        await page.screenshot({
          path: '/tmp/refined-page-2.png',
          clip: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height
          }
        });
        console.log('✓ Page 2 saved to /tmp/refined-page-2.png');
      }
    }
    
    // Capture page 3
    const page3 = await page.$('.report-page-3');
    if (page3) {
      console.log('Capturing page 3...');
      const box = await page3.boundingBox();
      if (box) {
        await page.screenshot({
          path: '/tmp/refined-page-3.png',
          clip: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height
          }
        });
        console.log('✓ Page 3 saved to /tmp/refined-page-3.png');
      }
    } else {
      console.log('Note: Page 3 not found (may only be 2 pages)');
    }
    
    // Verify page 2 rightmost map
    const impactMapTitle = await page.evaluate(() => {
      const page2 = document.querySelector('.report-page-2');
      if (!page2) return null;
      
      // Look for the rightmost map title
      const mapTitles = Array.from(page2.querySelectorAll('.report-map-card-title, .report-map-title'));
      const lastTitle = mapTitles[mapTitles.length - 1];
      return lastTitle ? lastTitle.textContent?.trim() : null;
    });
    
    console.log('\n=== Verification ===');
    console.log(`Rightmost map on page 2: ${impactMapTitle || 'NOT FOUND'}`);
    
    const hasImpactMap = impactMapTitle?.includes('IMPACT PASSES') && impactMapTitle?.includes('FINAL THIRD');
    console.log(`Contains "IMPACT PASSES · FINAL THIRD": ${hasImpactMap ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
