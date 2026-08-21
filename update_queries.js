const fs = require('fs');
const path = 'c:/Users/Abishek/Demo_AstroVed_BI/backend/controllers/dashboardController.js';

let content = fs.readFileSync(path, 'utf8');

// The replacement adds ISNULL(PAI.EventName, PAT.Name) AS EventName and the LEFT JOIN
// and then updates the SELECT from BaseData to use EventName

// We need to carefully replace the exact queries for Daily and Monthly.
// 5. Daily Sales By Event Name and 6. Daily Revenue Source as per Event
// 5. Monthly Sales By Event Name and 6. Monthly Revenue Source as per Event

// A safer approach using regex to find and replace the CTE SELECT and the JOINs

content = content.replace(/ORD\.OrderId, PAT\.Name AS ProductName,(\s+)(CASE[\s\S]*?END AS TrafficCategory,)?(\s*)\(POD\.USDPrice/g, (match, p1, p2, p3) => {
    return `ORD.OrderId, PAT.Name AS ProductName, ISNULL(PAI.EventName, PAT.Name) AS EventName,${p1}${p2 || ''}${p3}(POD.USDPrice`;
});

content = content.replace(/INNER JOIN Vaaak\.ProductAdditionalTranslation PAT WITH \(NOLOCK\) ON PT\.ProductAdditionalTransId = PAT\.ProductAdditionalTransId/g, 
`INNER JOIN Vaaak.ProductAdditionalTranslation PAT WITH (NOLOCK) ON PT.ProductAdditionalTransId = PAT.ProductAdditionalTransId 
                LEFT JOIN Vaaak.ProductAdditionalInfo PAI WITH (NOLOCK) ON P.ProductId = PAI.ProductId`);

content = content.replace(/SELECT ProductName as name, COUNT\(DISTINCT OrderId\) as quantity, SUM\(NetRevenue\) as revenue\s+FROM BaseData GROUP BY ProductName ORDER BY revenue DESC/g,
`SELECT EventName as name, COUNT(DISTINCT OrderId) as quantity, SUM(NetRevenue) as revenue 
              FROM BaseData GROUP BY EventName ORDER BY revenue DESC`);

content = content.replace(/SELECT ProductName as event, TrafficCategory as source, SUM\(NetRevenue\) as revenue\s+FROM BaseData\s+GROUP BY ProductName, TrafficCategory ORDER BY revenue DESC/g,
`SELECT EventName as event, ProductName as productName, TrafficCategory as source, SUM(NetRevenue) as revenue 
              FROM BaseData 
              GROUP BY EventName, ProductName, TrafficCategory ORDER BY revenue DESC`);

// Also update the mapped object to include productName for source queries
content = content.replace(/revenueSource = result\.recordset\.map\(\(r, idx\) => \(\{ id: idx \+ 1, name: r\.event, source: r\.source, revenue: r\.revenue \|\| 0 \}\)\);/g,
`revenueSource = result.recordset.map((r, idx) => ({ id: idx + 1, name: r.event, eventName: r.event, productName: r.productName, source: r.source, revenue: r.revenue || 0 }));`);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete');
