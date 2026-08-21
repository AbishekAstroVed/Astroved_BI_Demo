const fs = require('fs');
const path = 'c:/Users/Abishek/Demo_AstroVed_BI/backend/controllers/dashboardController.js';

let content = fs.readFileSync(path, 'utf8');

// Replace the CASE WHEN... back to PAI.EventName AS EventName
content = content.replace(/CASE WHEN PAI\.EventName IS NOT NULL AND LEN\(LTRIM\(RTRIM\(PAI\.EventName\)\)\) > 0 THEN PAI\.EventName ELSE PAT\.Name END AS EventName/g, 
  "PAI.EventName AS EventName");

// Filter out empty EventNames in query 5
content = content.replace(/SELECT EventName as name, COUNT\(DISTINCT OrderId\) as quantity, SUM\(NetRevenue\) as revenue\s+FROM BaseData GROUP BY EventName ORDER BY revenue DESC/g,
`SELECT EventName as name, COUNT(DISTINCT OrderId) as quantity, SUM(NetRevenue) as revenue 
              FROM BaseData 
              WHERE EventName IS NOT NULL AND LEN(LTRIM(RTRIM(EventName))) > 0
              GROUP BY EventName ORDER BY revenue DESC`);

// Filter out empty EventNames in query 6
content = content.replace(/SELECT EventName as event, ProductName as productName, TrafficCategory as source, SUM\(NetRevenue\) as revenue\s+FROM BaseData\s+GROUP BY EventName, ProductName, TrafficCategory ORDER BY revenue DESC/g,
`SELECT EventName as event, ProductName as productName, TrafficCategory as source, SUM(NetRevenue) as revenue 
              FROM BaseData 
              WHERE EventName IS NOT NULL AND LEN(LTRIM(RTRIM(EventName))) > 0
              GROUP BY EventName, ProductName, TrafficCategory ORDER BY revenue DESC`);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete 3');
