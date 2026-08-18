const fs = require('fs');

const path = 'src/modules/Newsletter/Newsletter.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add isExportingPDF state and handlers
const stateCode = `
  const eventsComparedPage = usePagination(eventsCompared || [], 10);

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handlePrepareExport = (type) => {
    if (type === 'PDF') {
      setIsExportingPDF(true);
      return new Promise(resolve => setTimeout(resolve, 800));
    }
    return Promise.resolve();
  };

  const handleRestoreExport = (type) => {
    if (type === 'PDF') {
      setIsExportingPDF(false);
    }
  };
`;
content = content.replace("  const eventsComparedPage = usePagination(eventsCompared || [], 10);", stateCode);

// Add id="dashboard-export-area" to root div
content = content.replace('<div className="space-y-6">', '<div id="dashboard-export-area" className="space-y-6">');

// Extract ExportReportsCard
const exportRegex = /\{\/\*\s*Export Reports Component\s*\*\/\}\s*<div className="mt-8">\s*(<ExportReportsCard[\s\S]*?\/>)\s*<\/div>/m;
const match = content.match(exportRegex);

if (match) {
    let exportCardJsx = match[1];
    // Modify it to add onPrepareExport and onRestoreExport and variant="inline"
    exportCardJsx = exportCardJsx.replace('/>', ' variant="inline" onPrepareExport={handlePrepareExport} onRestoreExport={handleRestoreExport} />');

    // Remove old ExportReportsCard
    content = content.replace(match[0], '');

    // Insert ExportReportsCard at the top above Filters Row
    const topBanner = `
      <div className="relative w-full flex flex-col md:flex-row justify-center items-center gap-4 mb-4 z-50">
        <div className="text-cosmic-text text-center font-bold text-base tracking-wide flex-1">
          Newsletter Dashboard
        </div>
        <div className="md:absolute md:right-0">
          ${exportCardJsx}
        </div>
      </div>
`;
    content = content.replace('{/* Filters Row */}', topBanner + '\n      {/* Filters Row */}');
} else {
    console.log("Could not find ExportReportsCard");
}

// Now replace paginations
const paginations = [
    ['categorySalesPage', 'categorySales'],
    ['dateWisePerformancePage', 'dateWisePerformance'],
    ['overallPerformanceDataPage', 'overallPerformanceData'],
    ['breakupSummaryPage', 'breakupSummary'],
    ['typesComparedPage', 'typesCompared'],
    ['overallEventsDataPage', 'overallEventsData'],
    ['specialEventsDataPage', 'specialEventsData'],
    ['specialEventsPerformanceDataPage', 'specialEventsPerformanceData'],
    ['eventsComparedPage', 'eventsCompared'],
];

for (const [pageVar, dataVar] of paginations) {
    content = content.split(`${pageVar}.currentData`).join(`(isExportingPDF ? (${dataVar} || []) : ${pageVar}.currentData)`);
    content = content.split(`<Pagination {...${pageVar}} />`).join(`{!isExportingPDF && <Pagination {...${pageVar}} />}`);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
