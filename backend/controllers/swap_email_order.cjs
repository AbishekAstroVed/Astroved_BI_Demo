const fs = require('fs');
const filePath = 'c:\\\\Users\\\\Abishek\\\\Demo_AstroVed_BI\\\\backend\\\\controllers\\\\adminController.js';
let content = fs.readFileSync(filePath, 'utf8');

const regexA = /    if \(dashboards\.includes\('NewsletterEmailTemplate\.html'\)\) \{[\s\S]*?console\.error\('Error processing custom template:', err\);\r?\n      \}\r?\n    \}/;
const matchA = content.match(regexA);

const regexB = /    if \(dashboards\.includes\('DailySalesEmailTemplate\.html'\)\) \{[\s\S]*?console\.error\('Error processing DailySales template:', err\);\r?\n      \}\r?\n    \}/;
const matchB = content.match(regexB);

if (!matchA || !matchB) {
  console.log("Could not find blocks");
  process.exit(1);
}

const blockA = matchA[0];
const blockB = matchB[0];

const idxA = content.indexOf(blockA);
const idxB = content.indexOf(blockB);

if (idxA < idxB) {
  const beforeA = content.substring(0, idxA);
  const between = content.substring(idxA + blockA.length, idxB);
  const afterB = content.substring(idxB + blockB.length);
  
  const newContent = beforeA + blockB + between + blockA + afterB;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("Swapped blocks successfully");
} else {
  console.log("Blocks are already in the correct order or not found in expected order");
}
