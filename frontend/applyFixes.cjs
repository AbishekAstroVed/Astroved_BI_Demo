const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'Executive', 'Executive.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace usages of the individual filter states with cardFilter
const filterStateRegex = /\b(revenueOverviewFilter|categoryFilter|channelFilter|topProductsFilter|recentOrdersFilter|targetComparisonFilter|refundsFilter|cancellationsFilter|trafficFilter)\b/g;
content = content.replace(filterStateRegex, 'cardFilter');

// 2. Replace usages of the individual setter functions with setCardFilter
const filterSetterRegex = /\b(setRevenueOverviewFilter|setCategoryFilter|setChannelFilter|setTopProductsFilter|setRecentOrdersFilter|setTargetComparisonFilter|setRefundsFilter|setCancellationsFilter|setTrafficFilter)\b/g;
content = content.replace(filterSetterRegex, 'setCardFilter');

// 3. Consolidate 9 cardFilter useState lines into one
const declarationRegex = /(const \[cardFilter, setCardFilter\] = useState\('[^']+'\);\s*){9}/;
content = content.replace(declarationRegex, "const [cardFilter, setCardFilter] = useState('This Month');\n");

// 4. Update the line 15 to include datePreset and selectPreset
content = content.replace(
  "const { startDate, endDate, compareEnabled, getCompareDates } = useDateFilter();",
  "const { startDate, endDate, compareEnabled, getCompareDates, datePreset, selectPreset } = useDateFilter();"
);

// 5. Update the useEffect logic. The original file has a block of 9 set[X]Filters(filterVal) which have now been converted to 9 setCardFilter(filterVal). Let's replace the whole block of 9.
const syncRegex = /(setCardFilter\(filterVal\);\s*){9}/;
content = content.replace(syncRegex, "setCardFilter(filterVal);\n");

// 6. Update the onClick of the export pills
const oldButtonCode = `              <button
                key={period}
                onClick={() => setExportPeriod(period)}
                className={\`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-1 text-[11px] font-medium transition-all \${exportPeriod === period`;

const newButtonCode = `              <button
                key={period}
                onClick={() => {
                  setExportPeriod(period);
                  if (period === 'Daily') selectPreset('today');
                  else if (period === 'Weekly') selectPreset('7days');
                  else if (period === 'Monthly') selectPreset('30days');
                  else if (period === 'Yearly') selectPreset('ytd');
                }}
                className={\`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-1 text-[11px] font-medium transition-all \${exportPeriod === period`;

content = content.replace(oldButtonCode, newButtonCode);

// 7. Update GA4 warning text (from my previous session)
content = content.replace(
  "<span>GA4 Connected (Showing Fallback Mock Data - Google OAuth Token Required)</span>",
  "<span>GA4 Connected (Google OAuth Token Required - Traffic Data Unavailable)</span>"
);

fs.writeFileSync(filePath, content);
console.log('Successfully applied all fixes.');
