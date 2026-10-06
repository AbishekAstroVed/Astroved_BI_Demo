const fs = require('fs');
let c = fs.readFileSync('utils/emailUtils.js', 'utf8');
c = c.replace(/\\`"AstroVed BI" <\\\${fromEmail}>\\`/g, '`"AstroVed BI" <${fromEmail}>`');
c = c.replace(/\\`AstroVed BI: Daily Sales Insights - \\\${templateData.report_date}\\`/g, '`AstroVed BI: Daily Sales Insights - ${templateData.report_date}`');
fs.writeFileSync('utils/emailUtils.js', c, 'utf8');
