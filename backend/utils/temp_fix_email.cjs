const fs = require('fs');

let html = fs.readFileSync('frontend/public/DailySalesEmailTemplate.html', 'utf8');

// Replace top KPI table width
html = html.replace(/<table width="100%" cellpadding="5" cellspacing="5" style="margin-bottom: 20px;">/g, '<table width="1200" cellpadding="5" cellspacing="5" style="margin-bottom: 20px; table-layout: fixed; width: 1200px; min-width: 1200px;">');

// Replace middle tables row outer width
html = html.replace(/<table width="100%" cellpadding="0" cellspacing="5" style="margin-bottom: 20px;">/g, '<table width="1200" cellpadding="0" cellspacing="5" style="margin-bottom: 20px; table-layout: fixed; width: 1200px; min-width: 1200px;">');

// Set specific widths for table cells (TDs)
html = html.replace(/width="25%"/g, 'width="300" style="width: 300px; max-width: 300px; overflow: hidden; word-break: break-word;"');
html = html.replace(/width="20%"/g, 'width="240" style="width: 240px; max-width: 240px; overflow: hidden; word-break: break-word;"');
html = html.replace(/width="33%"/g, 'width="400" style="width: 400px; max-width: 400px; overflow: hidden; word-break: break-word;"');
html = html.replace(/width="100%" valign="top"/g, 'width="1200" style="width: 1200px; max-width: 1200px; overflow: hidden; word-break: break-word;" valign="top"');

fs.writeFileSync('frontend/public/DailySalesEmailTemplate.html', html);
console.log('Fixed email layout successfully!');
