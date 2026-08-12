import React, { useState, useEffect } from 'react';
import EChartWrapper from '../../charts/EChartWrapper';
import { formatDollar } from '../../services/mockData';
import { useDateFilter } from '../../contexts/DateFilterContext';
import {
  Target, Download, FileSpreadsheet, FileText, FilePlus, Sparkles, Loader2, Calendar, Database, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

const Executive = () => {
  const { startDate, endDate, compareEnabled, getCompareDates, selectPreset, datePreset } = useDateFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQueryModal, setShowQueryModal] = useState(false);

  // States for card-level dropdown filters
  const [revenueOverviewFilter, setRevenueOverviewFilter] = useState('This Week');
  const [categoryFilter, setCategoryFilter] = useState('This Month');
  const [channelFilter, setChannelFilter] = useState('This Month');
  const [topProductsFilter, setTopProductsFilter] = useState('This Month');
  const [recentOrdersFilter, setRecentOrdersFilter] = useState('This Month');
  const [targetComparisonFilter, setTargetComparisonFilter] = useState('This Month');
  const [refundsFilter, setRefundsFilter] = useState('This Week');
  const [cancellationsFilter, setCancellationsFilter] = useState('This Week');
  const [trafficFilter, setTrafficFilter] = useState('This Month');
  const [exportPeriod, setExportPeriod] = useState('Daily');

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync export period to individual dropdowns
  useEffect(() => {
    let filterVal = 'This Week';
    if (exportPeriod === 'Daily') {
      filterVal = 'Today';
    } else if (exportPeriod === 'Weekly') {
      filterVal = 'This Week';
    } else if (exportPeriod === 'Monthly') {
      filterVal = 'This Month';
    } else if (exportPeriod === 'Yearly') {
      filterVal = 'This Year';
    }

    setRevenueOverviewFilter(filterVal);
    setCategoryFilter(filterVal);
    setChannelFilter(filterVal);
    setTopProductsFilter(filterVal);
    setRecentOrdersFilter(filterVal);
    setTargetComparisonFilter(filterVal);
    setRefundsFilter(filterVal);
    setCancellationsFilter(filterVal);
    setTrafficFilter(filterVal);
  }, [exportPeriod]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.getExecutiveDashboard(startDate, endDate);
        if (active) {
          setData(result);
        }
      } catch (err) {
        console.error('Failed to load executive dashboard data:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [startDate, endDate]);

  const topProductsPage = usePagination(
    data ? (
      topProductsFilter === 'Today' || topProductsFilter === 'Daily' ? data.topProductsDay :
        topProductsFilter === 'This Week' || topProductsFilter === 'Weekly' ? data.topProductsWeek :
          topProductsFilter === 'This Month' || topProductsFilter === 'Monthly' ? data.topProductsMonth :
            data.topProductsYear
    ) || [] : [],
    10
  );

  const recentOrdersPage = usePagination(
    data ? (
      recentOrdersFilter === 'Today' || recentOrdersFilter === 'Daily' ? data.recentOrdersDay :
        recentOrdersFilter === 'This Week' || recentOrdersFilter === 'Weekly' ? data.recentOrdersWeek :
          recentOrdersFilter === 'This Month' || recentOrdersFilter === 'Monthly' ? data.recentOrdersMonth :
            data.recentOrdersYear
    ) || [] : [],
    10
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="text-cosmic-muted font-medium animate-pulse">Loading Executive Dashboard Data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 overflow-auto bg-[#f8fafc]">
        <div className="p-8 text-center text-slate-500">Failed to load data. Please try again.</div>
      </div>
    );
  }

  const activeData = data;
  const {
    kpi,
    revenueTrendDay,
    revenueTrendWeek,
    revenueTrendMonth,
    revenueTrendYear,
    trendWeekPrev,
    trendMonthPrev,
    trendYearPrev,
    refundsDay,
    refundsWeek,
    refundsMonth,
    refundsYear,
    cancellationsDay,
    cancellationsWeek,
    cancellationsMonth,
    cancellationsYear,
    categoriesDay,
    categoriesWeek,
    categoriesMonth,
    categoriesYear,
    channelsDay,
    channelsWeek,
    channelsMonth,
    channelsYear,
    topProductsDay,
    topProductsWeek,
    topProductsMonth,
    topProductsYear,
    recentOrdersDay,
    recentOrdersWeek,
    recentOrdersMonth,
    recentOrdersYear,
    targetComparison,
    traffic,
    trafficDay,
    trafficWeek,
    trafficMonth,
    trafficYear
  } = activeData;

  const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
  const showRevenue = !userPermissions || !userPermissions.data || userPermissions.data.viewRevenue !== false;

  const handleQuickDownload = async (reportName) => {
    if (userPermissions?.data?.download === false) {
      toast.error('Access Denied: Your role profile does not have permission to Download files.');
      return;
    }

    const reportTypeMap = {
      'Daily Report': { type: 'daily', collection: 'users' },
      'Weekly Report': { type: 'weekly', collection: 'kpis' },
      'Monthly Report': { type: 'monthly', collection: 'targets' },
      'Quarterly Report': { type: 'quarterly', collection: 'schedules' },
      'Yearly Report': { type: 'yearly', collection: 'audit' }
    };

    const report = reportTypeMap[reportName];
    if (!report) {
      toast.error('Unknown report type');
      return;
    }

    toast.success(`Downloading ${reportName}...`);

    try {
      const url = `${api.exportCollectionUrl(report.collection, 'csv')}&duration=${report.type}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `astroved_${report.type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await api.createAuditLog({
        user: 'Super Admin',
        action: `Downloaded ${reportName}`,
        module: 'Executive Dashboard',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      }).catch(err => console.error("Audit log failed:", err));

    } catch (err) {
      console.error(err);
      toast.error(`Failed to download ${reportName}`);
    }
  };

  // Helper function to scale Y-axis labels dynamically
  const formatYAxis = (val) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val;
  };

  // --- Dynamic Data Mappings based on Filters ---

  // 1. Revenue Overview Trend
  const getRevenueOverviewData = (filterOverride) => {
    const filter = filterOverride || revenueOverviewFilter;
    if (filter === 'Today' || filter === 'Daily') {
      return { curr: revenueTrendDay || [], prev: [] }; // No prev day comparison currently
    }
    if (filter === 'This Week' || filter === 'Weekly') {
      return { curr: revenueTrendWeek || [], prev: trendWeekPrev || [] };
    }
    if (filter === 'This Month' || filter === 'Monthly') {
      return { curr: revenueTrendMonth || [], prev: trendMonthPrev || [] };
    }
    // This Year / Yearly
    return { curr: revenueTrendYear || [], prev: trendYearPrev || [] };
  };
  const { curr: currentRevenueTrend, prev: prevRevenueTrend } = getRevenueOverviewData();

  // 1b. Refunds
  const getRefundsData = (filterOverride) => {
    const filter = filterOverride || refundsFilter;
    if (filter === 'Today' || filter === 'Daily') return refundsDay || [];
    if (filter === 'This Week' || filter === 'Weekly') return refundsWeek || [];
    if (filter === 'This Month' || filter === 'Monthly') return refundsMonth || [];
    return refundsYear || [];
  };
  const currentRefunds = getRefundsData();

  // 1c. Cancellations
  const getCancellationsData = (filterOverride) => {
    const filter = filterOverride || cancellationsFilter;
    if (filter === 'Today' || filter === 'Daily') return cancellationsDay || [];
    if (filter === 'This Week' || filter === 'Weekly') return cancellationsWeek || [];
    if (filter === 'This Month' || filter === 'Monthly') return cancellationsMonth || [];
    return cancellationsYear || [];
  };
  const currentCancellations = getCancellationsData();

  // 2. Revenue by Category
  const getCategoryData = (filterOverride) => {
    const filter = filterOverride || categoryFilter;
    if (filter === 'Today' || filter === 'Daily') {
      return categoriesDay || [];
    }
    if (filter === 'This Week' || filter === 'Weekly') {
      return categoriesWeek || [];
    }
    if (filter === 'This Month' || filter === 'Monthly') {
      return categoriesMonth || [];
    }
    // This Year / Yearly
    return categoriesYear || [];
  };
  const currentCategories = getCategoryData();

  // 3. Revenue by Channel
  const getChannelData = (filterOverride) => {
    const filter = filterOverride || channelFilter;
    let data = [];
    if (filter === 'Today' || filter === 'Daily') {
      data = channelsDay || [];
    } else if (filter === 'This Week' || filter === 'Weekly') {
      data = channelsWeek || [];
    } else if (filter === 'This Month' || filter === 'Monthly') {
      data = channelsMonth || [];
    } else {
      data = channelsYear || [];
    }

    // The user requested to only show Organic, Internal Ads, and Direct.
    // We group all other channels into 'Direct/Unknown'
    const allowed = ['Organic', 'Internal Ads', 'Direct/Unknown'];
    const grouped = data.reduce((acc, curr) => {
      const name = allowed.includes(curr.name) ? curr.name : 'Direct/Unknown';
      const existing = acc.find(c => c.name === name);
      if (existing) {
        existing.raw += curr.raw;
      } else {
        acc.push({ name, raw: curr.raw });
      }
      return acc;
    }, []);

    // Recalculate percentage values
    const total = grouped.reduce((sum, c) => sum + c.raw, 0);
    return grouped.map(c => ({
      ...c,
      value: total > 0 ? ((c.raw / total) * 100).toFixed(1) : 0
    })).sort((a, b) => b.raw - a.raw);
  };
  const currentChannels = getChannelData();

  // 4. Top Selling Products
  const getTopProductsData = (filterOverride) => {
    const filter = filterOverride || topProductsFilter;
    if (filter === 'Today' || filter === 'Daily') {
      return topProductsDay || [];
    }
    if (filter === 'This Week' || filter === 'Weekly') {
      return topProductsWeek || [];
    }
    if (filter === 'This Month' || filter === 'Monthly') {
      return topProductsMonth || [];
    }
    // This Year / Yearly
    return topProductsYear || [];
  };
  const currentTopProducts = getTopProductsData();

  // 5. Recent Orders
  const getRecentOrdersData = (filterOverride) => {
    const filter = filterOverride || recentOrdersFilter;
    if (filter === 'Today' || filter === 'Daily') {
      return recentOrdersDay || [];
    }
    if (filter === 'This Week' || filter === 'Weekly') {
      return recentOrdersWeek || [];
    }
    if (filter === 'This Month' || filter === 'Monthly') {
      return recentOrdersMonth || [];
    }
    // This Year / Yearly
    return recentOrdersYear || [];
  };
  const currentRecentOrders = getRecentOrdersData();

  // 6. Revenue vs Target Comparison
  const getTargetComparisonData = (filterOverride) => {
    const filter = filterOverride || targetComparisonFilter;
    let trendData = [];
    if (filter === 'Today' || filter === 'Daily') {
      trendData = revenueTrendDay || [];
    } else if (filter === 'This Week' || filter === 'Weekly') {
      trendData = revenueTrendWeek || [];
    } else if (filter === 'This Month' || filter === 'Monthly') {
      trendData = revenueTrendMonth || [];
    } else {
      trendData = revenueTrendYear || [];
    }

    return trendData.map(item => ({
      week: item.date, // The x-axis label (date)
      revenue: item.revenue || 0,
      target: Math.round((item.revenue || 0) * 1.15) // Dynamic 15% growth target
    }));
  };
  const currentTargetComparison = getTargetComparisonData();

  // 7. Traffic Overview
  const getTrafficData = (filterOverride) => {
    const filter = filterOverride || trafficFilter;
    if (filter === 'Today' || filter === 'Daily') return trafficDay || traffic;
    if (filter === 'This Week' || filter === 'Weekly') return trafficWeek || traffic;
    if (filter === 'This Month' || filter === 'Monthly') return trafficMonth || traffic;
    return trafficYear || traffic;
  };
  const currentTraffic = getTrafficData();

  const getSafeKPI = (kpiData) => ({
    dailyRevenueCurrent: kpiData?.dailyRevenue?.current ?? 0,
    dailyRevenueChange: kpiData?.dailyRevenue?.compChange ?? 0,
    mtdRevenueCurrent: kpiData?.mtdRevenue?.current ?? 0,
    mtdRevenueChange: kpiData?.mtdRevenue?.compChange ?? 0,
    ytdRevenueCurrent: kpiData?.ytdRevenue?.current ?? 0,
    ytdRevenueChange: kpiData?.ytdRevenue?.compChange ?? 0,
    ordersCurrent: kpiData?.orders?.current ?? 0,
    ordersChange: kpiData?.orders?.compChange ?? 0,
    conversionRateCurrent: kpiData?.conversionRate?.current ?? 0,
    conversionRateChange: kpiData?.conversionRate?.compChange ?? 0,
    forecastCurrent: kpiData?.forecast?.current ?? 0,
    forecastChange: kpiData?.forecast?.compChange ?? 0,
    targetPct: kpiData?.target?.pct ?? 0,
    targetCurrent: kpiData?.target?.current ?? 0,
    customersCurrent: kpiData?.customers?.current ?? 0,
    customersChange: kpiData?.customers?.compChange ?? 0,
  });

  const formatExportDate = (dateVal) => {
    if (!dateVal) return new Date().toISOString().split('T')[0];
    if (typeof dateVal !== 'string') {
      try {
        return new Date(dateVal).toISOString().split('T')[0];
      } catch (e) {
        return new Date().toISOString().split('T')[0];
      }
    }
    const parts = dateVal.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateVal;
  };

  const getExportFileName = (ext) => {
    const now = new Date();
    const dateSuffix = now.toISOString().split('T')[0];
    let name = '';
    if (exportPeriod === 'Daily') {
      name = `Daily_Report_${dateSuffix}`;
    } else if (exportPeriod === 'Weekly') {
      const sDate = formatExportDate(startDate);
      const eDate = formatExportDate(endDate);
      name = `Weekly_Report_${sDate}_to_${eDate}`;
    } else if (exportPeriod === 'Monthly') {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      name = `Monthly_Report_${monthNames[now.getMonth()]}_${now.getFullYear()}`;
    } else if (exportPeriod === 'Yearly') {
      name = `Yearly_Report_${now.getFullYear()}`;
    } else {
      name = `Executive_Report_${dateSuffix}`;
    }
    return `${name}.${ext}`;
  };

  const generateCSVContent = () => {
    const period = exportPeriod;
    const safeKpi = getSafeKPI(kpi);
    const expRevTrend = getRevenueOverviewData(period).curr || [];
    const expCategories = getCategoryData(period) || [];
    const expChannels = getChannelData(period) || [];
    const expTopProducts = getTopProductsData(period) || [];
    const expRecentOrders = getRecentOrdersData(period) || [];
    const expTargetComp = getTargetComparisonData(period) || [];
    const expRefunds = getRefundsData(period) || [];
    const expCancellations = getCancellationsData(period) || [];
    const expTraffic = getTrafficData(period) || {};

    let csv = `AstroVed Executive Dashboard (${period} Report)\n`;
    csv += `Selected Period: ${period}\n`;
    csv += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // KPIs
    csv += `Key Performance Indicators (${period})\n`;
    csv += "KPI,Value,Comparison vs Previous Period\n";
    csv += `Daily Revenue,"${showRevenue ? formatDollar(safeKpi.dailyRevenueCurrent) : 'Restricted'}",+${safeKpi.dailyRevenueChange}% vs Yesterday\n`;
    csv += `MTD Revenue,"${showRevenue ? formatDollar(safeKpi.mtdRevenueCurrent) : 'Restricted'}",+${safeKpi.mtdRevenueChange}% vs Last Month\n`;
    csv += `YTD Revenue,"${showRevenue ? formatDollar(safeKpi.ytdRevenueCurrent) : 'Restricted'}",+${safeKpi.ytdRevenueChange}% vs Last Year\n`;
    csv += `Orders,${safeKpi.ordersCurrent.toLocaleString()},+${safeKpi.ordersChange}% vs Yesterday\n`;
    csv += `Conversion Rate,${safeKpi.conversionRateCurrent}%,+${safeKpi.conversionRateChange}% vs Yesterday\n`;
    csv += `Forecast (This Month),"${showRevenue ? formatDollar(safeKpi.forecastCurrent) : 'Restricted'}",+${safeKpi.forecastChange}% vs Target\n`;
    csv += `Revenue Target Progress,"${showRevenue ? safeKpi.targetPct + '%' : 'Restricted'}",Target: "${showRevenue ? formatDollar(safeKpi.targetCurrent) : 'Restricted'}"\n\n`;

    // Revenue Trend
    csv += `Revenue Trend (${period})\nDate / Period,Revenue ($),Orders\n`;
    expRevTrend.forEach(row => {
      csv += `${row.date || ''},${showRevenue ? (row.revenue || 0) : 'Restricted'},${row.orders || 0}\n`;
    });
    csv += "\n";

    // Revenue by Category
    csv += `Revenue by Category (${period})\nCategory,Percentage,Revenue ($)\n`;
    expCategories.forEach(c => {
      csv += `"${c.name || ''}",${c.value || 0}%,${showRevenue ? (c.raw || 0) : 'Restricted'}\n`;
    });
    csv += "\n";

    // Revenue by Channel
    csv += `Revenue by Channel (${period})\nChannel,Percentage,Revenue ($)\n`;
    expChannels.forEach(c => {
      csv += `"${c.name || ''}",${c.value || 0}%,${showRevenue ? (c.raw || 0) : 'Restricted'}\n`;
    });
    csv += "\n";

    // Top Selling Products
    csv += `Top Selling Products (${period})\nID,Product,Revenue ($),Orders\n`;
    expTopProducts.forEach(prod => {
      csv += `${prod.id || ''},"${prod.name || ''}",${showRevenue ? (prod.revenue || 0) : 'Restricted'},${prod.orders || 0}\n`;
    });
    csv += "\n";

    // Recent Orders
    csv += `Recent Orders (${period})\nOrder ID,Customer,Amount ($),Status,Time\n`;
    expRecentOrders.forEach(ord => {
      csv += `${ord.id || ''},"${ord.customer || ''}",${showRevenue ? (ord.amount || 0) : 'Restricted'},"${ord.status || ''}","${ord.time || ''}"\n`;
    });
    csv += "\n";

    // Revenue vs Target
    csv += `Revenue vs Target (${period})\nPeriod,Revenue ($),Target ($)\n`;
    expTargetComp.forEach(t => {
      csv += `"${t.week || ''}",${showRevenue ? (t.revenue || 0) : 'Restricted'},${showRevenue ? (t.target || 0) : 'Restricted'}\n`;
    });
    csv += "\n";

    // Refunds Trend
    csv += `Refunds Trend (${period})\nDate,Refunds ($)\n`;
    expRefunds.forEach(row => {
      csv += `${row.date || ''},${showRevenue ? (row.revenue || 0) : 'Restricted'}\n`;
    });
    csv += "\n";

    // Cancellations Trend
    csv += `Cancellations Trend (${period})\nDate,Cancellations ($)\n`;
    expCancellations.forEach(row => {
      csv += `${row.date || ''},${showRevenue ? (row.revenue || 0) : 'Restricted'}\n`;
    });
    csv += "\n";

    // Traffic Overview
    csv += `Traffic Overview (${period})\nMetric,Count,Change (%)\n`;
    if (expTraffic && expTraffic.metrics) {
      csv += `Organic Traffic,${expTraffic.metrics.organic?.count || 0},${expTraffic.metrics.organic?.change || 0}\n`;
      csv += `Paid Traffic,${expTraffic.metrics.paid?.count || 0},${expTraffic.metrics.paid?.change || 0}\n`;
      csv += `Total Visitors,${expTraffic.metrics.total?.count || 0},${expTraffic.metrics.total?.change || 0}\n`;
      csv += `Bounce Rate,${expTraffic.metrics.bounce?.count || 0}%,${expTraffic.metrics.bounce?.change || 0}\n`;
    }

    return csv;
  };

  const handleExportCSV = () => {
    try {
      const csvContent = generateCSVContent();
      const bom = "\ufeff";
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const fileName = getExportFileName('csv');
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 500);
      toast.success(`${exportPeriod} CSV report downloaded successfully!`);
    } catch (err) {
      console.error("CSV Export Error:", err);
      toast.error("Failed to export CSV report: " + err.message);
    }
  };

  const handleExportExcel = () => {
    try {
      const period = exportPeriod;
      const safeKpi = getSafeKPI(kpi);
      const expRevTrend = getRevenueOverviewData(period).curr || [];
      const expCategories = getCategoryData(period) || [];
      const expChannels = getChannelData(period) || [];
      const expTopProducts = getTopProductsData(period) || [];
      const expRecentOrders = getRecentOrdersData(period) || [];
      const expTargetComp = getTargetComparisonData(period) || [];
      const expRefunds = getRefundsData(period) || [];
      const expCancellations = getCancellationsData(period) || [];
      const expTraffic = getTrafficData(period) || {};

      const wb = XLSX.utils.book_new();

      // Master Summary Sheet (Array of Arrays)
      const summaryRows = [
        ["AstroVed Executive Dashboard Report"],
        [`Selected Period: ${period}`],
        [`Generated on: ${new Date().toLocaleString()}`],
        [],
        ["--- KEY PERFORMANCE INDICATORS ---"],
        ["KPI", "Value", "Comparison vs Previous Period"],
        ["Daily Revenue", showRevenue ? formatDollar(safeKpi.dailyRevenueCurrent) : 'Restricted', `+${safeKpi.dailyRevenueChange}% vs Yesterday`],
        ["MTD Revenue", showRevenue ? formatDollar(safeKpi.mtdRevenueCurrent) : 'Restricted', `+${safeKpi.mtdRevenueChange}% vs Last Month`],
        ["YTD Revenue", showRevenue ? formatDollar(safeKpi.ytdRevenueCurrent) : 'Restricted', `+${safeKpi.ytdRevenueChange}% vs Last Year`],
        ["Orders", safeKpi.ordersCurrent, `+${safeKpi.ordersChange}% vs Yesterday`],
        ["Conversion Rate", `${safeKpi.conversionRateCurrent}%`, `+${safeKpi.conversionRateChange}% vs Yesterday`],
        ["Forecast (This Month)", showRevenue ? formatDollar(safeKpi.forecastCurrent) : 'Restricted', `+${safeKpi.forecastChange}% vs Target`],
        ["Revenue Target Progress", showRevenue ? `${safeKpi.targetPct}%` : 'Restricted', `Target: ${showRevenue ? formatDollar(safeKpi.targetCurrent) : 'Restricted'}`],
        [],
        ["--- REVENUE TREND ---"],
        ["Date / Period", "Revenue ($)", "Orders"],
        ...expRevTrend.map(row => [row.date || '', showRevenue ? (row.revenue || 0) : 'Restricted', row.orders || 0]),
        [],
        ["--- REVENUE BY CATEGORY ---"],
        ["Category", "Percentage", "Revenue ($)"],
        ...expCategories.map(c => [c.name || '', `${c.value || 0}%`, showRevenue ? (c.raw || 0) : 'Restricted']),
        [],
        ["--- REVENUE BY CHANNEL ---"],
        ["Channel", "Percentage", "Revenue ($)"],
        ...expChannels.map(c => [c.name || '', `${c.value || 0}%`, showRevenue ? (c.raw || 0) : 'Restricted']),
        [],
        ["--- TOP SELLING PRODUCTS ---"],
        ["ID", "Product", "Revenue ($)", "Orders"],
        ...expTopProducts.map(prod => [prod.id || '', prod.name || '', showRevenue ? (prod.revenue || 0) : 'Restricted', prod.orders || 0]),
        [],
        ["--- RECENT ORDERS ---"],
        ["Order ID", "Customer", "Amount ($)", "Status", "Time"],
        ...expRecentOrders.map(ord => [ord.id || '', ord.customer || '', showRevenue ? (ord.amount || 0) : 'Restricted', ord.status || '', ord.time || '']),
        [],
        ["--- REVENUE VS TARGET ---"],
        ["Period", "Revenue ($)", "Target ($)"],
        ...expTargetComp.map(t => [t.week || '', showRevenue ? (t.revenue || 0) : 'Restricted', showRevenue ? (t.target || 0) : 'Restricted']),
        [],
        ["--- REFUNDS TREND ---"],
        ["Date", "Refunds ($)"],
        ...expRefunds.map(row => [row.date || '', showRevenue ? (row.revenue || 0) : 'Restricted']),
        [],
        ["--- CANCELLATIONS TREND ---"],
        ["Date", "Cancellations ($)"],
        ...expCancellations.map(row => [row.date || '', showRevenue ? (row.revenue || 0) : 'Restricted']),
        [],
        ["--- TRAFFIC OVERVIEW ---"],
        ["Metric", "Count", "Change (%)"],
        ["Organic Traffic", expTraffic.metrics?.organic?.count || 0, `${expTraffic.metrics?.organic?.change || 0}%`],
        ["Paid Traffic", expTraffic.metrics?.paid?.count || 0, `${expTraffic.metrics?.paid?.change || 0}%`],
        ["Total Visitors", expTraffic.metrics?.total?.count || 0, `${expTraffic.metrics?.total?.change || 0}%`],
        ["Bounce Rate", `${expTraffic.metrics?.bounce?.count || 0}%`, `${expTraffic.metrics?.bounce?.change || 0}%`]
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");

      // Individual Tabs
      const wsKPI = XLSX.utils.json_to_sheet([
        { KPI: "Daily Revenue", Value: showRevenue ? formatDollar(safeKpi.dailyRevenueCurrent) : 'Restricted', Comparison: `+${safeKpi.dailyRevenueChange}% vs Yesterday` },
        { KPI: "MTD Revenue", Value: showRevenue ? formatDollar(safeKpi.mtdRevenueCurrent) : 'Restricted', Comparison: `+${safeKpi.mtdRevenueChange}% vs Last Month` },
        { KPI: "YTD Revenue", Value: showRevenue ? formatDollar(safeKpi.ytdRevenueCurrent) : 'Restricted', Comparison: `+${safeKpi.ytdRevenueChange}% vs Last Year` },
        { KPI: "Orders", Value: safeKpi.ordersCurrent, Comparison: `+${safeKpi.ordersChange}% vs Yesterday` },
        { KPI: "Conversion Rate", Value: `${safeKpi.conversionRateCurrent}%`, Comparison: `+${safeKpi.conversionRateChange}% vs Yesterday` },
        { KPI: "Forecast (This Month)", Value: showRevenue ? formatDollar(safeKpi.forecastCurrent) : 'Restricted', Comparison: `+${safeKpi.forecastChange}% vs Target` },
        { KPI: "Revenue Target Progress", Value: showRevenue ? `${safeKpi.targetPct}%` : 'Restricted', Comparison: `Target: ${showRevenue ? formatDollar(safeKpi.targetCurrent) : 'Restricted'}` }
      ]);
      XLSX.utils.book_append_sheet(wb, wsKPI, "KPI Overview");

      if (expRevTrend.length > 0) {
        const wsRevTrend = XLSX.utils.json_to_sheet(expRevTrend.map(r => ({
          "Date / Period": r.date || '',
          "Revenue ($)": showRevenue ? (r.revenue || 0) : 'Restricted',
          "Orders": r.orders || 0
        })));
        XLSX.utils.book_append_sheet(wb, wsRevTrend, "Revenue Trend");
      }

      if (expTopProducts.length > 0) {
        const wsProducts = XLSX.utils.json_to_sheet(expTopProducts.map(p => ({
          "ID": p.id || '',
          "Product": p.name || '',
          "Revenue ($)": showRevenue ? (p.revenue || 0) : 'Restricted',
          "Orders": p.orders || 0
        })));
        XLSX.utils.book_append_sheet(wb, wsProducts, "Top Products");
      }

      if (expRecentOrders.length > 0) {
        const wsOrders = XLSX.utils.json_to_sheet(expRecentOrders.map(o => ({
          "Order ID": o.id || '',
          "Customer": o.customer || '',
          "Amount ($)": showRevenue ? (o.amount || 0) : 'Restricted',
          "Status": o.status || '',
          "Time": o.time || ''
        })));
        XLSX.utils.book_append_sheet(wb, wsOrders, "Recent Orders");
      }

      const fileName = getExportFileName('xlsx');
      XLSX.writeFile(wb, fileName);
      toast.success(`${period} Excel report (.xlsx) downloaded successfully!`);
    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to export Excel report: " + err.message);
    }
  };

  const handleExportPDF = () => {
    try {
      const period = exportPeriod;
      const safeKpi = getSafeKPI(kpi);
      const expRevTrend = getRevenueOverviewData(period).curr || [];
      const expCategories = getCategoryData(period) || [];
      const expChannels = getChannelData(period) || [];
      const expTopProducts = getTopProductsData(period) || [];
      const expRecentOrders = getRecentOrdersData(period) || [];
      const expTargetComp = getTargetComparisonData(period) || [];
      const expRefunds = getRefundsData(period) || [];
      const expCancellations = getCancellationsData(period) || [];
      const expTraffic = getTrafficData(period) || {};

      const printContent = `
        <html>
        <head>
          <title>${getExportFileName('pdf')}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background-color: #ffffff; }
            h1 { color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; font-size: 24px; }
            h2 { color: #4338ca; font-size: 18px; margin-top: 30px; margin-bottom: 10px; }
            .meta-info { font-size: 12px; color: #64748b; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 11px; }
            th { background-color: #f8fafc; font-weight: 600; color: #334155; }
            .footer { font-size: 10px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; }
            .badge-paid { background-color: #d1fae5; color: #065f46; }
            .badge-pending { background-color: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <h1>AstroVed Business Intelligence (BI) Portal</h1>
          <div class="meta-info">
            <strong>Report:</strong> Executive Dashboard (${period} Report)<br/>
            <strong>Selected Period:</strong> ${period}<br/>
            <strong>Date Generated:</strong> ${new Date().toLocaleString()}
          </div>
          
          <h2>Key Performance Indicators (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>KPI</th><th>Value</th><th>Comparison vs Previous Period</th></tr>
              </thead>
              <tbody>
                <tr><td>Daily Revenue</td><td>${showRevenue ? formatDollar(safeKpi.dailyRevenueCurrent) : 'Restricted'}</td><td>+${safeKpi.dailyRevenueChange}% vs Yesterday</td></tr>
                <tr><td>MTD Revenue</td><td>${showRevenue ? formatDollar(safeKpi.mtdRevenueCurrent) : 'Restricted'}</td><td>+${safeKpi.mtdRevenueChange}% vs Last Month</td></tr>
                <tr><td>YTD Revenue</td><td>${showRevenue ? formatDollar(safeKpi.ytdRevenueCurrent) : 'Restricted'}</td><td>+${safeKpi.ytdRevenueChange}% vs Last Year</td></tr>
                <tr><td>Orders</td><td>${safeKpi.ordersCurrent.toLocaleString()}</td><td>+${safeKpi.ordersChange}% vs Yesterday</td></tr>
                <tr><td>Conversion Rate</td><td>${safeKpi.conversionRateCurrent}%</td><td>+${safeKpi.conversionRateChange}% vs Yesterday</td></tr>
                <tr><td>Forecast (This Month)</td><td>${showRevenue ? formatDollar(safeKpi.forecastCurrent) : 'Restricted'}</td><td>+${safeKpi.forecastChange}% vs Target</td></tr>
                <tr><td>Revenue Target Progress</td><td>${showRevenue ? safeKpi.targetPct + '%' : 'Restricted'}</td><td>Target: ${showRevenue ? formatDollar(safeKpi.targetCurrent) : 'Restricted'}</td></tr>
              </tbody>
            </table>
          </div>
          
          <h2>Revenue Trend (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>Period</th><th>Revenue ($)</th><th>Orders</th></tr>
              </thead>
              <tbody>
                ${expRevTrend.map(row => `<tr><td>${row.date || ''}</td><td>${showRevenue ? formatDollar(row.revenue || 0) : 'Restricted'}</td><td>${(row.orders || 0).toLocaleString()}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          <h2>Revenue by Category (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>Category</th><th>Percentage</th><th>Revenue ($)</th></tr>
              </thead>
              <tbody>
                ${expCategories.map(c => `<tr><td>${c.name || ''}</td><td>${c.value || 0}%</td><td>${showRevenue ? formatDollar(c.raw || 0) : 'Restricted'}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          <h2>Revenue by Channel (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>Channel</th><th>Percentage</th><th>Revenue ($)</th></tr>
              </thead>
              <tbody>
                ${expChannels.map(c => `<tr><td>${c.name || ''}</td><td>${c.value || 0}%</td><td>${showRevenue ? formatDollar(c.raw || 0) : 'Restricted'}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          <h2>Top Selling Products (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>ID</th><th>Product</th><th>Revenue ($)</th><th>Orders</th></tr>
              </thead>
              <tbody>
                ${expTopProducts.map(prod => `<tr><td>${prod.id || ''}</td><td>${prod.name || ''}</td><td>${showRevenue ? formatDollar(prod.revenue || 0) : 'Restricted'}</td><td>${(prod.orders || 0).toLocaleString()}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          <h2>Recent Orders (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Amount ($)</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                ${expRecentOrders.map(ord => `<tr><td>${ord.id || ''}</td><td>${ord.customer || ''}</td><td>${showRevenue ? formatDollar(ord.amount || 0) : 'Restricted'}</td><td><span class="badge ${ord.status === 'Paid' ? 'badge-paid' : 'badge-pending'}">${ord.status || ''}</span></td><td>${ord.time || ''}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          <h2>Revenue vs Target (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>Period</th><th>Revenue ($)</th><th>Target ($)</th></tr>
              </thead>
              <tbody>
                ${expTargetComp.map(t => `<tr><td>${t.week || ''}</td><td>${showRevenue ? formatDollar(t.revenue || 0) : 'Restricted'}</td><td>${showRevenue ? formatDollar(t.target || 0) : 'Restricted'}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          <h2>Refunds Trend (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>Date</th><th>Refunds ($)</th></tr>
              </thead>
              <tbody>
                ${expRefunds.map(row => `<tr><td>${row.date || ''}</td><td>${showRevenue ? formatDollar(row.revenue || 0) : 'Restricted'}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          <h2>Cancellations Trend (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>Date</th><th>Cancellations ($)</th></tr>
              </thead>
              <tbody>
                ${expCancellations.map(row => `<tr><td>${row.date || ''}</td><td>${showRevenue ? formatDollar(row.revenue || 0) : 'Restricted'}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          <h2>Traffic Overview (${period})</h2>
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr><th>Metric</th><th>Count</th><th>Change (%)</th></tr>
              </thead>
              <tbody>
                ${expTraffic && expTraffic.metrics ? `
                  <tr><td>Organic Traffic</td><td>${(expTraffic.metrics.organic?.count || 0).toLocaleString()}</td><td>${expTraffic.metrics.organic?.change || 0}%</td></tr>
                  <tr><td>Paid Traffic</td><td>${(expTraffic.metrics.paid?.count || 0).toLocaleString()}</td><td>${expTraffic.metrics.paid?.change || 0}%</td></tr>
                  <tr><td>Total Visitors</td><td>${(expTraffic.metrics.total?.count || 0).toLocaleString()}</td><td>${expTraffic.metrics.total?.change || 0}%</td></tr>
                  <tr><td>Bounce Rate</td><td>${expTraffic.metrics.bounce?.count || 0}%</td><td>${expTraffic.metrics.bounce?.change || 0}%</td></tr>
                ` : ''}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} AstroVed. All rights reserved.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Popup blocked! Please allow popups to export PDF.");
        return;
      }
      printWindow.document.write(printContent);
      printWindow.document.close();
      toast.success(`${period} PDF report opened for printing!`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to export PDF report: " + err.message);
    }
  };

  const handleExportClick = (type) => {
    try {
      if (userPermissions && userPermissions.data && userPermissions.data.export === false) {
        toast.error('Access Denied: Your role profile does not have permission to Export data.');
        return;
      }
      if (userPermissions && userPermissions.data && userPermissions.data.download === false) {
        toast.error('Access Denied: Your role profile does not have permission to Download files.');
        return;
      }

      if (type === 'CSV') {
        handleExportCSV();
      } else if (type === 'Excel') {
        handleExportExcel();
      } else if (type === 'PDF') {
        handleExportPDF();
      }

      api.createAuditLog({
        user: 'Super Admin',
        action: `Exported ${exportPeriod} Report (${type})`,
        module: 'Executive Dashboard',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      }).catch(err => console.error("Audit log failed:", err));
    } catch (err) {
      console.error("Export Click Error:", err);
      toast.error("Export error: " + err.message);
    }
  };

  // Mini Sparkline Options
  const makeSparklineOption = (color, dataValues) => ({
    grid: { left: 0, right: 0, top: 5, bottom: 5 },
    xAxis: { type: 'category', show: false },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data: dataValues,
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 1.5, color: color },
        areaStyle: { color: color + '15' }
      }
    ]
  });

  // 1. Revenue Overview Option
  const revenueOverviewOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Current Period ($)', 'Previous Period ($)', 'Orders'],
      right: '5%',
      top: '0%'
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: currentRevenueTrend.map(d => d.date),
      axisLine: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Revenue',
        splitLine: { show: true },
        axisLabel: { formatter: (val) => formatYAxis(val) }
      },
      {
        type: 'value',
        name: 'Orders',
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Current Period ($)',
        type: 'line',
        smooth: true,
        data: currentRevenueTrend.map(d => d.revenue),
        itemStyle: { color: '#6366f1' },
        lineStyle: { width: 3, color: '#6366f1' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.25)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.0)' }
            ]
          }
        }
      },
      {
        name: 'Previous Period ($)',
        type: 'line',
        smooth: true,
        data: prevRevenueTrend.map(d => d.revenue),
        itemStyle: { color: '#94a3b8' },
        lineStyle: { width: 2, color: '#94a3b8', type: 'dashed' }
      },
      {
        name: 'Orders',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: currentRevenueTrend.map(d => d.orders),
        itemStyle: { color: '#22c55e' }
      }
    ]
  };

  const refundsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '5%', right: '5%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: currentRefunds.map(d => d.date), axisLine: { show: false } },
    yAxis: { type: 'value', splitLine: { show: true }, axisLabel: { formatter: (val) => formatYAxis(val) } },
    series: [{ name: 'Refunds ($)', type: 'bar', data: currentRefunds.map(d => d.revenue), itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } }]
  };

  const cancellationsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '5%', right: '5%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: currentCancellations.map(d => d.date), axisLine: { show: false } },
    yAxis: { type: 'value', splitLine: { show: true }, axisLabel: { formatter: (val) => formatYAxis(val) } },
    series: [{ name: 'Cancellations ($)', type: 'bar', data: currentCancellations.map(d => d.revenue), itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] } }]
  };

  // 2. Donut: Category Option
  const totalCategoryVal = currentCategories.reduce((sum, c) => sum + c.raw, 0);
  const formattedTotalCategory = formatDollar(totalCategoryVal).trim();

  const categoryOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: {
      orient: 'horizontal',
      bottom: '0',
      left: 'center',
      itemWidth: 14,
      itemHeight: 14,
      textStyle: {
        color: '#64748b'
      }
    },
    series: [
      {
        type: 'pie',
        roseType: 'radius',
        radius: isMobile ? [0, '65%'] : [0, '50%'],
        center: isMobile ? ['50%', '40%'] : ['50%', '45%'],
        avoidLabelOverlap: true,
        label: {
          show: !isMobile,
          position: 'outside',
          formatter: '{b}',
          fontSize: 11,
          color: '#475569'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10
        },
        itemStyle: {
          borderRadius: 8
        },
        data: currentCategories.map((c, index) => {
          const colors = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#a855f7'];
          return {
            name: c.name,
            value: c.raw,
            itemStyle: { color: colors[index % colors.length] }
          };
        })
      }
    ]
  };

  // 3. Donut: Channel Option
  const totalChannelVal = currentChannels.reduce((sum, c) => sum + c.raw, 0);
  const formattedTotalChannel = formatDollar(totalChannelVal).trim();

  const channelOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: {
      orient: 'horizontal',
      bottom: '0',
      left: 'center',
      itemWidth: 14,
      itemHeight: 14,
      textStyle: {
        color: '#64748b'
      }
    },
    series: [
      {
        type: 'pie',
        roseType: 'radius',
        radius: isMobile ? [0, '65%'] : [0, '50%'],
        center: isMobile ? ['50%', '40%'] : ['50%', '45%'],
        avoidLabelOverlap: true,
        label: {
          show: !isMobile,
          position: 'outside',
          formatter: '{b}',
          fontSize: 11,
          color: '#475569'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10
        },
        itemStyle: {
          borderRadius: 8
        },
        data: currentChannels.map((c, index) => {
          const colors = ['#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ef4444'];
          return {
            name: c.name,
            value: c.raw,
            itemStyle: { color: colors[index % colors.length] }
          };
        })
      }
    ]
  };

  // 4. Bar: Revenue vs Target Option
  const targetOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['Revenue ($)', 'Target ($)'],
      right: '5%',
      top: '0%'
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: currentTargetComparison.map(t => t.week),
      axisLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (val) => formatYAxis(val) }
    },
    series: [
      {
        name: 'Revenue ($)',
        type: 'bar',
        barGap: '15%',
        barWidth: 10,
        data: currentTargetComparison.map(t => t.revenue),
        itemStyle: { color: '#2563eb', borderRadius: [2, 2, 0, 0] }
      },
      {
        name: 'Target ($)',
        type: 'bar',
        barWidth: 10,
        data: currentTargetComparison.map(t => t.target),
        itemStyle: { color: '#10b981', borderRadius: [2, 2, 0, 0] }
      }
    ]
  };

  // 5. Traffic Overview Option
  const trafficOverviewOption = {
    grid: { left: 0, right: 0, top: 5, bottom: 5 },
    xAxis: { type: 'category', show: false },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data: currentTraffic?.trend || [],
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#a855f7' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(168, 85, 247, 0.25)' },
              { offset: 1, color: 'rgba(168, 85, 247, 0.0)' }
            ]
          }
        }
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {loading ? (
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg w-fit animate-pulse">
            <span className="w-2.5 h-2.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
            <span>Syncing Real-Time GA4 Metrics...</span>
          </div>
        ) : activeData.gaConnected ? (
          activeData.gaRealTime ? (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>GA4 Live Stream Connected (Real-Time Reporting Active)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg w-fit">
              <span>⚠️</span>
              <span>GA4 Connected (Showing Fallback Mock Data - Google OAuth Token Required)</span>
            </div>
          )
        ) : (
          <div className="flex items-center space-x-2 text-xs text-cosmic-muted font-semibold bg-cosmic-border/10 border border-cosmic-border/20 px-3 py-1.5 rounded-lg w-fit">
            <span>⚪</span>
            <span>GA4 Disconnected (Configure settings in Integrations tab)</span>
          </div>
        )}

        <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700 w-full md:w-auto">
          {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period, idx) => (
            <button
              key={period}
              onClick={() => {
                setExportPeriod(period);
                if (period === 'Daily' && selectPreset) selectPreset('today');
                else if (period === 'Weekly' && selectPreset) selectPreset('7days');
                else if (period === 'Monthly' && selectPreset) selectPreset('mtd');
                else if (period === 'Yearly' && selectPreset) selectPreset('ytd');
              }}
              className={`flex-1 md:flex-none md:w-28 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-medium transition-all ${exportPeriod === period
                ? 'bg-[#f0f7ff] dark:bg-blue-500/20 text-[#2563eb] dark:text-blue-400 border border-[#bfdbfe] dark:border-blue-500/30 rounded shadow-sm z-10'
                : 'text-slate-500 dark:text-slate-400 bg-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 border-y border-transparent ' + (exportPeriod !== period && idx !== 0 && exportPeriod !== ['Daily', 'Weekly', 'Monthly', 'Yearly'][idx - 1] ? 'border-l-[1px] border-l-slate-200 dark:border-l-slate-600' : 'border-l-0')
                }`}
            >
              <Calendar size={14} className={exportPeriod === period ? 'text-[#3b82f6]' : 'text-slate-400'} />
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* ----------------- KPI CARDS: 5 on Top, 4 on Bottom (Centered) ----------------- */}
      <div className="space-y-4">
        {/* Top Row: 5 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {[
            { title: 'Daily Revenue', value: showRevenue ? formatDollar(kpi.dailyRevenue.current) : 'ðŸ”’', change: `+${kpi.dailyRevenue.compChange}% vs Yesterday`, badgeColor: 'text-emerald-500', showQuery: true },
            { title: 'MTD Revenue', value: showRevenue ? formatDollar(kpi.mtdRevenue.current) : 'ðŸ”’', change: `+${kpi.mtdRevenue.compChange}% vs Last Month`, badgeColor: 'text-emerald-500' },
            { title: 'YTD Revenue', value: showRevenue ? formatDollar(kpi.ytdRevenue.current) : 'ðŸ”’', change: `+${kpi.ytdRevenue.compChange}% vs Last Year`, badgeColor: 'text-emerald-500' },
            { title: 'Orders (Today)', value: kpi.orders.current.toLocaleString(), change: `+${kpi.orders.compChange}% vs Yesterday`, badgeColor: 'text-orange-500' },
            { title: 'Customers (Today)', value: kpi.customers?.current?.toLocaleString() || '0', change: `+${kpi.customers?.compChange || 0}% vs Yesterday`, badgeColor: 'text-orange-500' }
          ].map((card, index) => (
            <div key={index} className="bg-cosmic-card border border-cosmic-border rounded-xl shadow-sm p-4 md:p-5 flex flex-col items-center justify-center text-center relative group">
              <span className="text-[12px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 md:mb-2">{card.title}</span>
              <span className="text-xl sm:text-2xl lg:text-2xl font-normal tracking-tight text-slate-900 dark:text-white mb-1.5 md:mb-2 px-1">
                {card.value}
              </span>
              <span className={`text-[10px] font-medium flex items-center ${card.badgeColor}`}>
                {card.change}
              </span>
              {card.showQuery && (
                <button
                  onClick={() => setShowQueryModal(true)}
                  className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="View Daily Revenue Query"
                >
                  <Database size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Row: 4 Cards (Centered) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:w-4/5 lg:mx-auto">
          {[
            { title: 'Avg Order Value (Today)', value: showRevenue ? formatDollar(kpi.aov?.current || 0) : 'ðŸ”’', change: `+${kpi.aov?.compChange || 0}% vs Yesterday`, badgeColor: 'text-emerald-500' },
            { title: 'Avg Revenue per User (This Month)', value: showRevenue ? formatDollar(kpi.arpu?.current || 0) : 'ðŸ”’', change: `+${kpi.arpu?.compChange || 0}% vs Last Month`, badgeColor: 'text-emerald-500' },
            { title: 'Year over Year Growth', value: showRevenue ? `${kpi.yoyGrowth?.current > 0 ? '+' : ''}${(kpi.yoyGrowth?.current || 0).toFixed(1)}%` : 'ðŸ”’', change: `vs YTD Last Year`, badgeColor: kpi.yoyGrowth?.current >= 0 ? 'text-emerald-500' : 'text-rose-500' },
            { title: 'Forecast (This Month)', value: showRevenue ? formatDollar(kpi.forecast.current) : 'ðŸ”’', change: `+${kpi.forecast.compChange}% Trending`, badgeColor: 'text-emerald-500' }
          ].map((card, index) => (
            <div key={index} className="bg-cosmic-card border border-cosmic-border rounded-xl shadow-sm p-4 md:p-5 flex flex-col items-center justify-center text-center">
              <span className="text-[12px] md:text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 md:mb-2">{card.title}</span>
              <span className="text-xl sm:text-2xl lg:text-2xl font-normal tracking-tight text-slate-900 dark:text-white mb-1.5 md:mb-2 px-1">
                {card.value}
              </span>
              <span className={`text-[10px] font-medium flex items-center ${card.badgeColor}`}>
                {card.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ----------------- ROW 2: CHARTS ROW (Revenue line, Category donut, Channel donut) ----------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Revenue Overview */}
        <div className="bg-cosmic-card border border-cosmic-border rounded-xl shadow-sm p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Revenue Overview</h4>
            <select
              value={revenueOverviewFilter}
              onChange={(e) => setRevenueOverviewFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 px-2 py-1 rounded focus:outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
          {showRevenue ? (
            <EChartWrapper option={revenueOverviewOption} height="220px" />
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-xs text-cosmic-muted font-bold bg-cosmic-card border border-cosmic-border rounded-xl">
              <span className="mb-1 text-base text-cosmic-accent">ðŸ”’ Access Restricted</span>
              <span>Your role profile does not have permission to view revenue summary.</span>
            </div>
          )}
        </div>

        {/* Revenue by Category */}
        <div className="bg-cosmic-card border border-cosmic-border rounded-xl shadow-sm p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Revenue by Category</h4>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 px-2 py-1 rounded focus:outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
          {showRevenue ? (
            <EChartWrapper option={{ ...categoryOption, legend: { ...categoryOption.legend, type: 'scroll' } }} height="300px" />
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-xs text-cosmic-muted font-bold bg-cosmic-card border border-cosmic-border rounded-xl">
              <span className="mb-1 text-base text-cosmic-accent">ðŸ”’ Access Restricted</span>
              <span>Your role profile does not have permission to view category breakdown.</span>
            </div>
          )}
        </div>

        {/* Revenue by Channel */}
        <div className="bg-cosmic-card border border-cosmic-border rounded-xl shadow-sm p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Revenue by Channel</h4>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 px-2 py-1 rounded focus:outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
          {showRevenue ? (
            <EChartWrapper option={{ ...channelOption, legend: { ...channelOption.legend, type: 'scroll' } }} height="300px" />
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-xs text-cosmic-muted font-bold bg-cosmic-card border border-cosmic-border rounded-xl">
              <span className="mb-1 text-base text-cosmic-accent">ðŸ”’ Access Restricted</span>
              <span>Your role profile does not have permission to view channel breakdown.</span>
            </div>
          )}
        </div>

      </div>



      {/* ----------------- ROW 3: LISTS & COMPARISONS (Top Selling, Recent Orders, Rev vs Target) ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Selling Products */}
        <div className="bg-cosmic-card border border-cosmic-border rounded-xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-[#f97316] p-3 flex justify-between items-center text-white">
              <h4 className="font-semibold text-sm">Top Selling Products</h4>
              <select
                value={topProductsFilter}
                onChange={(e) => setTopProductsFilter(e.target.value)}
                className="bg-white/20 border border-white/30 text-[10px] text-white px-2 py-0.5 rounded focus:outline-none cursor-pointer"
              >
                <option value="Today" className="text-black">Today</option>
                <option value="This Week" className="text-black">This Week</option>
                <option value="This Month" className="text-black">This Month</option>
                <option value="This Year" className="text-black">This Year</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <div className="overflow-x-auto w-full ">
                <table className="w-full text-left text-[11px] border-collapse relative">
                  <thead className="bg-[#6868f9] text-white sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="py-2 px-3 font-medium w-8">#</th>
                      <th className="py-2 px-3 font-medium">Product</th>
                      <th className="py-2 px-3 font-medium text-right w-24">Revenue ($)</th>
                      <th className="py-2 px-3 font-medium text-right w-16">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                    {topProductsPage.currentData.map((prod) => (
                      <tr key={prod.id} className="hover:bg-cosmic-card-hover transition-colors">
                        <td className="py-2 px-3 font-mono text-cosmic-muted">{prod.id}</td>
                        <td className="py-2 px-3 font-semibold text-cosmic-text">{prod.name}</td>
                        <td className="py-2 px-3 text-right font-semibold whitespace-nowrap">
                          {showRevenue ? formatDollar(prod.revenue) : '🔒 Restricted'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-cosmic-muted">{prod.orders.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination {...topProductsPage} />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-cosmic-card border border-cosmic-border rounded-xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-cosmic-bg border-b border-cosmic-border p-3 flex justify-between items-center">
              <h4 className="font-semibold text-sm text-cosmic-text">Recent Orders</h4>
              <select
                value={recentOrdersFilter}
                onChange={(e) => setRecentOrdersFilter(e.target.value)}
                className="bg-cosmic-card border border-cosmic-border text-[10px] text-cosmic-muted px-2 py-0.5 rounded focus:outline-none cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <div className="overflow-x-auto w-full ">
                <table className="w-full text-left text-[11px] border-collapse relative">
                  <thead className="bg-[#6868f9] text-white sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="py-2 px-3 font-medium">Order ID</th>
                      <th className="py-2 px-3 font-medium">Customer</th>
                      <th className="py-2 px-3 font-medium text-right">Amount ($)</th>
                      <th className="py-2 px-3 font-medium">Status</th>
                      <th className="py-2 px-3 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                    {recentOrdersPage.currentData.map((ord, idx) => (
                      <tr key={idx} className="hover:bg-cosmic-card-hover transition-colors">
                        <td className="py-2 px-3 font-mono text-indigo-400">{ord.id}</td>
                        <td className="py-2 px-3">
                          <span className="block font-semibold text-cosmic-text truncate max-w-[120px]" title={ord.customer}>{ord.customer}</span>
                          <span className="block text-[9px] text-cosmic-muted mt-0.5">ID: {ord.customerId}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {showRevenue ? formatDollar(ord.amount) : '🔒 Restricted'}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${ord.status === 'Paid' || ord.status === 'Complete' || ord.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-cosmic-muted text-[10px]">{ord.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination {...recentOrdersPage} />
          </div>
        </div>

        {/* Revenue vs Target */}
        <div className="lg:col-span-2 bg-cosmic-card border border-cosmic-border p-4 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-cosmic-text">Revenue vs Target</h4>
            <select
              value={targetComparisonFilter}
              onChange={(e) => setTargetComparisonFilter(e.target.value)}
              className="bg-cosmic-bg border border-cosmic-border text-[10px] text-cosmic-muted px-2 py-0.5 rounded focus:outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
          {showRevenue ? (
            <EChartWrapper option={targetOption} height="400px" />
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-xs text-cosmic-muted font-bold bg-cosmic-card border border-cosmic-border rounded-xl">
              <span className="mb-1 text-base text-cosmic-accent">ðŸ”’ Access Restricted</span>
              <span>Your role profile does not have permission to view target matching.</span>
            </div>
          )}
        </div>

      </div>

      {/* ----------------- ROW 4: TRAFFIC OVERVIEW, QUICK REPORTS, EXPORTS ----------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Traffic Overview */}
        <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-xl flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 gap-2">
              <h4 className="text-sm font-bold text-cosmic-text truncate tracking-tight">Traffic Overview</h4>
              <select
                value={trafficFilter}
                onChange={(e) => setTrafficFilter(e.target.value)}
                className="bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-muted px-2 py-1 rounded-md focus:outline-none cursor-pointer flex-shrink-0 transition-colors hover:border-blue-500/50"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
              <div className="bg-cosmic-bg/50 border border-cosmic-border/50 rounded-lg p-3 transition-colors hover:bg-cosmic-bg">
                <span className="text-cosmic-muted text-[10px] font-semibold uppercase tracking-wider block truncate mb-1">Organic Traffic</span>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-cosmic-text leading-none">{currentTraffic.metrics.organic.count.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    ↑ {currentTraffic.metrics.organic.change}%
                  </span>
                </div>
              </div>
              <div className="bg-cosmic-bg/50 border border-cosmic-border/50 rounded-lg p-3 transition-colors hover:bg-cosmic-bg">
                <span className="text-cosmic-muted text-[10px] font-semibold uppercase tracking-wider block truncate mb-1">Paid Traffic</span>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-cosmic-text leading-none">{currentTraffic.metrics.paid.count.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    ↑ {currentTraffic.metrics.paid.change}%
                  </span>
                </div>
              </div>
              <div className="bg-cosmic-bg/50 border border-cosmic-border/50 rounded-lg p-3 transition-colors hover:bg-cosmic-bg">
                <span className="text-cosmic-muted text-[10px] font-semibold uppercase tracking-wider block truncate mb-1">Total Visitors</span>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-cosmic-text leading-none">{currentTraffic.metrics.total.count.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    ↑ {currentTraffic.metrics.total.change}%
                  </span>
                </div>
              </div>
              <div className="bg-cosmic-bg/50 border border-cosmic-border/50 rounded-lg p-3 transition-colors hover:bg-cosmic-bg">
                <span className="text-cosmic-muted text-[10px] font-semibold uppercase tracking-wider block truncate mb-1">Bounce Rate</span>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-cosmic-text leading-none">{currentTraffic.metrics.bounce.count}%</span>
                  <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    ↓ {Math.abs(currentTraffic.metrics.bounce.change)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-20 mt-4 -mx-2 -mb-2">
            <EChartWrapper option={trafficOverviewOption} height="100%" />
          </div>
        </div>

        {/* Export Reports Buttons */}
        <div className="bg-white dark:bg-cosmic-card border border-gray-100 dark:border-cosmic-border p-4 rounded-xl flex flex-col space-y-4 shadow-sm h-full w-full">
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">Export Reports</h4>

          <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
            {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period, idx) => (
              <button
                key={period}
                onClick={() => setExportPeriod(period)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-1 text-[11px] font-medium transition-all ${exportPeriod === period
                  ? 'bg-[#f0f7ff] dark:bg-blue-500/20 text-[#2563eb] dark:text-blue-400 border border-[#bfdbfe] dark:border-blue-500/30 rounded shadow-sm z-10'
                  : 'text-slate-500 dark:text-slate-400 bg-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 border-y border-transparent ' + (exportPeriod !== period && idx !== 0 && exportPeriod !== ['Daily', 'Weekly', 'Monthly', 'Yearly'][idx - 1] ? 'border-l-[1px] border-l-slate-200 dark:border-l-slate-600' : 'border-l-0')
                  }`}
              >
                <Calendar size={14} className={exportPeriod === period ? 'text-[#3b82f6]' : 'text-slate-400'} />
                {period}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => handleExportClick('Excel')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#f4fbf7] dark:bg-emerald-500/10 border border-[#bbf7d0] dark:border-emerald-500/20 hover:bg-[#eaf8f0] dark:hover:bg-emerald-500/20 transition-all text-left group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 transform group-hover:rotate-3 transition-transform">
                  <path d="M18 6h12a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H18V6z" fill="#22c55e" fillOpacity="0.2" />
                  <path d="M18 10h14M18 14h14M18 18h14M18 22h14M18 26h14M18 30h14" stroke="#22c55e" strokeWidth="2" />
                  <path d="M22 6v28M26 6v28" stroke="#22c55e" strokeWidth="2" />
                  <path d="M6 10h14v20H6a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" fill="#16a34a" />
                  <path d="M9 15l6 10M15 15l-6 10" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div>
                  <div className="font-bold text-[#16a34a] dark:text-emerald-400 text-sm">Export to Excel</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px]">Export report data to Excel format</div>
                </div>
              </div>
              <Download size={16} className="text-[#16a34a] group-hover:scale-110 transition-transform group-hover:translate-y-0.5" strokeWidth={2} />
            </button>

            <button
              onClick={() => handleExportClick('PDF')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#fef2f2] dark:bg-rose-500/10 border border-[#fecaca] dark:border-rose-500/20 hover:bg-[#fee2e2] dark:hover:bg-rose-500/20 transition-all text-left group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-8 transform group-hover:rotate-3 transition-transform">
                  <path d="M0 4a4 4 0 0 1 4-4h18l14 14v24a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4z" fill="#ef4444" />
                  <path d="M22 0v14h14" fill="#dc2626" />
                  <text x="5" y="32" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="12">PDF</text>
                </svg>
                <div>
                  <div className="font-bold text-[#dc2626] dark:text-rose-400 text-sm">Export to PDF</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px]">Export report data to PDF format</div>
                </div>
              </div>
              <Download size={16} className="text-[#dc2626] group-hover:scale-110 transition-transform group-hover:translate-y-0.5" strokeWidth={2} />
            </button>

            <button
              onClick={() => handleExportClick('CSV')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#f0f7ff] dark:bg-blue-500/10 border border-[#bfdbfe] dark:border-blue-500/20 hover:bg-[#dbeafe] dark:hover:bg-blue-500/20 transition-all text-left group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-8 transform group-hover:rotate-3 transition-transform">
                  <path d="M0 4a4 4 0 0 1 4-4h18l14 14v24a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4z" fill="#3b82f6" />
                  <path d="M22 0v14h14" fill="#2563eb" />
                  <text x="3" y="32" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11">CSV</text>
                </svg>
                <div>
                  <div className="font-bold text-[#2563eb] dark:text-blue-400 text-sm">Export to CSV</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px]">Export report data to CSV format</div>
                </div>
              </div>
              <Download size={16} className="text-[#2563eb] group-hover:scale-110 transition-transform group-hover:translate-y-0.5" strokeWidth={2} />
            </button>
          </div>
        </div>

      </div>

      {/* Daily Revenue Query Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Database className="text-blue-500" size={20} />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Daily Revenue SQL Query</h3>
              </div>
              <button
                onClick={() => setShowQueryModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-auto flex-1 bg-slate-900">
              <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap break-words">
                {`SELECT OrderId,customerid,OrderDate,ProductName,EventName,Quantity,Currency, UsdPrice,        
Cast(UsdPriceDiscount As Decimal(18,2)) As UsdPriceDiscount, OrderType,PrimaryTracking,SecondaryTracking ,TrafficCategory        
FROM (        
SELECT                   
  ORD.OrderId,               Sl.customerid,
  GP.OrderDate As OrderDate,   
  POD.ProductId,
PAT.Name AS ProductName,    
    CASE     
        WHEN LEN(PAI.EventName) > 0 THEN PAI.EventName    
        ELSE 'Regular Store Item'     
    END AS Eventname,        
  POD.Quantity,         
  POD.Currency,        
Pod.UsdPrice ,        
CASE      
    WHEN NOT EXISTS (      
        SELECT 1      
        FROM Vaaak.OrderDiscounts od2      
        WHERE od2.OrderId = pod.SelectedListId      
          AND od2.SelectedItemId = pod.SelectedItemId      
    ) THEN 0      
      
    WHEN od.SelectedItemId > 0 THEN ISNULL(ROUND(od.USDAmount, 2), 0)      
      
    WHEN od.SelectedItemId = 0  THEN      
        CAST(ROUND(      
            pod.USDPrice * 1.0 / SUM(pod.USDPrice) OVER (PARTITION BY pod.SelectedListId) *      
            MAX(ROUND(od.USDAmount, 2)) OVER (PARTITION BY pod.SelectedListId, od.SelectedItemId),      
        2) AS DECIMAL(18, 2))      
END AS USDPriceDiscount,    
  CASE WHEN ISNULL(MOP.VerifiedBy, 0) = 0 THEN 'Online' ELSE 'Manual' END AS 'OrderType' ,
  Ts.TrackingCode As PrimaryTracking,
  TS.Comments As SecondaryTracking,
  CASE 
				WHEN  TS.TrackingCode LIKE '%NLW%'
					THEN 'Newsletter'
				WHEN  TS.TrackingCode LIKE 'NLI%'
					THEN 'Newsletter India'
				WHEN (
						 TS.TrackingCode LIKE '%mybrowser-search.com%'
						OR  TS.TrackingCode LIKE '%duckduckgo.com%'
						OR  TS.TrackingCode LIKE '%ecosia.org%'
						OR  TS.TrackingCode LIKE '%yahoo%'
						OR  TS.TrackingCode LIKE '%bing%'
						OR  TS.TrackingCode LIKE '%google%'
						OR  TS.TrackingCode LIKE '%int.search.tb.ask.com%'
						)
					THEN 'Organic'
				WHEN (
						 TS.TrackingCode LIKE '%YT_AV%'
						OR  TS.TrackingCode LIKE '%youtube%'
						OR  TS.TrackingCode LIKE '%YTB_AV%'
						OR  TS.TrackingCode LIKE '%YTB_AVT%'
						OR  TS.TrackingCode LIKE '%YTB_%'
						)
					THEN 'YouTube'
				WHEN (
						 TS.TrackingCode LIKE '%SMO/_%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%WA/_%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%ShareChat/_%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%SMS/_%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%yourstory%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%Twitter/_%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%quora.com/_%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%apsense.com/_%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%t.co/_%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%in.pinterest.com%'
						OR  TS.TrackingCode LIKE '%WEBINAR/_%' ESCAPE '/'
						)
					THEN 'Social Media'
				WHEN ( TS.TrackingCode LIKE '%facebook%')
					THEN 'Facebook'
				WHEN ( TS.TrackingCode LIKE '%FBP_%')
					THEN 'Facebook Paid Ad''s'
				WHEN ( TS.TrackingCode LIKE '%OML%')
					THEN 'NewsLetter Target'
				WHEN  TS.TrackingCode = 'ML_birthday'
					THEN 'Birthday Mailer'
				WHEN (
						 TS.TrackingCode LIKE '%ML_Dasha_Automated_Report%'
						OR  TS.TrackingCode LIKE '%DASHABHUKTI%'
						)
					THEN 'Dasa Mailer'
				WHEN (
						 TS.TrackingCode LIKE '%PUSH_%'
						OR  TS.TrackingCode LIKE '%PUSHAP_%'
						)
					THEN 'PUSH APP'
				WHEN (
						 TS.TrackingCode LIKE '%SL/_%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%SPL_Right%'
						)
					THEN 'Internal Ad''s'
				WHEN ( TS.TrackingCode LIKE '%AA/_%' ESCAPE '/')
					THEN 'Activity Alerts'
				WHEN (
						 TS.TrackingCode LIKE '%AVPGDS%'
						OR  TS.TrackingCode LIKE '%AVPGD%'
						OR  TS.TrackingCode LIKE '%AVPFT%'
						OR  TS.TrackingCode LIKE '%AVPGOD%'
						OR  TS.TrackingCode LIKE '%AVPVP%'
						OR  TS.TrackingCode LIKE '%AVPFES%'
						OR  TS.TrackingCode LIKE '%AVPFAS%'
						OR  TS.TrackingCode LIKE '%AVPMT%'
						OR  TS.TrackingCode LIKE '%AVPPT%'
						OR  TS.TrackingCode LIKE '%AVPFES%'
						OR  TS.TrackingCode LIKE '%ZODIAC_%'
						OR  TS.TrackingCode LIKE '%AVP_%'
						)
					THEN 'AstroPedia'
				WHEN (
						 TS.TrackingCode LIKE '%ML%' ESCAPE '/'
						OR  TS.TrackingCode LIKE '%CPNML%'
						OR  TS.TrackingCode LIKE '%HS_Daily_Horoscope1%'
						OR  TS.TrackingCode LIKE '%HS_Daily_Horoscope2%'
						OR  TS.TrackingCode LIKE '%HS_Daily_Horoscope3%'
						OR  TS.TrackingCode LIKE '%HS_Daily_Horoscope4%'
						OR  TS.TrackingCode LIKE '%AVHoro%'
						OR  TS.TrackingCode LIKE '%HS_Weekly_Horoscope1%'
						OR  TS.TrackingCode LIKE '%HS_Weekly_Horoscope2%'
						OR  TS.TrackingCode LIKE '%HS_Weekly_Horoscope3%'
						OR  TS.TrackingCode LIKE '%HS_Weekly_Horoscope4%'
						OR  TS.TrackingCode LIKE '%HS_Monthly_Horoscope1%'
						OR  TS.TrackingCode LIKE '%HS_Monthly_Horoscope2%'
						OR  TS.TrackingCode LIKE '%HS_Monthly_Horoscope3%'
						OR  TS.TrackingCode LIKE '%HS_Monthly_Horoscope4%'
						)
					AND (
						 TS.TrackingCode NOT LIKE '%SL_%'
						AND  TS.TrackingCode NOT LIKE '%ML_Dasha_Automated_Report%'
						AND  TS.TrackingCode NOT LIKE '%ML_birthday%'
						AND  TS.TrackingCode NOT LIKE '%avd%'
						AND  TS.TrackingCode NOT LIKE '%OML%'
						)
					THEN 'Other Mailer Promotions'
				WHEN ( TS.TrackingCode LIKE '%avd%')
					THEN 'Empoyee Sales'
				END AS TrafficCategory
FROM         
  Payment AS PA WITH (NOLOCK)         
  INNER JOIN [Order] AS ORD WITH (NOLOCK) ON PA.OrderId = ORD.OrderId         
  INNER JOIN SelectedList AS SL WITH (NOLOCK) ON ORD.OrderId = SL.SelectedListId         
  INNER JOIN SelectedItem AS SI ON SI.SelectedListId = SL.SelectedListId         
  INNER JOIN Vaaak.ProductwiseOrderDetail AS POD WITH (NOLOCK) ON POD.SelectedListId = SL.SelectedListId         
  AND POD.SelectedItemId = SI.SelectedItemId         
  INNER JOIN OrderDetail AS ODE ON ODE.OrderDetailId = POD.SelectedItemId AND ODE.OrderId = POD.SelectedListId  
  INNER JOIN GenericPayment AS GP ON GP.PaymentId = PA.PaymentId    
  JOIN Product P On P.ProductId=POD.ProductId
  JOIN ProductTranslation PT ON PT.ProductId = Pod.ProductId AND PT.ShopId = 1 AND PT.LocaleId = 1    
JOIN Vaaak.ProductAdditionalInfo PAI ON Pod.ProductId = PAI.ProductId    
JOIN Vaaak.ProductAdditionalTranslation PAT ON PT.ProductAdditionalTransId = PAT.ProductAdditionalTransId 
  LEFT JOIN vaaak.ManualOrderPayment MOP ON MOP.SelectedListId = ORD.OrderId  
  LEFT JOIN Vaaak.TrackingStatistics TS On Ts.OrderId=Ord.OrderId
  LEFT JOIN Vaaak.OrderDiscounts od      
    ON od.OrderId = pod.SelectedListId      
    AND od.Currency = pod.Currency      
    AND (      
        (od.SelectedItemId = pod.SelectedItemId)              
        OR (      
            od.SelectedItemId = 0       
            AND NOT EXISTS (      
                SELECT 1      
                FROM Vaaak.OrderDiscounts od2      
                WHERE od2.OrderId = pod.SelectedListId      
                  AND od2.SelectedItemId > 0      
            )      
        )      
    )      
        
   LEFT JOIN (        
    SELECT DISTINCT CustomerId         
    FROM Vaaak.TestCustomerAccounts TCA        
 Where TCA.CustomerId IS NOT NULL        
    UNION         
    SELECT DISTINCT Sl2.CustomerId         
    FROM Payment P2        
    JOIN SelectedList Sl2         
        ON P2.OrderId = Sl2.SelectedListId         
        AND Sl2.CustomerId IS NOT NULL        
    JOIN GenericPayment Gp2         
        ON P2.PaymentId = Gp2.PaymentId         
        AND Gp2.Code = '9999999999'        
) TestAccounts         
    ON Sl.CustomerId = TestAccounts.CustomerId        
        
WHERE   
POD.USDPrice <> 0
AND PA.TypeId <> 19
 AND ODE.OrderDetailStatusId <> 6        
AND ORD.OrderStatusId <> 6        
AND Gp.Code <> '9999999999'        
AND TestAccounts.CustomerId IS NULL                
AND SL.ShopId = 1       
AND Convert(Date,GP.OrderDate) BETWEEN '2026-07-01' AND '2026-07-22'
)A
Order BY OrderDate`}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Executive;
