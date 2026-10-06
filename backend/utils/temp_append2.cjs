const fs = require('fs');
let html = fs.readFileSync('../../frontend/public/DailySalesEmailTemplate.html', 'utf8');

html = html.replace(/width="300" align="center"\n\s*style="width: 300px; max-width: 300px;/g, 'width="25%" align="center"\n              style="');
html = html.replace(/width="240" align="center"\n\s*style="width: 240px; max-width: 240px;/g, 'width="20%" align="center"\n              style="');
html = html.replace(/width="240"\n\s*style="width: 240px; max-width: 240px;/g, 'width="20%"\n              style="');
html = html.replace(/width="400" valign="top"\n\s*style="width: 400px; max-width: 400px;/g, 'width="33.33%" valign="top"\n              style="');
html = html.replace(/width="1200" valign="top"\n\s*style="width: 1200px; max-width: 1200px;/g, 'width="100%" valign="top"\n              style="');

fs.writeFileSync('../../frontend/public/DailySalesEmailTemplate.html', html);
console.log('Fixed percentage widths successfully.');
