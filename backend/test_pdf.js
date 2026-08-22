const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    console.log('Browser launched');
    const page = await browser.newPage();
    console.log('Page created');
    await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 2 });
    console.log('Viewport set');
    
    const htmlContent = '<html><head><style>body { background: white; }</style></head><body><h1>Test</h1></body></html>';
    const tempHtmlPath = path.join(process.cwd(), \	emp_test_\.html\);
    fs.writeFileSync(tempHtmlPath, htmlContent);
    await page.goto(\ile:///\\, { waitUntil: 'networkidle0' });
    console.log('Navigated to temp HTML');
    const tempPdfPath = path.join(process.cwd(), \	emp_test_\.pdf\);
    await page.pdf({
      path: tempPdfPath,
      width: '1440px',
      height: '1000px',
      printBackground: true
    });
    console.log('PDF generated at', tempPdfPath);
    await browser.close();
  } catch (e) {
    console.error('Error:', e);
  }
})();
