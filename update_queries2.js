const fs = require('fs');
const path = 'c:/Users/Abishek/Demo_AstroVed_BI/backend/controllers/dashboardController.js';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(/ISNULL\(PAI\.EventName, PAT\.Name\) AS EventName/g, 
  "CASE WHEN PAI.EventName IS NOT NULL AND LEN(LTRIM(RTRIM(PAI.EventName))) > 0 THEN PAI.EventName ELSE PAT.Name END AS EventName");

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete 2');
