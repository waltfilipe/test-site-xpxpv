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
    
    // Find all map titles in page 2
    const mapTitles = await page.evaluate(() => {
      const page2 = document.querySelector('.report-page-2');
      if (!page2) return [];
      
      const titles = [];
      page2.querySelectorAll('.section-label-sm, .report-map-card-title, h4').forEach(el => {
        const text = el.textContent?.trim();
        if (text) titles.push(text);
      });
      
      return titles;
    });
    
    console.log('=== Map Titles Found on Page 2 ===');
    mapTitles.forEach((title, i) => {
      console.log(`${i + 1}. ${title}`);
    });
    
    const hasImpactMap = mapTitles.some(t => 
      t.toUpperCase().includes('IMPACT') && 
      t.toUpperCase().includes('PASS') && 
      t.toUpperCase().includes('FINAL') && 
      t.toUpperCase().includes('THIRD')
    );
    
    console.log('\n=== Verification ===');
    console.log(`Contains "IMPACT PASSES · FINAL THIRD": ${hasImpactMap ? 'YES ✓' : 'NO ✗'}`);
    console.log(`Rightmost map title: ${mapTitles[mapTitles.length - 1] || 'NOT FOUND'}`);
    
  } finally {
    await browser.close();
  }
})();
