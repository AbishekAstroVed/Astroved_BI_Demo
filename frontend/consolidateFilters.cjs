const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'Executive', 'Executive.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace usages of the individual filter states
const filterStateRegex = /\b(revenueOverviewFilter|categoryFilter|channelFilter|topProductsFilter|recentOrdersFilter|targetComparisonFilter|refundsFilter|cancellationsFilter|trafficFilter)\b/g;
content = content.replace(filterStateRegex, 'cardFilter');

// Replace usages of the individual setter functions
const filterSetterRegex = /\b(setRevenueOverviewFilter|setCategoryFilter|setChannelFilter|setTopProductsFilter|setRecentOrdersFilter|setTargetComparisonFilter|setRefundsFilter|setCancellationsFilter|setTrafficFilter)\b/g;
content = content.replace(filterSetterRegex, 'setCardFilter');

// Now, the state declarations will look like:
// const [cardFilter, setCardFilter] = useState('...');
// We have 9 of them in a row. Let's collapse them into one.

const declarationRegex = /(const \[cardFilter, setCardFilter\] = useState\('[^']+'\);\s*){9}/;
content = content.replace(declarationRegex, "const [cardFilter, setCardFilter] = useState('This Month');\n");

// Also, the useEffect that syncs from global calendar will have 9 setCardFilter(filterVal) in a row.
const syncRegex = /(setCardFilter\(filterVal\);\s*){9}/;
content = content.replace(syncRegex, "setCardFilter(filterVal);\n");

fs.writeFileSync(filePath, content);
console.log('Successfully consolidated filters.');
