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
    
    // Get all text content from page 2
    const page2Info = await page.evaluate(() => {
      const page2 = document.querySelector('.report-page-2');
      if (!page2) return { found: false };
      
      // Get all text that might be map titles
      const allText = page2.innerText;
      
      // Look for various possible selectors for map titles
      const titles = [];
      page2.querySelectorAll('*').forEach(el => {
        const text = el.textContent?.trim();
        if (text && (text.includes('PASS') || text.includes('IMPACT') || text.includes('FINAL'))) {
          const tag = el.tagName.toLowerCase();
          const classes = Array.from(el.classList).join(' ');
          if (text.length < 100) { // Filter out large blocks
            titles.push({ text, tag, classes });
          }
        }
      });
      
      return {
        found: true,
        allText: allText.substring(0, 1000),
        titles: titles.slice(0, 20)
      };
    });
    
    console.log('=== Page 2 Content ===');
    console.log('Found page 2:', page2Info.found);
    console.log('\nMap-related titles found:');
    page2Info.titles?.forEach((t, i) => {
      console.log(`${i + 1}. [${t.tag}${t.classes ? '.' + t.classes : ''}] ${t.text}`);
    });
    
    const hasImpact = page2Info.titles?.some(t => 
      t.text.includes('IMPACT') && t.text.includes('PASSES') && t.text.includes('FINAL') && t.text.includes('THIRD')
    );
    
    console.log('\n=== Verification ===');
    console.log(`Contains "IMPACT PASSES · FINAL THIRD": ${hasImpact ? 'YES ✓' : 'NO ✗'}`);
    
  } finally {
    await browser.close();
  }
})();
