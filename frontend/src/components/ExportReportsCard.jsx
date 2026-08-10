import React, { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ExportReportsCard = ({ data, defaultPeriod = 'Daily', pageTitle = 'Sales', showPeriodTabs = true, className = '', onPeriodChange }) => {
  const [exportPeriod, setExportPeriod] = useState(defaultPeriod);

  React.useEffect(() => {
    if (defaultPeriod) {
      setExportPeriod(defaultPeriod);
    }
  }, [defaultPeriod]);

  const getExportFileName = (ext) => {
    const now = new Date();
    const dateSuffix = now.toISOString().split('T')[0];
    return `${pageTitle.replace(/\s+/g, '_')}_${exportPeriod}_Report_${dateSuffix}.${ext}`;
  };

  const resolveExportData = () => {
    const todayCards = data?.salesKpiData?.todayRevenueCards || [];
    const monthCards = data?.salesKpiData?.monthRevenueCards || [];
    let cards = exportPeriod === 'Daily' ? (todayCards.length > 0 ? todayCards : monthCards) : (monthCards.length > 0 ? monthCards : todayCards);
    if (cards.length === 0) {
      cards = data?.customerKpiCards || data?.newsletterKpiCards || data?.kpiCards || [];
    }
    const revSource = data?.revenueSource || [];
    const eventSales = data?.eventSales || [];
    const salesByEvent = data?.salesByEventName || data?.eventSales || [];
    const quarterSpecials = data?.quarterSpecials || data?.specialsStoreItems || [];
    const bestSellers = data?.bestSellers || [];
    const lowPerformers = data?.lowPerformers || [];
    const currencies = data?.currencies || [];

    const isMonthlySales = (exportPeriod === 'Monthly' || pageTitle.toLowerCase().includes('monthly')) && pageTitle.toLowerCase().includes('sales');

    // Resolve Geo Heat Map Data (Regional Sales Growth Map) ONLY for Monthly sales
    let geoData = [];
    if (isMonthlySales) {
      geoData = data?.geoData;
      if (!geoData || !Array.isArray(geoData) || geoData.length <= 1) {
        const countryMap = {
          'INR Share': 'IN',
          'USD Share': 'US',
          'MYR Share': 'MY'
        };
        geoData = [["Country", "Revenue Share %"]];
        if (currencies && currencies.length > 0) {
          currencies.forEach(c => {
            const code = countryMap[c.name] || (c.name?.includes('INR') ? 'IN' : c.name?.includes('USD') ? 'US' : c.name?.includes('MYR') ? 'MY' : null);
            if (code && c.value > 0) geoData.push([code, c.value]);
          });
        }
        if (geoData.length <= 1) {
          geoData = [
            ["Country", "Revenue Share %"],
            ["IN", 45.5],
            ["US", 35.2],
            ["MY", 12.8],
            ["SG", 4.0],
            ["NP", 2.5]
          ];
        }
      }
    }

    // currencyGrowth has been removed as per user request

    // Customer Specific Datasets
    const customerMetricsRows = data?.customerMetricsRows || [];
    const customerMetricsLabels = data?.customerMetricsLabels || ['Older', 'Previous', 'Current'];
    const demographics = data?.demographics || null;
    const newCustomersByEvent = data?.newCustomersByEvent || [];
    const newCustomersByProduct = data?.newCustomersByProduct || [];
    const highContributors = data?.highContributors || [];
    const newCustomersByTraffic = data?.newCustomersByTraffic || [];
    const projectionByTraffic = data?.projectionByTraffic || [];
    const revenueByTrafficSource = data?.revenueByTrafficSource || [];
    const newMemberTrendByCurrency = data?.newMemberTrendByCurrency || [];
    const comparisonOfRevenueBySource = data?.comparisonOfRevenueBySource || [];

    // Newsletter Specific Datasets
    const categorySales = data?.categorySales || [];
    const dateWisePerformance = data?.dateWisePerformance || [];
    const overallPerformanceData = data?.overallPerformanceData || [];
    const breakupSummary = data?.breakupSummary || [];
    const typesCompared = data?.typesCompared || [];
    const overallEventsData = data?.overallEventsData || [];
    const specialEventsData = data?.specialEventsData || [];
    const specialEventsPerformanceData = data?.specialEventsPerformanceData || [];

    return {
      cards,
      revSource,
      eventSales,
      salesByEvent,
      quarterSpecials,
      bestSellers,
      lowPerformers,
      currencies,
      geoData,
      customerMetricsRows,
      customerMetricsLabels,
      demographics,
      newCustomersByEvent,
      newCustomersByProduct,
      highContributors,
      newCustomersByTraffic,
      projectionByTraffic,
      revenueByTrafficSource,
      newMemberTrendByCurrency,
      comparisonOfRevenueBySource,
      categorySales,
      dateWisePerformance,
      overallPerformanceData,
      breakupSummary,
      typesCompared,
      overallEventsData,
      specialEventsData,
      specialEventsPerformanceData
    };
  };

  const handleExportCSV = () => {
    try {
      let csv = `AstroVed BI Portal - ${pageTitle} (${exportPeriod} Report)\n`;
      csv += `Selected Period: ${exportPeriod}\n`;
      csv += `Generated on: ${new Date().toLocaleString()}\n\n`;

      const {
        cards,
        revSource,
        eventSales,
        salesByEvent,
        quarterSpecials,
        bestSellers,
        lowPerformers,
        currencies,
        geoData,
        customerMetricsRows,
        customerMetricsLabels,
        demographics,
        newCustomersByEvent,
        newCustomersByProduct,
        highContributors,
        newCustomersByTraffic,
        revenueByTrafficSource,
        newMemberTrendByCurrency,
        comparisonOfRevenueBySource,
        categorySales,
        dateWisePerformance,
        overallPerformanceData,
        breakupSummary,
        typesCompared,
        overallEventsData,
        specialEventsData,
        specialEventsPerformanceData
      } = resolveExportData();

      // Calculate total revenue for Event Revenue Share percentage calculation
      const totalEventRevenue = eventSales.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

      // 1. Performance Metrics
      if (cards.length > 0) {
        csv += "Performance Overview Metrics\nMetric,Value,Change\n";
        cards.forEach(c => {
          csv += `"${c.title}","${c.value}","${c.change}"\n`;
        });
        csv += "\n";
      }

      // Customer Page Complete Datasets Export
      if (customerMetricsRows.length > 0) {
        csv += `Customer Performance Metrics Overview (${customerMetricsLabels.join(' vs ')})\n`;
        csv += `Metric,${customerMetricsLabels[0] || 'Older'},${customerMetricsLabels[1] || 'Previous'},${customerMetricsLabels[2] || 'Current'}\n`;
        customerMetricsRows.forEach(r => {
          csv += `"${r.metric}",${r.col1},${r.col2},${r.col3}\n`;
        });
        csv += "\n";
      }

      if (demographics) {
        csv += "Customer Demographics Breakdown\nCohort,Total Members,USD Members,MYR Members,INR Members\n";
        csv += `"New Registered Members",${demographics.newTotal || 0},${demographics.newUsd || 0},${demographics.newMyr || 0},${demographics.newInr || 0}\n`;
        csv += `"Returning Members",${demographics.retTotal || 0},${demographics.retUsd || 0},${demographics.retMyr || 0},${demographics.retInr || 0}\n\n`;
      }

      if (highContributors.length > 0) {
        csv += "High Contributor Customer Accounts\nCustomer Name,Email,Country,Orders,Total Revenue ($)\n";
        highContributors.forEach(c => {
          csv += `"${c.customerName || c.name || ''}","${c.email || ''}","${c.country || ''}",${c.orders || 0},${c.revenue || 0}\n`;
        });
        csv += "\n";
      }

      if (newCustomersByEvent.length > 0) {
        csv += "New Customers By Event Name\nEvent Name,Customer Count,Count Change,Revenue ($),Rev Change\n";
        newCustomersByEvent.forEach(e => {
          csv += `"${e.eventName || e.name || ''}",${e.customers || e.qty || 0},"${e.countChange || ''}",${e.revenue || 0},"${e.revChange || ''}"\n`;
        });
        csv += "\n";
      }

      if (newCustomersByProduct.length > 0) {
        csv += "New Customers By Product Name\nProduct Name,Customer Count,Count Change,Revenue ($),Rev Change\n";
        newCustomersByProduct.forEach(p => {
          csv += `"${p.productName || p.name || ''}",${p.customers || p.qty || 0},"${p.countChange || ''}",${p.revenue || 0},"${p.revChange || ''}"\n`;
        });
        csv += "\n";
      }

      if (newCustomersByTraffic.length > 0) {
        csv += "New Customers By Traffic Channel\nTraffic Source,Customer Count,Count Change,Revenue ($),Rev Change\n";
        newCustomersByTraffic.forEach(t => {
          csv += `"${t.source || ''}",${t.customers || t.qty || 0},"${t.countChange || ''}",${t.revenue || 0},"${t.revChange || ''}"\n`;
        });
        csv += "\n";
      }

      if (revenueByTrafficSource.length > 0) {
        csv += "Revenue By Traffic Sources\nTraffic Source,Quantity,Qty Change,Revenue ($),Rev Change\n";
        revenueByTrafficSource.forEach(r => {
          csv += `"${r.source || ''}",${r.qty || 0},"${r.qtyChange || ''}",${r.revenue || 0},"${r.revChange || ''}"\n`;
        });
        csv += "\n";
      }

      // 2. Event Revenue Share (Chart Data)
      if (eventSales.length > 0) {
        csv += "Event Revenue Share (Chart Data)\nEvent Name,Revenue ($),Share (%)\n";
        eventSales.forEach(item => {
          const rev = item.revenue || 0;
          const share = totalEventRevenue > 0 ? ((rev / totalEventRevenue) * 100).toFixed(1) : 0;
          csv += `"${item.name || item.eventName || ''}",${rev},${share}%\n`;
        });
        csv += "\n";
      }

      // 3. Revenue Source by Event
      if (revSource.length > 0) {
        csv += "Revenue Source by Event\nEvent Name,Product Name,Source,Revenue ($)\n";
        revSource.forEach(item => {
          csv += `"${item.eventName || item.name || ''}","${item.productName || item.name || ''}","${item.source || ''}",${item.revenue || 0}\n`;
        });
        csv += "\n";
      }

      // 4. Sales by Event Name
      if (salesByEvent.length > 0) {
        csv += "Sales by Event Name\nEvent Name,Product Name,Orders,Revenue ($)\n";
        salesByEvent.forEach(item => {
          csv += `"${item.eventName || item.name || ''}","${item.productName || item.name || ''}",${item.orders || 0},${item.revenue || 0}\n`;
        });
        csv += "\n";
      }

      // 5. Specials Store Items
      if (quarterSpecials.length > 0) {
        csv += "Specials Store Items\nItem Name,Price ($),Quantity Sold,Total Revenue ($)\n";
        quarterSpecials.forEach(item => {
          csv += `"${item.name || ''}",${item.price || 0},${item.sold || item.sales || item.orders || 0},${item.revenue || 0}\n`;
        });
        csv += "\n";
      }

      // 6. Best Selling Products
      if (bestSellers.length > 0) {
        csv += "Best Selling Products\nCode,Product Name,Category,Units Sold,Revenue ($)\n";
        bestSellers.forEach(p => {
          csv += `${p.id || ''},"${p.name || ''}","${p.category || ''}",${p.sales || 0},${p.revenue || 0}\n`;
        });
        csv += "\n";
      }

      // 7. Low Performing Products
      if (lowPerformers.length > 0) {
        csv += "Low Performing Products\nCode,Product Name,Category,Units Sold,Revenue ($)\n";
        lowPerformers.forEach(p => {
          csv += `${p.id || ''},"${p.name || ''}","${p.category || ''}",${p.sales || p.orders || 0},${p.revenue || 0}\n`;
        });
        csv += "\n";
      }

      // 8. Revenue by Currency Share
      if (currencies.length > 0) {
        csv += "Revenue by Currency (Chart Data)\nCurrency Name,Share (%)\n";
        currencies.forEach(c => {
          csv += `"${c.name || ''}",${c.value || 0}%\n`;
        });
        csv += "\n";
      }

      // 9. Sales Growth Stats Map (Heat Map Data)
      if (geoData.length > 1) {
        csv += "Sales Growth Stats Map (Heat Map Data)\nCountry Code,Revenue Share (%)\n";
        geoData.slice(1).forEach(row => {
          csv += `"${row[0]}",${row[1]}%\n`;
        });
        csv += "\n";
      }

      if (newMemberTrendByCurrency.length > 0) {
        csv += "New Member Trend By Currency\nPeriod,Total New,USD,MYR,INR\n";
        newMemberTrendByCurrency.forEach(r => {
          csv += `"${r.period}",${r.total},${r.usd},${r.myr},${r.inr}\n`;
        });
        csv += "\n";
      }

      if (comparisonOfRevenueBySource.length > 0) {
        csv += "Comparison of Revenue By Source\nTraffic Group,Expected,Projected,Proj Change,Revenue ($),Rev Change\n";
        comparisonOfRevenueBySource.forEach(r => {
          csv += `"${r.group}",${r.expected || 0},${r.projected || 0},"${r.projChange || ''}",${r.revenue || 0},"${r.revChange || ''}"\n`;
        });
        csv += "\n";
      }

      // Newsletter Page Complete Datasets Export
      if (categorySales.length > 0) {
        csv += "Category Wise Sales Insights\nEvent Name,NetRevenue ($)\n";
        categorySales.forEach(item => {
          csv += `"${item.name || ''}",${item.revenue || 0}\n`;
        });
        csv += "\n";
      }

      if (dateWisePerformance.length > 0) {
        csv += "Date Wise Newsletter Performance\nNews Letter Sent Date,NewsLetter Name,Net Revenue In ($)\n";
        dateWisePerformance.forEach(item => {
          csv += `"${item.date || ''}","${item.name || ''}",${item.revenue || 0}\n`;
        });
        csv += "\n";
      }

      if (overallPerformanceData.length > 0) {
        csv += "Over All NewsLetter Statistics Summary\nNL Sent Date,NewsLetter Name,Subject,Type,Sent,Unsubscribe,Open,Open Rate (%),Clicks,Click/Open\n";
        overallPerformanceData.forEach(item => {
          csv += `"${item.date || ''}","${item.name || ''}","${item.subject || ''}","${item.type || ''}",${item.sent || 0},${item.unsub || 0},${item.open || 0},${item.openRate || 0},${item.clicks || 0},${item.clickOpen || 0}\n`;
        });
        csv += "\n";
      }

      if (breakupSummary.length > 0) {
        csv += "Breakup Summary of Overall Newsletters\nNewsLetter Type,NewsLetter Count,Net Revenue IN ($)\n";
        breakupSummary.forEach(item => {
          csv += `"${item.type || ''}",${item.count || 0},${item.revenue || 0}\n`;
        });
        csv += "\n";
      }

      if (typesCompared.length > 0) {
        csv += "Types Of NewsLetter Compared With Last Month\nNews Letter Type,News Letter Count,% Δ,Net Revenue In ($),% Δ\n";
        typesCompared.forEach(item => {
          csv += `"${item.type || ''}",${item.count || 0},"${item.countPct !== null && item.countPct !== undefined ? item.countPct + '%' : '-'}",${item.revenue || 0},"${item.revPct !== null && item.revPct !== undefined ? item.revPct + '%' : '-'}"\n`;
        });
        csv += "\n";
      }

      if (overallEventsData.length > 0) {
        csv += "Overall Newsletters Performance\nEvent Name,NLW,NLI,OML\n";
        overallEventsData.forEach(item => {
          csv += `"${item.name || ''}",${item.nlw || 0},${item.nli || 0},${item.oml || 0}\n`;
        });
        csv += "\n";
      }

      if (specialEventsData.length > 0) {
        csv += "Special Events Newsletters Performance\nEvent Name,NLW,NLI,OML\n";
        specialEventsData.forEach(item => {
          csv += `"${item.name || ''}",${item.nlw || 0},${item.nli || 0},${item.oml || 0}\n`;
        });
        csv += "\n";
      }

      if (specialEventsPerformanceData.length > 0) {
        csv += "Special Events NewsLetter Statistics Summary\nNL Sent Date,NewsLetter Name,Subject,Type,Sent,Unsubscribe,Open,Open Rate (%),Clicks,Click/Open\n";
        specialEventsPerformanceData.forEach(item => {
          csv += `"${item.date || ''}","${item.name || ''}","${item.subject || ''}","${item.type || ''}",${item.sent || 0},${item.unsub || 0},${item.open || 0},${item.openRate || 0},${item.clicks || 0},${item.clickOpen || 0}\n`;
        });
        csv += "\n";
      }

      const bom = "\ufeff";
      const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", getExportFileName('csv'));
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
      const wb = XLSX.utils.book_new();

      const {
        cards,
        revSource,
        eventSales,
        salesByEvent,
        quarterSpecials,
        bestSellers,
        lowPerformers,
        currencies,
        geoData,
        customerMetricsRows,
        customerMetricsLabels,
        demographics,
        newCustomersByEvent,
        newCustomersByProduct,
        highContributors,
        newCustomersByTraffic,
        revenueByTrafficSource,
        newMemberTrendByCurrency,
        comparisonOfRevenueBySource,
        categorySales,
        dateWisePerformance,
        overallPerformanceData,
        breakupSummary,
        typesCompared,
        overallEventsData,
        specialEventsData,
        specialEventsPerformanceData
      } = resolveExportData();

      const totalEventRevenue = eventSales.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

      // Master Summary Sheet (Array of Arrays)
      const summaryRows = [
        [`AstroVed BI Portal - ${pageTitle} (${exportPeriod} Report)`],
        [`Selected Period: ${exportPeriod}`],
        [`Generated on: ${new Date().toLocaleString()}`],
        [],
        ["--- PERFORMANCE OVERVIEW METRICS ---"],
        ["Metric", "Value", "Change"],
        ...cards.map(c => [c.title, c.value, c.change]),
        []
      ];

      if (customerMetricsRows.length > 0) {
        summaryRows.push(
          ["--- CUSTOMER PERFORMANCE METRICS OVERVIEW ---"],
          ["Metric", customerMetricsLabels[0] || 'Older', customerMetricsLabels[1] || 'Previous', customerMetricsLabels[2] || 'Current'],
          ...customerMetricsRows.map(r => [r.metric, r.col1, r.col2, r.col3]),
          []
        );
      }

      if (demographics) {
        summaryRows.push(
          ["--- CUSTOMER DEMOGRAPHICS BREAKDOWN ---"],
          ["Cohort", "Total Members", "USD Members", "MYR Members", "INR Members"],
          ["New Registered Members", demographics.newTotal || 0, demographics.newUsd || 0, demographics.newMyr || 0, demographics.newInr || 0],
          ["Returning Members", demographics.retTotal || 0, demographics.retUsd || 0, demographics.retMyr || 0, demographics.retInr || 0],
          []
        );
      }

      if (highContributors.length > 0) {
        summaryRows.push(
          ["--- HIGH CONTRIBUTOR CUSTOMER ACCOUNTS ---"],
          ["Customer Name", "Email", "Country", "Orders", "Total Revenue ($)"],
          ...highContributors.map(c => [c.customerName || c.name || '', c.email || '', c.country || '', c.orders || 0, c.revenue || 0]),
          []
        );
      }

      if (newCustomersByEvent.length > 0) {
        summaryRows.push(
          ["--- NEW CUSTOMERS BY EVENT NAME ---"],
          ["Event Name", "Customer Count", "Count Change", "Revenue ($)", "Rev Change"],
          ...newCustomersByEvent.map(e => [e.eventName || e.name || '', e.customers || e.qty || 0, e.countChange || '', e.revenue || 0, e.revChange || '']),
          []
        );
      }

      if (newCustomersByProduct.length > 0) {
        summaryRows.push(
          ["--- NEW CUSTOMERS BY PRODUCT NAME ---"],
          ["Product Name", "Customer Count", "Count Change", "Revenue ($)", "Rev Change"],
          ...newCustomersByProduct.map(p => [p.productName || p.name || '', p.customers || p.qty || 0, p.countChange || '', p.revenue || 0, p.revChange || '']),
          []
        );
      }

      if (newCustomersByTraffic.length > 0) {
        summaryRows.push(
          ["--- NEW CUSTOMERS BY TRAFFIC CHANNEL ---"],
          ["Traffic Source", "Customer Count", "Count Change", "Revenue ($)", "Rev Change"],
          ...newCustomersByTraffic.map(t => [t.source || '', t.customers || t.qty || 0, t.countChange || '', t.revenue || 0, t.revChange || '']),
          []
        );
      }

      if (revenueByTrafficSource.length > 0) {
        summaryRows.push(
          ["--- REVENUE BY TRAFFIC SOURCES ---"],
          ["Traffic Source", "Quantity", "Qty Change", "Revenue ($)", "Rev Change"],
          ...revenueByTrafficSource.map(r => [r.source || '', r.qty || 0, r.qtyChange || '', r.revenue || 0, r.revChange || '']),
          []
        );
      }

      if (eventSales.length > 0) {
        summaryRows.push(
          ["--- EVENT REVENUE SHARE ---"],
          ["Event Name", "Revenue ($)", "Share (%)"],
          ...eventSales.map(item => [item.name || item.eventName || '', item.revenue || 0, `${totalEventRevenue > 0 ? ((item.revenue / totalEventRevenue) * 100).toFixed(1) : 0}%`]),
          []
        );
      }

      if (revSource.length > 0) {
        summaryRows.push(
          ["--- REVENUE SOURCE BY EVENT ---"],
          ["Event Name", "Product Name", "Source", "Revenue ($)"],
          ...revSource.map(item => [item.eventName || item.name || '', item.productName || item.name || '', item.source || '', item.revenue || 0]),
          []
        );
      }

      if (salesByEvent.length > 0) {
        summaryRows.push(
          ["--- SALES BY EVENT NAME ---"],
          ["Event Name", "Product Name", "Orders", "Revenue ($)"],
          ...salesByEvent.map(item => [item.eventName || item.name || '', item.productName || item.name || '', item.orders || 0, item.revenue || 0]),
          []
        );
      }

      if (quarterSpecials.length > 0) {
        summaryRows.push(
          ["--- SPECIALS STORE ITEMS ---"],
          ["Item Name", "Price ($)", "Quantity Sold", "Total Revenue ($)"],
          ...quarterSpecials.map(item => [item.name || '', item.price || 0, item.sold || item.sales || item.orders || 0, item.revenue || 0]),
          []
        );
      }

      if (bestSellers.length > 0) {
        summaryRows.push(
          ["--- BEST SELLING PRODUCTS ---"],
          ["Code", "Product Name", "Category", "Units Sold", "Revenue ($)"],
          ...bestSellers.map(p => [p.id || '', p.name || '', p.category || '', p.sales || 0, p.revenue || 0]),
          []
        );
      }

      if (lowPerformers.length > 0) {
        summaryRows.push(
          ["--- LOW PERFORMING PRODUCTS ---"],
          ["Code", "Product Name", "Category", "Units Sold", "Revenue ($)"],
          ...lowPerformers.map(p => [p.id || '', p.name || '', p.category || '', p.sales || p.orders || 0, p.revenue || 0]),
          []
        );
      }

      if (currencies.length > 0) {
        summaryRows.push(
          ["--- REVENUE BY CURRENCY SHARE ---"],
          ["Currency Name", "Share (%)"],
          ...currencies.map(c => [c.name || '', `${c.value || 0}%`]),
          []
        );
      }

      if (geoData.length > 1) {
        summaryRows.push(
          ["--- SALES GROWTH STATS MAP (GEO HEAT MAP) ---"],
          ["Country Code", "Revenue Share (%)"],
          ...geoData.slice(1).map(r => [r[0], `${r[1]}%`]),
          []
        );
      }

      if (newMemberTrendByCurrency.length > 0) {
        summaryRows.push(
          ["--- NEW MEMBER TREND BY CURRENCY ---"],
          ["Period", "Total New", "USD", "MYR", "INR"],
          ...newMemberTrendByCurrency.map(r => [r.period, r.total, r.usd, r.myr, r.inr]),
          []
        );
      }

      if (comparisonOfRevenueBySource.length > 0) {
        summaryRows.push(
          ["--- COMPARISON OF REVENUE BY SOURCE ---"],
          ["Traffic Group", "Expected", "Projected", "Proj Change", "Revenue ($)", "Rev Change"],
          ...comparisonOfRevenueBySource.map(r => [r.group, r.expected || 0, r.projected || 0, r.projChange || '', r.revenue || 0, r.revChange || '']),
          []
        );
      }

      if (categorySales.length > 0) {
        summaryRows.push(
          ["Category Wise Sales Insights"],
          ["Event Name", "NetRevenue ($)"],
          ...categorySales.map(item => [item.name || '', item.revenue || 0]),
          []
        );
      }

      if (dateWisePerformance.length > 0) {
        summaryRows.push(
          ["Date Wise Newsletter Performance"],
          ["News Letter Sent Date", "NewsLetter Name", "Net Revenue In ($)"],
          ...dateWisePerformance.map(item => [item.date || '', item.name || '', item.revenue || 0]),
          []
        );
      }

      if (overallPerformanceData.length > 0) {
        summaryRows.push(
          ["Over All NewsLetter Statistics Summary"],
          ["NL Sent Date", "NewsLetter Name", "Subject", "Type", "Sent", "Unsubscribe", "Open", "Open Rate (%)", "Clicks", "Click/Open"],
          ...overallPerformanceData.map(item => [item.date || '', item.name || '', item.subject || '', item.type || '', item.sent || 0, item.unsub || 0, item.open || 0, item.openRate || 0, item.clicks || 0, item.clickOpen || 0]),
          []
        );
      }

      if (breakupSummary.length > 0) {
        summaryRows.push(
          ["Breakup Summary of Overall Newsletters"],
          ["NewsLetter Type", "NewsLetter Count", "Net Revenue IN ($)"],
          ...breakupSummary.map(item => [item.type || '', item.count || 0, item.revenue || 0]),
          []
        );
      }

      if (typesCompared.length > 0) {
        summaryRows.push(
          ["Types Of NewsLetter Compared With Last Month"],
          ["News Letter Type", "News Letter Count", "% Δ", "Net Revenue In ($)", "% Δ"],
          ...typesCompared.map(item => [item.type || '', item.count || 0, item.countPct !== null && item.countPct !== undefined ? item.countPct + '%' : '-', item.revenue || 0, item.revPct !== null && item.revPct !== undefined ? item.revPct + '%' : '-']),
          []
        );
      }

      if (overallEventsData.length > 0) {
        summaryRows.push(
          ["Overall Newsletters Performance"],
          ["Event Name", "NLW", "NLI", "OML"],
          ...overallEventsData.map(item => [item.name || '', item.nlw || 0, item.nli || 0, item.oml || 0]),
          []
        );
      }

      if (specialEventsData.length > 0) {
        summaryRows.push(
          ["Special Events Newsletters Performance"],
          ["Event Name", "NLW", "NLI", "OML"],
          ...specialEventsData.map(item => [item.name || '', item.nlw || 0, item.nli || 0, item.oml || 0]),
          []
        );
      }

      if (specialEventsPerformanceData.length > 0) {
        summaryRows.push(
          ["Special Events NewsLetter Statistics Summary"],
          ["NL Sent Date", "NewsLetter Name", "Subject", "Type", "Sent", "Unsubscribe", "Open", "Open Rate (%)", "Clicks", "Click/Open"],
          ...specialEventsPerformanceData.map(item => [item.date || '', item.name || '', item.subject || '', item.type || '', item.sent || 0, item.unsub || 0, item.open || 0, item.openRate || 0, item.clicks || 0, item.clickOpen || 0]),
          []
        );
      }

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Full Summary");

      // Individual Dedicated Tabs
      if (cards.length > 0) {
        const wsCards = XLSX.utils.json_to_sheet(cards.map(c => ({ Metric: c.title, Value: c.value, Change: c.change })));
        XLSX.utils.book_append_sheet(wb, wsCards, "Metrics");
      }
      if (customerMetricsRows.length > 0) {
        const wsCustMetrics = XLSX.utils.json_to_sheet(customerMetricsRows.map(r => ({
          Metric: r.metric,
          [customerMetricsLabels[0] || 'Older']: r.col1,
          [customerMetricsLabels[1] || 'Previous']: r.col2,
          [customerMetricsLabels[2] || 'Current']: r.col3
        })));
        XLSX.utils.book_append_sheet(wb, wsCustMetrics, "Customer Metrics");
      }
      if (highContributors.length > 0) {
        const wsHigh = XLSX.utils.json_to_sheet(highContributors.map(c => ({
          "Customer Name": c.customerName || c.name || '',
          Email: c.email || '',
          Country: c.country || '',
          Orders: c.orders || 0,
          "Total Revenue ($)": c.revenue || 0
        })));
        XLSX.utils.book_append_sheet(wb, wsHigh, "High Contributors");
      }
      if (newCustomersByEvent.length > 0) {
        const wsCustEvent = XLSX.utils.json_to_sheet(newCustomersByEvent.map(e => ({
          "Event Name": e.eventName || e.name || '',
          "Customer Count": e.customers || e.qty || 0,
          "Count Change": e.countChange || '',
          "Revenue ($)": e.revenue || 0,
          "Rev Change": e.revChange || ''
        })));
        XLSX.utils.book_append_sheet(wb, wsCustEvent, "Customers By Event");
      }
      if (newCustomersByProduct.length > 0) {
        const wsCustProd = XLSX.utils.json_to_sheet(newCustomersByProduct.map(p => ({
          "Product Name": p.productName || p.name || '',
          "Customer Count": p.customers || p.qty || 0,
          "Count Change": p.countChange || '',
          "Revenue ($)": p.revenue || 0,
          "Rev Change": p.revChange || ''
        })));
        XLSX.utils.book_append_sheet(wb, wsCustProd, "Customers By Product");
      }
      if (revenueByTrafficSource.length > 0) {
        const wsRevTraffic = XLSX.utils.json_to_sheet(revenueByTrafficSource.map(r => ({
          "Traffic Source": r.source || '',
          Quantity: r.qty || 0,
          "Qty Change": r.qtyChange || '',
          "Revenue ($)": r.revenue || 0,
          "Rev Change": r.revChange || ''
        })));
        XLSX.utils.book_append_sheet(wb, wsRevTraffic, "Revenue By Traffic");
      }
      if (eventSales.length > 0) {
        const wsEventShare = XLSX.utils.json_to_sheet(eventSales.map(item => ({
          "Event Name": item.name || item.eventName || '',
          "Revenue ($)": item.revenue || 0,
          "Share (%)": `${totalEventRevenue > 0 ? ((item.revenue / totalEventRevenue) * 100).toFixed(1) : 0}%`
        })));
        XLSX.utils.book_append_sheet(wb, wsEventShare, "Event Revenue Share");
      }
      if (revSource.length > 0) {
        const wsRevSource = XLSX.utils.json_to_sheet(revSource.map(item => ({
          "Event Name": item.eventName || item.name || '',
          "Product Name": item.productName || item.name || '',
          "Source": item.source || '',
          "Revenue ($)": item.revenue || 0
        })));
        XLSX.utils.book_append_sheet(wb, wsRevSource, "Revenue Source");
      }
      if (salesByEvent.length > 0) {
        const wsSalesEvent = XLSX.utils.json_to_sheet(salesByEvent.map(item => ({
          "Event Name": item.eventName || item.name || '',
          "Product Name": item.productName || item.name || '',
          "Orders": item.orders || 0,
          "Revenue ($)": item.revenue || 0
        })));
        XLSX.utils.book_append_sheet(wb, wsSalesEvent, "Sales By Event");
      }
      if (quarterSpecials.length > 0) {
        const wsSpecials = XLSX.utils.json_to_sheet(quarterSpecials.map(item => ({
          "Item Name": item.name || '',
          "Price ($)": item.price || 0,
          "Quantity Sold": item.sold || item.sales || item.orders || 0,
          "Total Revenue ($)": item.revenue || 0
        })));
        XLSX.utils.book_append_sheet(wb, wsSpecials, "Specials Store Items");
      }
      if (bestSellers.length > 0) {
        const wsBest = XLSX.utils.json_to_sheet(bestSellers.map(p => ({ Code: p.id, Product: p.name, Category: p.category, Sold: p.sales, Revenue: p.revenue })));
        XLSX.utils.book_append_sheet(wb, wsBest, "Best Sellers");
      }
      if (lowPerformers.length > 0) {
        const wsLow = XLSX.utils.json_to_sheet(lowPerformers.map(p => ({ Code: p.id, Product: p.name, Category: p.category, Sold: p.sales || p.orders || 0, Revenue: p.revenue })));
        XLSX.utils.book_append_sheet(wb, wsLow, "Low Performers");
      }
      if (geoData.length > 1) {
        const wsGeo = XLSX.utils.json_to_sheet(geoData.slice(1).map(r => ({ "Country Code": r[0], "Revenue Share (%)": r[1] })));
        XLSX.utils.book_append_sheet(wb, wsGeo, "Sales Growth Map");
      }
      if (newMemberTrendByCurrency.length > 0) {
        const wsTrend = XLSX.utils.json_to_sheet(newMemberTrendByCurrency.map(r => ({
          Period: r.period,
          "Total New": r.total,
          USD: r.usd,
          MYR: r.myr,
          INR: r.inr
        })));
        XLSX.utils.book_append_sheet(wb, wsTrend, "New Member Trend");
      }

      if (comparisonOfRevenueBySource.length > 0) {
        const wsComp = XLSX.utils.json_to_sheet(comparisonOfRevenueBySource.map(r => ({
          "Traffic Group": r.group,
          Expected: r.expected || 0,
          Projected: r.projected || 0,
          "Proj Change": r.projChange || '',
          "Revenue ($)": r.revenue || 0,
          "Rev Change": r.revChange || ''
        })));
        XLSX.utils.book_append_sheet(wb, wsComp, "Revenue By Source");
      }

      XLSX.writeFile(wb, getExportFileName('xlsx'));
      toast.success(`${exportPeriod} Excel report (.xlsx) downloaded successfully!`);
    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to export Excel report: " + err.message);
    }
  };

  const handleExportPDF = () => {
    try {
      const {
        cards,
        revSource,
        eventSales,
        salesByEvent,
        quarterSpecials,
        bestSellers,
        lowPerformers,
        currencies,
        geoData,
        customerMetricsRows,
        customerMetricsLabels,
        demographics,
        newCustomersByEvent,
        newCustomersByProduct,
        highContributors,
        newCustomersByTraffic,
        revenueByTrafficSource,
        newMemberTrendByCurrency,
        comparisonOfRevenueBySource,
        categorySales,
        dateWisePerformance,
        overallPerformanceData,
        breakupSummary,
        typesCompared,
        overallEventsData,
        specialEventsData,
        specialEventsPerformanceData
      } = resolveExportData();

      const totalEventRevenue = eventSales.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

      let maxSourceRev = 10000;
      if (comparisonOfRevenueBySource && comparisonOfRevenueBySource.length > 0) {
        comparisonOfRevenueBySource.forEach(item => {
           const target = parseFloat(item.expected) || 0;
           const rev = parseFloat(item.revenue) || 0;
           const proj = parseFloat(item.projected) || 0;
           maxSourceRev = Math.max(maxSourceRev, target, rev, proj);
        });
        maxSourceRev = maxSourceRev * 1.1; // Add 10% headroom
      }
      // Geo Heat Map Helper
      const countryNames = {
        'IN': 'India (IN)',
        'US': 'United States (US)',
        'MY': 'Malaysia (MY)',
        'NP': 'Nepal (NP)',
        'LK': 'Sri Lanka (LK)',
        'SG': 'Singapore (SG)',
        'PH': 'Philippines (PH)',
        'CN': 'China (CN)'
      };
      const geoRows = (geoData.length > 1 ? geoData.slice(1) : []).map(r => ({
        code: r[0],
        name: countryNames[r[0]] || r[0],
        share: r[1]
      }));



      const printContent = `
        <html>
        <head>
          <title>${getExportFileName('pdf')}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
            h1 { color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 22px; }
            h2 { color: #4338ca; font-size: 15px; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #334155; }
            .badge-green { color: #16a34a; font-weight: bold; }
            .badge-red { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>AstroVed BI Portal - ${pageTitle}</h1>
          <div class="meta">
            <strong>Selected Period:</strong> ${exportPeriod}<br/>
            <strong>Date Generated:</strong> ${new Date().toLocaleString()}
          </div>
          
          <h2>1. Performance Metrics (${exportPeriod})</h2>
          <table>
            <thead><tr><th>Metric</th><th>Value</th><th>Change</th></tr></thead>
            <tbody>
              ${cards.map(c => `<tr><td>${c.title}</td><td>${c.value}</td><td>${c.change}</td></tr>`).join('')}
            </tbody>
          </table>

          ${customerMetricsRows.length > 0 ? `
            <h2>Customer Performance Metrics Overview (${customerMetricsLabels.join(' vs ')})</h2>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>${customerMetricsLabels[0] || 'Older'}</th>
                  <th>${customerMetricsLabels[1] || 'Previous'}</th>
                  <th>${customerMetricsLabels[2] || 'Current'}</th>
                </tr>
              </thead>
              <tbody>
                ${customerMetricsRows.map(r => `<tr><td>${r.metric}</td><td>${r.col1}</td><td>${r.col2}</td><td class="badge-green">${r.col3}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${demographics ? `
            <h2>Customer Demographics Breakdown</h2>
            <table>
              <thead>
                <tr><th>Cohort</th><th>Total Members</th><th>USD Members</th><th>MYR Members</th><th>INR Members</th></tr>
              </thead>
              <tbody>
                <tr><td>New Registered Members</td><td>${demographics.newTotal || 0}</td><td>${demographics.newUsd || 0}</td><td>${demographics.newMyr || 0}</td><td>${demographics.newInr || 0}</td></tr>
                <tr><td>Returning Members</td><td>${demographics.retTotal || 0}</td><td>${demographics.retUsd || 0}</td><td>${demographics.retMyr || 0}</td><td>${demographics.retInr || 0}</td></tr>
              </tbody>
            </table>
          ` : ''}

          ${highContributors.length > 0 ? `
            <h2>High Contributor Customer Accounts</h2>
            <table>
              <thead>
                <tr><th>Customer Name</th><th>Email</th><th>Country</th><th>Orders</th><th>Total Revenue ($)</th></tr>
              </thead>
              <tbody>
                ${highContributors.map(c => `<tr><td>${c.customerName || c.name || ''}</td><td>${c.email || ''}</td><td>${c.country || ''}</td><td>${c.orders || 0}</td><td class="badge-green">$${(c.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${newCustomersByEvent.length > 0 ? `
            <h2>New Customers By Event Name</h2>
            <table>
              <thead>
                <tr><th>Event Name</th><th>Customer Count</th><th>Count Δ</th><th>Revenue ($)</th><th>Rev Δ</th></tr>
              </thead>
              <tbody>
                ${newCustomersByEvent.map(e => `<tr><td>${e.eventName || e.name || ''}</td><td>${e.customers || e.qty || 0}</td><td>${e.countChange || '-'}</td><td class="badge-green">$${(e.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>${e.revChange || '-'}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${newCustomersByProduct.length > 0 ? `
            <h2>New Customers By Product Name</h2>
            <table>
              <thead>
                <tr><th>Product Name</th><th>Customer Count</th><th>Count Δ</th><th>Revenue ($)</th><th>Rev Δ</th></tr>
              </thead>
              <tbody>
                ${newCustomersByProduct.map(p => `<tr><td>${p.productName || p.name || ''}</td><td>${p.customers || p.qty || 0}</td><td>${p.countChange || '-'}</td><td class="badge-green">$${(p.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>${p.revChange || '-'}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${newCustomersByTraffic.length > 0 ? `
            <h2>New Customers By Traffic Channel</h2>
            <table>
              <thead>
                <tr><th>Traffic Source</th><th>Customer Count</th><th>Count Δ</th><th>Revenue ($)</th><th>Rev Δ</th></tr>
              </thead>
              <tbody>
                ${newCustomersByTraffic.map(t => `<tr><td>${t.source || ''}</td><td>${t.customers || t.qty || 0}</td><td>${t.countChange || '-'}</td><td class="badge-green">$${(t.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>${t.revChange || '-'}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${revenueByTrafficSource.length > 0 ? `
            <h2>Revenue By Traffic Sources</h2>
            <table>
              <thead>
                <tr><th>Traffic Source</th><th>Quantity</th><th>Qty Δ</th><th>Revenue ($)</th><th>Rev Δ</th></tr>
              </thead>
              <tbody>
                ${revenueByTrafficSource.map(r => `<tr><td>${r.source || ''}</td><td>${r.qty || 0}</td><td>${r.qtyChange || '-'}</td><td class="badge-green">$${(r.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>${r.revChange || '-'}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${newMemberTrendByCurrency.length > 0 ? `
            <h2>New Member Trend By Currency</h2>
            <table>
              <thead>
                <tr><th>Period</th><th>Total New</th><th>USD</th><th>MYR</th><th>INR</th></tr>
              </thead>
              <tbody>
                ${newMemberTrendByCurrency.map(r => `<tr><td>${r.period}</td><td>${r.total}</td><td>${r.usd}</td><td>${r.myr}</td><td>${r.inr}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${comparisonOfRevenueBySource.length > 0 ? `
            <h2>Comparison of Revenue By Source</h2>
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:25px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size:13px; font-weight:bold; color:#1e1b4b; margin-bottom:12px; text-align:center; text-transform:uppercase; letter-spacing:0.5px;">
                📊 Comparison of Revenue by Source
              </div>
              <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-bottom:15px; font-size:10px; font-weight:bold;">
                <span style="color:#3b82f6;">🟦 Target Final</span>
                <span style="color:#22c55e;">🟩 Revenue</span>
                <span style="color:#f59e0b;">🟧 Projected Final</span>
              </div>
              <svg width="680" height="320" viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg">
                <!-- Y-Grid lines -->
                <line x1="60" y1="20" x2="650" y2="20" stroke="#f1f5f9" stroke-width="1" />
                <text x="50" y="24" text-anchor="end" fill="#94a3b8" font-size="9">${Math.round(maxSourceRev).toLocaleString()}</text>

                <line x1="60" y1="70" x2="650" y2="70" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3" />
                <text x="50" y="74" text-anchor="end" fill="#94a3b8" font-size="9">${Math.round(maxSourceRev*0.75).toLocaleString()}</text>

                <line x1="60" y1="120" x2="650" y2="120" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3" />
                <text x="50" y="124" text-anchor="end" fill="#94a3b8" font-size="9">${Math.round(maxSourceRev*0.5).toLocaleString()}</text>

                <line x1="60" y1="170" x2="650" y2="170" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="3 3" />
                <text x="50" y="174" text-anchor="end" fill="#94a3b8" font-size="9">${Math.round(maxSourceRev*0.25).toLocaleString()}</text>

                <line x1="60" y1="220" x2="650" y2="220" stroke="#cbd5e1" stroke-width="1.5" />
                <text x="50" y="224" text-anchor="end" fill="#94a3b8" font-size="9">0</text>

                <!-- Bars and X Axis Labels -->
                ${comparisonOfRevenueBySource.map((r, idx) => {
                  const numItems = comparisonOfRevenueBySource.length;
                  const groupW = 590 / Math.max(numItems, 1);
                  const xCenter = 60 + (idx * groupW) + (groupW / 2);
                  const barW = Math.min(10, groupW / 4); // Max width of 10 for each bar
                  
                  const target = parseFloat(r.expected) || 0;
                  const rev = parseFloat(r.revenue) || 0;
                  const proj = parseFloat(r.projected) || 0;
                  
                  const hTarget = maxSourceRev > 0 ? (target / maxSourceRev) * 200 : 0;
                  const hRev = maxSourceRev > 0 ? (rev / maxSourceRev) * 200 : 0;
                  const hProj = maxSourceRev > 0 ? (proj / maxSourceRev) * 200 : 0;
                  
                  // Label rotation calculation
                  const label = (r.group || '').length > 15 ? (r.group || '').substring(0, 13) + '...' : (r.group || '');
                  
                  return `
                    <g>
                      <!-- Target Final Bar -->
                      <rect x="${xCenter - barW * 1.5 - 1}" y="${220 - hTarget}" width="${barW}" height="${hTarget}" fill="#3b82f6" rx="1" />
                      <!-- Revenue Bar -->
                      <rect x="${xCenter - barW / 2}" y="${220 - hRev}" width="${barW}" height="${hRev}" fill="#22c55e" rx="1" />
                      <!-- Projected Final Bar -->
                      <rect x="${xCenter + barW / 2 + 1}" y="${220 - hProj}" width="${barW}" height="${hProj}" fill="#f59e0b" rx="1" />
                      
                      <!-- X Axis Label -->
                      <text x="${xCenter}" y="235" text-anchor="end" fill="#64748b" font-size="9" font-weight="600" transform="rotate(-45 ${xCenter} 235)">${label}</text>
                    </g>
                  `;
                }).join('')}
              </svg>
            </div>
            <table>
              <thead>
                <tr><th>Traffic Group</th><th>Expected</th><th>Projected</th><th>Proj Δ</th><th>Revenue ($)</th><th>Rev Δ</th></tr>
              </thead>
              <tbody>
                ${comparisonOfRevenueBySource.map(r => `<tr><td>${r.group}</td><td>${r.expected || 0}</td><td>${r.projected || 0}</td><td>${r.projChange || '-'}</td><td class="badge-green">$${(r.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>${r.revChange || '-'}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${geoRows.length > 0 ? `
            <h2>2. Sales Growth Stats Map (Heat Map Visual)</h2>
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:25px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size:13px; font-weight:bold; color:#1e1b4b; margin-bottom:10px; text-align:center; text-transform:uppercase; letter-spacing:0.5px;">
                🗺️ Regional Sales Growth Heat Map Distribution
              </div>
              <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:15px; font-size:11px; color:#64748b;">
                <span>Heat Intensity Scale:</span>
                <span style="display:inline-block; width:140px; height:10px; border-radius:5px; background:linear-gradient(90deg, #c7d2fe 0%, #6868f9 50%, #3730a3 100%);"></span>
                <span style="font-weight:bold; color:#3730a3;">High Volume</span>
              </div>
              <svg width="680" height="${geoRows.length * 38 + 20}" viewBox="0 0 680 ${geoRows.length * 38 + 20}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="heatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#c7d2fe" />
                    <stop offset="50%" stop-color="#6868f9" />
                    <stop offset="100%" stop-color="#3730a3" />
                  </linearGradient>
                </defs>
                ${geoRows.map((item, idx) => {
                  const maxShare = Math.max(...geoRows.map(r => r.share || 0), 1);
                  const share = item.share || 0;
                  const barW = Math.max(15, Math.round((share / maxShare) * 360));
                  const yPos = idx * 38 + 10;
                  return `
                    <g>
                      <text x="160" y="${yPos + 16}" text-anchor="end" fill="#1e293b" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">${item.name}</text>
                      <rect x="175" y="${yPos}" width="360" height="22" rx="5" fill="#f1f5f9" />
                      <rect x="175" y="${yPos}" width="${barW}" height="22" rx="5" fill="url(#heatGrad)" />
                      <text x="${185 + barW}" y="${yPos + 15}" fill="#3730a3" font-size="11" font-weight="bold" font-family="Segoe UI, sans-serif">${share}% Share</text>
                    </g>
                  `;
                }).join('')}
              </svg>
            </div>
          ` : ''}

          ${eventSales.length > 0 ? `
            <h2>4. Event Revenue Share Chart</h2>
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:25px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size:13px; font-weight:bold; color:#1e1b4b; margin-bottom:15px; text-align:center; text-transform:uppercase; letter-spacing:0.5px;">
                📊 Event Revenue Share Graphic Chart
              </div>
              <svg width="680" height="${eventSales.length * 36 + 30}" viewBox="0 0 680 ${eventSales.length * 36 + 30}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#6868f9" />
                    <stop offset="100%" stop-color="#3b82f6" />
                  </linearGradient>
                </defs>
                ${eventSales.map((item, idx) => {
                  const maxRev = Math.max(...eventSales.map(e => e.revenue || 0), 1);
                  const rev = item.revenue || 0;
                  const name = item.name || item.eventName || `Event #${idx + 1}`;
                  const share = totalEventRevenue > 0 ? ((rev / totalEventRevenue) * 100).toFixed(1) : 0;
                  const barW = Math.max(10, Math.round((rev / maxRev) * 320));
                  const yPos = idx * 36 + 15;
                  const truncatedName = name.length > 24 ? name.substring(0, 22) + '...' : name;

                  return `
                    <g>
                      <text x="170" y="${yPos + 14}" text-anchor="end" fill="#334155" font-size="11" font-weight="600" font-family="Segoe UI, sans-serif">${truncatedName}</text>
                      <rect x="180" y="${yPos}" width="320" height="20" rx="4" fill="#f1f5f9" />
                      <rect x="180" y="${yPos}" width="${barW}" height="20" rx="4" fill="url(#barGrad)" />
                      <text x="${188 + barW}" y="${yPos + 14}" fill="#16a34a" font-size="11" font-weight="bold" font-family="Segoe UI, sans-serif">$${rev.toLocaleString()} (${share}%)</text>
                    </g>
                  `;
                }).join('')}
              </svg>
            </div>
          ` : ''}

          ${revSource.length > 0 ? `
            <h2>5. Revenue Source by Event</h2>
            <table>
              <thead><tr><th>Event Name</th><th>Product Name</th><th>Source</th><th>Revenue</th></tr></thead>
              <tbody>
                ${revSource.map(item => `<tr><td>${item.eventName || item.name || ''}</td><td>${item.productName || item.name || ''}</td><td>${item.source || ''}</td><td class="badge-green">$${(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${salesByEvent.length > 0 ? `
            <h2>6. Sales by Event Name</h2>
            <table>
              <thead><tr><th>Event Name</th><th>Product Name</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>
                ${salesByEvent.map(item => `<tr><td>${item.eventName || item.name || ''}</td><td>${item.productName || item.name || ''}</td><td>${item.orders || 0}</td><td class="badge-green">$${(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${quarterSpecials.length > 0 ? `
            <h2>7. Specials Store Items</h2>
            <table>
              <thead><tr><th>Item Name</th><th>Price</th><th>Quantity Sold</th><th>Total Revenue</th></tr></thead>
              <tbody>
                ${quarterSpecials.map(item => `<tr><td>${item.name || ''}</td><td>$${item.price || 0}</td><td>${item.sold || item.sales || item.orders || 0}</td><td class="badge-green">$${(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${bestSellers.length > 0 ? `
            <h2>8. Best Selling Products</h2>
            <table>
              <thead><tr><th>Code</th><th>Product Name</th><th>Category</th><th>Units Sold</th><th>Revenue</th></tr></thead>
              <tbody>
                ${bestSellers.map(p => `<tr><td>${p.id || ''}</td><td>${p.name || ''}</td><td>${p.category || ''}</td><td>${p.sales || 0}</td><td class="badge-green">$${(p.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${lowPerformers.length > 0 ? `
            <h2>9. Low Performing Products</h2>
            <table>
              <thead><tr><th>Code</th><th>Product Name</th><th>Category</th><th>Units Sold</th><th>Revenue</th></tr></thead>
              <tbody>
                ${lowPerformers.map(p => `<tr><td>${p.id || ''}</td><td>${p.name || ''}</td><td>${p.category || ''}</td><td>${p.sales || p.orders || 0}</td><td class="badge-red">$${(p.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${currencies.length > 0 ? `
            <h2>10. Revenue by Currency Share (Chart Data)</h2>
            <table>
              <thead><tr><th>Currency Name</th><th>Share (%)</th></tr></thead>
              <tbody>
                ${currencies.map(c => `<tr><td>${c.name || ''}</td><td>${c.value || 0}%</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${categorySales.length > 0 ? `
            <h2>Category Wise Sales Insights</h2>
            <table>
              <thead><tr><th>Event Name</th><th>NetRevenue ($)</th></tr></thead>
              <tbody>
                ${categorySales.map(item => `<tr><td>${item.name || ''}</td><td class="badge-green">$${(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${dateWisePerformance.length > 0 ? `
            <h2>Date Wise Newsletter Performance</h2>
            <table>
              <thead><tr><th>News Letter Sent Date</th><th>NewsLetter Name</th><th>Net Revenue In ($)</th></tr></thead>
              <tbody>
                ${dateWisePerformance.map(item => `<tr><td>${item.date || ''}</td><td>${item.name || ''}</td><td class="badge-green">$${(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${overallPerformanceData.length > 0 ? `
            <h2>Over All NewsLetter Statistics Summary</h2>
            <table>
              <thead><tr><th>NL Sent Date</th><th>NewsLetter Name</th><th>Subject</th><th>Type</th><th>Sent</th><th>Unsubscribe</th><th>Open</th><th>Open Rate (%)</th><th>Clicks</th><th>Click/Open</th></tr></thead>
              <tbody>
                ${overallPerformanceData.map(item => `<tr><td>${item.date || ''}</td><td>${item.name || ''}</td><td>${item.subject || ''}</td><td>${item.type || ''}</td><td>${item.sent || 0}</td><td>${item.unsub || 0}</td><td>${item.open || 0}</td><td>${item.openRate || 0}%</td><td>${item.clicks || 0}</td><td>${item.clickOpen || 0}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${breakupSummary.length > 0 ? `
            <h2>Breakup Summary of Overall Newsletters</h2>
            <table>
              <thead><tr><th>NewsLetter Type</th><th>NewsLetter Count</th><th>Net Revenue IN ($)</th></tr></thead>
              <tbody>
                ${breakupSummary.map(item => `<tr><td>${item.type || ''}</td><td>${item.count || 0}</td><td class="badge-green">$${(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${typesCompared.length > 0 ? `
            <h2>Types Of NewsLetter Compared With Last Month</h2>
            <table>
              <thead><tr><th>News Letter Type</th><th>News Letter Count</th><th>% Δ</th><th>Net Revenue In ($)</th><th>% Δ</th></tr></thead>
              <tbody>
                ${typesCompared.map(item => `<tr><td>${item.type || ''}</td><td>${item.count || 0}</td><td>${item.countPct !== null && item.countPct !== undefined ? item.countPct + '%' : '-'}</td><td class="badge-green">$${(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>${item.revPct !== null && item.revPct !== undefined ? item.revPct + '%' : '-'}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${overallEventsData.length > 0 ? `
            <h2>Overall Newsletters Performance</h2>
            <table>
              <thead><tr><th>Event Name</th><th>NLW</th><th>NLI</th><th>OML</th></tr></thead>
              <tbody>
                ${overallEventsData.map(item => `<tr><td>${item.name || ''}</td><td>$${(item.nlw || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>$${(item.nli || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>$${(item.oml || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${specialEventsData.length > 0 ? `
            <h2>Special Events Newsletters Performance</h2>
            <table>
              <thead><tr><th>Event Name</th><th>NLW</th><th>NLI</th><th>OML</th></tr></thead>
              <tbody>
                ${specialEventsData.map(item => `<tr><td>${item.name || ''}</td><td>$${(item.nlw || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>$${(item.nli || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>$${(item.oml || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          ${specialEventsPerformanceData.length > 0 ? `
            <h2>Special Events NewsLetter Statistics Summary</h2>
            <table>
              <thead><tr><th>NL Sent Date</th><th>NewsLetter Name</th><th>Subject</th><th>Type</th><th>Sent</th><th>Unsubscribe</th><th>Open</th><th>Open Rate (%)</th><th>Clicks</th><th>Click/Open</th></tr></thead>
              <tbody>
                ${specialEventsPerformanceData.map(item => `<tr><td>${item.date || ''}</td><td>${item.name || ''}</td><td>${item.subject || ''}</td><td>${item.type || ''}</td><td>${item.sent || 0}</td><td>${item.unsub || 0}</td><td>${item.open || 0}</td><td>${item.openRate || 0}%</td><td>${item.clicks || 0}</td><td>${item.clickOpen || 0}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : ''}

          <script>
            window.onload = function() { window.print(); window.close(); }
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
      toast.success(`${exportPeriod} PDF report opened for printing!`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to export PDF report: " + err.message);
    }
  };

  const handleExportClick = (type) => {
    const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
    if (userPermissions?.data?.export === false) {
      toast.error('Access Denied: Your role profile does not have permission to Export data.');
      return;
    }
    if (userPermissions?.data?.download === false) {
      toast.error('Access Denied: Your role profile does not have permission to Download files.');
      return;
    }

    if (type === 'CSV') handleExportCSV();
    else if (type === 'Excel') handleExportExcel();
    else if (type === 'PDF') handleExportPDF();
  };

  return (
    <div className={`bg-white dark:bg-cosmic-card border border-gray-100 dark:border-cosmic-border p-5 rounded-xl flex flex-col space-y-4 shadow-sm max-w-lg w-full mt-6 ${className}`}>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">Export Reports</h4>

      {showPeriodTabs && (
        <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
          {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period, idx) => (
            <button
              key={period}
              onClick={() => {
                setExportPeriod(period);
                if (onPeriodChange) onPeriodChange(period);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-1 text-[11px] font-medium transition-all cursor-pointer ${exportPeriod === period
                ? 'bg-[#f0f7ff] dark:bg-blue-500/20 text-[#2563eb] dark:text-blue-400 border border-[#bfdbfe] dark:border-blue-500/30 rounded shadow-sm z-10'
                : 'text-slate-500 dark:text-slate-400 bg-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 border-y border-transparent ' + (exportPeriod !== period && idx !== 0 && exportPeriod !== ['Daily', 'Weekly', 'Monthly', 'Yearly'][idx - 1] ? 'border-l-[1px] border-l-slate-200 dark:border-l-slate-600' : 'border-l-0')
                }`}
            >
              <Calendar size={14} className={exportPeriod === period ? 'text-[#3b82f6]' : 'text-slate-400'} />
              {period}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2.5">
        <button
          onClick={() => handleExportClick('Excel')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#f4fbf7] dark:bg-emerald-500/10 border border-[#bbf7d0] dark:border-emerald-500/20 hover:bg-[#eaf8f0] dark:hover:bg-emerald-500/20 transition-all text-left group shadow-sm cursor-pointer"
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
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#fef2f2] dark:bg-rose-500/10 border border-[#fecaca] dark:border-rose-500/20 hover:bg-[#fee2e2] dark:hover:bg-rose-500/20 transition-all text-left group shadow-sm cursor-pointer"
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
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#f0f7ff] dark:bg-blue-500/10 border border-[#bfdbfe] dark:border-blue-500/20 hover:bg-[#e0f2fe] dark:hover:bg-blue-500/20 transition-all text-left group shadow-sm cursor-pointer"
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
  );
};

export default ExportReportsCard;
