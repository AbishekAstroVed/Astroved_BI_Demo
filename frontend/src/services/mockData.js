// Deterministic helper to generate stable values based on input dates
const getSeedForDates = (start, end) => {
  const s = String(start) + String(end);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getSeededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const formatDollar = (val) => { if (val === undefined || val === null) return '$ 0.00'; return '$ ' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

export const formatTaka = (val) => {
  if (val === undefined || val === null) return '₹ 0';
  return '₹ ' + Math.round(val).toLocaleString('en-IN');
};

export const formatCurrency = (val, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
  const sym = symbols[currency] || '$';
  if (val >= 1000000) return `${sym}${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${sym}${(val / 1000).toFixed(1)}K`;
  return `${sym}${val.toFixed(0)}`;
};


export const getExecutiveData = (startDate, endDate, compareEnabled, getCompareDates) => {
  // Static-like realistic values as seen in the mockup, but slightly dynamic if needed
  return {
    kpi: {
      dailyRevenue: { current: 1245230, compChange: 12.5 },
      mtdRevenue: { current: 32875900, compChange: 18.7 },
      ytdRevenue: { current: 324512600, compChange: 24.3 },
      orders: { current: 8542, compChange: 11.3 },
      conversionRate: { current: 3.62, compChange: 0.48 },
      forecast: { current: 425000000, compChange: 15.6 },
      target: { current: 425000000, pct: 82.4 }
    },
    // Chart data for Revenue Overview (Line chart)
    revenueTrend: [
      { date: 'May 13', revenue: 1200000, orders: 820 },
      { date: 'May 14', revenue: 1500000, orders: 950 },
      { date: 'May 15', revenue: 1350000, orders: 890 },
      { date: 'May 16', revenue: 1600000, orders: 1100 },
      { date: 'May 17', revenue: 1450000, orders: 980 },
      { date: 'May 18', revenue: 1900000, orders: 1250 },
      { date: 'May 19', revenue: 1750000, orders: 1150 }
    ],
    // Donut chart: Revenue by Category
    categories: [
      { name: 'Puja Services', value: 38.4, raw: 12624345 },
      { name: 'Gemstones', value: 24.7, raw: 8120347 },
      { name: 'Consultation', value: 18.1, raw: 5950537 },
      { name: 'Products', value: 12.6, raw: 4142363 },
      { name: 'Others', value: 6.2, raw: 2038308 }
    ],
    // Donut chart: Revenue by Channel
    channels: [
      { name: 'Organic', value: 42.5, raw: 13972257 },
      { name: 'Paid Ads', value: 28.3, raw: 9303880 },
      { name: 'Direct', value: 15.6, raw: 5128640 },
      { name: 'Email', value: 7.8, raw: 2564320 },
      { name: 'Social', value: 5.8, raw: 1906803 }
    ],
    // Top Selling Products
    topProducts: [
      { id: 1, name: 'Rudraksha Mala', revenue: 4578900, orders: 1254 },
      { id: 2, name: 'Gemstone Ring', revenue: 3244600, orders: 982 },
      { id: 3, name: 'Navagraha Puja', revenue: 2875300, orders: 735 },
      { id: 4, name: 'Lal Kitab Report', revenue: 2218700, orders: 621 },
      { id: 5, name: 'Birth Chart', revenue: 1832400, orders: 512 }
    ],
    // Recent Orders
    recentOrders: [
      { id: '#AVD12548', customer: 'Rahul Sharma', amount: 5450, status: 'Paid', time: '10 min ago' },
      { id: '#AVD12547', customer: 'Priya Patel', amount: 3250, status: 'Paid', time: '25 min ago' },
      { id: '#AVD12546', customer: 'Sandeep Verma', amount: 8950, status: 'Paid', time: '40 min ago' },
      { id: '#AVD12545', customer: 'Ananya Singh', amount: 2150, status: 'Pending', time: '1 hr ago' },
      { id: '#AVD12544', customer: 'Amit Mishra', amount: 4780, status: 'Paid', time: '2 hr ago' }
    ],
    // Revenue vs Target (Bar chart comparison)
    targetComparison: [
      { week: 'Week 1', revenue: 6500000, target: 8000000 },
      { week: 'Week 2', revenue: 7800000, target: 8000000 },
      { week: 'Week 3', revenue: 8400000, target: 8500000 },
      { week: 'Week 4', revenue: 9100000, target: 8500000 },
      { week: 'Week 5', revenue: 9500000, target: 9000000 }
    ],
    // Traffic overview
    traffic: {
      metrics: {
        organic: { count: 125430, change: 15.4 },
        paid: { count: 85230, change: 22.1 },
        total: { count: 210660, change: 18.7 },
        bounce: { count: 32.6, change: -5.3 }
      },
      trend: [10000, 12000, 11000, 13000, 12500, 15000, 14000]
    }
  };
};

export const getSalesData = (startDate, endDate) => {
  return {
    salesKpiData: {
      dailyRevenue: { current: 0, compChange: 0 },
      mtdRevenue: { current: 0, compChange: 0 },
      ytdRevenue: { current: 0, compChange: 0 },
      orders: { current: 0, compChange: 0 },
      conversionRate: { current: 0, compChange: 0 },
      forecast: { current: 0, compChange: 0 },
      target: { current: 0, pct: 0 }
    },
    todayRevenueCards: [],
    monthRevenueCards: [],
    categories: [],
    countries: [],
    currencies: [],
    bestSellers: [],
    lowPerformers: [],
    eventSales: [],
    revenueSource: [],
    specialsStoreItems: [],
    quarterSpecials: []
  };
};

export const getMarketingData = (startDate, endDate) => {
  return {
    trafficSplit: [
      { name: 'Organic Search', value: 125430 },
      { name: 'Google Ads Paid', value: 85230 },
      { name: 'Meta Ads Paid', value: 68420 },
      { name: 'Direct / Email', value: 31280 },
      { name: 'Social Organic', value: 15640 },
    ],
    revenueBySource: [
      { source: 'Google Ads Paid Search', revenue: 5586000 },
      { source: 'Meta Ads (FB/IG)', revenue: 4928000 },
      { source: 'Organic Search (SEO)', revenue: 14500000 },
      { source: 'Email & Newsletters', revenue: 5400000 },
      { source: 'CRM Push Notifications', revenue: 3800000 },
      { source: 'Direct Visitors', revenue: 2800000 },
    ],
    roas: '4.29',
    adSpend: 2450000,
    metaAdsData: {
      connected: true,
      accountName: 'AstroVed Meta Business Account',
      adAccountId: 'act_1092837465',
      pixelId: '123456789012345',
      totalSpend: 1120000,
      totalRevenue: 4928000,
      roas: 4.4,
      impressions: 2450800,
      clicks: 98400,
      ctr: 4.01,
      cpc: 11.38,
      cpm: 457.00,
      conversions: 8420,
      placementBreakdown: [
        { placement: 'Instagram Stories & Reels', spend: 480000, conversions: 3840, roas: 4.8 },
        { placement: 'Facebook News Feed', spend: 390000, conversions: 2950, roas: 4.3 },
        { placement: 'Instagram Feed', spend: 180000, conversions: 1210, roas: 4.1 },
        { placement: 'Audience Network & Video', spend: 70000, conversions: 420, roas: 3.2 }
      ],
      campaigns: [
        { id: 'm-cmp-1', name: 'Navagraha Puja Festival Retargeting', status: 'ACTIVE', platform: 'Meta Ads', spend: 420000, impressions: 980000, clicks: 44100, conversions: 3780, roas: 5.1, ctr: 4.5, cpc: 9.52 },
        { id: 'm-cmp-2', name: 'AstroVed Mobile App Install - IG Reels', status: 'ACTIVE', platform: 'Meta Ads', spend: 350000, impressions: 820000, clicks: 31160, conversions: 2480, roas: 4.2, ctr: 3.8, cpc: 11.23 },
        { id: 'm-cmp-3', name: 'Rahu Ketu Transit Horoscope Campaign', status: 'ACTIVE', platform: 'Meta Ads', spend: 220000, impressions: 450000, clicks: 16200, conversions: 1540, roas: 3.9, ctr: 3.6, cpc: 13.58 },
        { id: 'm-cmp-4', name: 'Parihara Homam Lookalike Audience', status: 'PAUSED', platform: 'Meta Ads', spend: 130000, impressions: 200800, clicks: 6940, conversions: 620, roas: 3.3, ctr: 3.46, cpc: 18.73 }
      ]
    },
    googleAdsData: {
      connected: true,
      accountName: 'AstroVed Google Ads MCC',
      customerId: '123-456-7890',
      developerToken: '••••••••',
      totalSpend: 1330000,
      totalRevenue: 5586000,
      roas: 4.2,
      impressions: 1840000,
      clicks: 112500,
      ctr: 6.11,
      cpc: 11.82,
      qualityScoreAvg: 8.4,
      conversions: 9750,
      networkBreakdown: [
        { network: 'Google Search Network (PPC)', spend: 780000, conversions: 6240, roas: 4.6 },
        { network: 'YouTube Video Ads', spend: 320000, conversions: 2110, roas: 3.8 },
        { network: 'Google Display Network (GDN)', spend: 150000, conversions: 980, roas: 3.5 },
        { network: 'Performance Max (PMax)', spend: 80000, conversions: 420, roas: 4.1 }
      ],
      keywords: [
        { keyword: 'online astrology reading', matchType: 'EXACT', clicks: 24500, cpc: 12.4, conversions: 2150, qualityScore: 9 },
        { keyword: 'homam puja booking online', matchType: 'PHRASE', clicks: 18900, cpc: 10.8, conversions: 1820, qualityScore: 9 },
        { keyword: 'horoscope matching free', matchType: 'BROAD', clicks: 31200, cpc: 7.5, conversions: 1650, qualityScore: 8 },
        { keyword: 'best astrologer near me', matchType: 'PHRASE', clicks: 14200, cpc: 15.2, conversions: 1120, qualityScore: 8 }
      ],
      campaigns: [
        { id: 'g-cmp-1', name: 'Brand Search - AstroVed Official', status: 'ACTIVE', platform: 'Google Ads', spend: 480000, impressions: 520000, clicks: 48000, conversions: 4560, roas: 5.4, ctr: 9.23, cpc: 10.00 },
        { id: 'g-cmp-2', name: 'Vedic Astrology Puja Services PPC', status: 'ACTIVE', platform: 'Google Ads', spend: 410000, impressions: 480000, clicks: 32800, conversions: 2870, roas: 4.1, ctr: 6.83, cpc: 12.50 },
        { id: 'g-cmp-3', name: 'YouTube Transit Prediction Video Ads', status: 'ACTIVE', platform: 'Google Ads', spend: 320000, impressions: 640000, clicks: 23600, conversions: 1720, roas: 3.6, ctr: 3.68, cpc: 13.56 },
        { id: 'g-cmp-4', name: 'Display Remarketing - Cart Abandoners', status: 'PAUSED', platform: 'Google Ads', spend: 120000, impressions: 200000, clicks: 8100, conversions: 600, roas: 3.2, ctr: 4.05, cpc: 14.81 }
      ]
    }
  };
};


export const getSEOData = (startDate, endDate) => {
  return {
    kpis: {
      clicks: 185000,
      impressions: 2450000,
      ctr: '7.55',
      position: '4.2'
    },
    keywords: [
      { word: 'astrology consultation', clicks: 24500, impressions: 210000, ctr: '11.6%', pos: 2.1 },
      { word: 'online pooja booking', clicks: 18200, impressions: 195000, ctr: '9.3%', pos: 3.4 },
    ],
    landingPages: [
      { page: '/consultation/astrologer-live', clicks: 42000, ctr: '14.2%' },
    ],
    winners: [
      { keyword: 'shani transition report 2026', change: '+14 ranks', current: 3 },
    ],
    losers: [
      { keyword: 'free kundli chart', change: '-9 ranks', current: 15 },
    ]
  };
};

export const getCustomerData = (startDate, endDate) => {
  return {
    users: [
      { name: 'New Users', value: 28000 },
      { name: 'Returning Users', value: 14000 },
    ],
    clv: [
      { range: '$10 - $50', users: 22000 },
      { range: '$50 - $150', users: 14000 },
    ],
    repeatPurchaseRate: '34.5',
    retentionRate: [
      { month: 'Month 1', rate: 100 },
      { month: 'Month 2', rate: 74 },
    ]
  };
};

export const getFunnelData = (startDate, endDate) => {
  return [
    { step: 'Visitor', count: 350000, pctOfPrev: 100, pctOfTotal: 100 },
    { step: 'Registration', count: 147000, pctOfPrev: 42, pctOfTotal: 42 },
    { step: 'Product View', count: 111720, pctOfPrev: 76, pctOfTotal: 32 },
    { step: 'Add to Cart', count: 35750, pctOfPrev: 32, pctOfTotal: 10 },
    { step: 'Checkout', count: 25740, pctOfPrev: 72, pctOfTotal: 7.4 },
    { step: 'Payment', count: 22650, pctOfPrev: 88, pctOfTotal: 6.5 },
    { step: 'Purchase', count: 21290, pctOfPrev: 94, pctOfTotal: 6.1 }
  ];
};

export const getOperationsData = (startDate, endDate) => {
  return {
    paymentSuccess: '94.2',
    paymentFailureReasons: [
      { reason: 'User Cancelled', count: 480 },
      { reason: 'Bank Server Downtime', count: 320 },
    ],
    refunds: {
      count: 120,
      amount: 850000,
      rate: '2.1'
    },
    bookings: {
      total: 2800,
      completed: 2576,
      pending: 168,
      cancelled: 56
    },
    fulfillment: {
      totalOrders: 15420,
      shipped: 14200,
      pending: 1220
    },
    supportTickets: {
      raised: 850,
      resolved: 780,
      pending: 70,
      avgResolutionTime: '4.2 hrs'
    },
    refundReasons: [
      { reason: 'Service Delay', count: 45 },
      { reason: 'Customer Dissatisfaction', count: 30 },
      { reason: 'Accidental Purchase', count: 25 },
      { reason: 'Fraudulent Transaction', count: 20 },
    ],
    chargebacks: {
      count: 15,
      amount: 45000,
      rate: '0.2'
    },
    services: [
      { name: 'Consultation Video Engine', status: 'Healthy', latency: '42ms' },
      { name: 'Payment Gateway API', status: 'Healthy', latency: '120ms' },
      { name: 'Order Processing Engine', status: 'Healthy', latency: '85ms' },
    ]
  };
};

export const getAIInsights = (startDate, endDate) => {
  return [
    {
      id: 'AI-001',
      type: 'increase',
      title: 'Consultation Revenue Spike in US market',
      summary: 'Revenue from US Astrology Consultations increased by 24.8% over the selected period.',
      cause: 'Driven by high demand for the new "Yearly Career Forecast" report and Google Ads campaign optimization targeting high-intent US audiences.',
      actions: [
        'Increase daily ad-spend budget on Career Consultation keywords by 15%.',
        'Send promotional emails offering a bundle of Report + Call to prior buyers.'
      ]
    }
  ];
};
