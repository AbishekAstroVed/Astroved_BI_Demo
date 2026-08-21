const fs = require('fs');
const path = 'c:/Users/Abishek/Demo_AstroVed_BI/backend/controllers/dashboardController.js';

let content = fs.readFileSync(path, 'utf8');

// Replace PAI.EventName AS EventName with the Regular Store Item fallback
content = content.replace(/PAI\.EventName AS EventName/g, 
  "CASE WHEN PAI.EventName IS NOT NULL AND LEN(LTRIM(RTRIM(PAI.EventName))) > 0 THEN PAI.EventName ELSE 'Regular Store Item' END AS EventName");

// Remove the EventName filter from query 5
content = content.replace(/SELECT EventName as name, COUNT\(DISTINCT OrderId\) as quantity, SUM\(NetRevenue\) as revenue \s+FROM BaseData \s+WHERE EventName IS NOT NULL AND LEN\(LTRIM\(RTRIM\(EventName\)\)\) > 0\s+GROUP BY EventName ORDER BY revenue DESC/g,
`SELECT EventName as name, COUNT(DISTINCT OrderId) as quantity, SUM(NetRevenue) as revenue 
              FROM BaseData GROUP BY EventName ORDER BY revenue DESC`);

// Remove the EventName filter from query 6
content = content.replace(/SELECT EventName as event, ProductName as productName, TrafficCategory as source, SUM\(NetRevenue\) as revenue \s+FROM BaseData \s+WHERE EventName IS NOT NULL AND LEN\(LTRIM\(RTRIM\(EventName\)\)\) > 0\s+GROUP BY EventName, ProductName, TrafficCategory ORDER BY revenue DESC/g,
`SELECT EventName as event, ProductName as productName, TrafficCategory as source, SUM(NetRevenue) as revenue 
              FROM BaseData 
              GROUP BY EventName, ProductName, TrafficCategory ORDER BY revenue DESC`);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete 4');
