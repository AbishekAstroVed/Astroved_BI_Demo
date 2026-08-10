const fs = require('fs');
let content = fs.readFileSync('controllers/dashboardController.js', 'utf8');

content = content.replace(/request\.input\('startDate'/g, "request.input('p_startDate'");
content = content.replace(/request\.input\('endDate'/g, "request.input('p_endDate'");
content = content.replace(/request\.input\('prevStartDate'/g, "request.input('p_prevStartDate'");
content = content.replace(/request\.input\('prevEndDate'/g, "request.input('p_prevEndDate'");

content = content.replace(/CAST\(@startDate AS DATE\)/g, "CAST(@p_startDate AS DATE)");
content = content.replace(/CAST\(@endDate AS DATE\)/g, "CAST(@p_endDate AS DATE)");
content = content.replace(/CAST\(@prevStartDate AS DATE\)/g, "CAST(@p_prevStartDate AS DATE)");
content = content.replace(/CAST\(@prevEndDate AS DATE\)/g, "CAST(@p_prevEndDate AS DATE)");

// If there are other places where the param is injected in template literals
content = content.replace(/\$\{startDate \? 'CAST\(@startDate/g, "${startDate ? 'CAST(@p_startDate");
content = content.replace(/\$\{endDate \? 'CAST\(@endDate/g, "${endDate ? 'CAST(@p_endDate");

fs.writeFileSync('controllers/dashboardController.js', content);
console.log('Fixed dashboardController parameters');
