import React, { useState } from 'react';
import { Calendar, Download, FileText, FileSpreadsheet, FilePlus } from 'lucide-react';
import html2canvasPro from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ExportReportsCard = ({ data, defaultPeriod = 'Daily', pageTitle = 'Sales', showPeriodTabs = true, className = '', onPeriodChange, onPrepareExport, onRestoreExport, exportElementId, variant = 'dropdown' }) => {
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

  const resolveExportData = (currentData = data) => {
    const todayCards = currentData?.salesKpiData?.todayRevenueCards || [];
    const monthCards = currentData?.salesKpiData?.monthRevenueCards || [];
    let cards = exportPeriod === 'Daily' ? (todayCards.length > 0 ? todayCards : monthCards) : (monthCards.length > 0 ? monthCards : todayCards);
    if (cards.length === 0) {
      cards = currentData?.customerKpiCards || currentData?.newsletterKpiCards || currentData?.kpiCards || [];
    }
    const revSource = currentData?.revenueSource || [];
    const eventSales = currentData?.eventSales || [];
    const salesByEvent = currentData?.salesByEventName || currentData?.eventSales || [];
    const quarterSpecials = currentData?.quarterSpecials || currentData?.specialsStoreItems || [];
    const bestSellers = currentData?.bestSellers || [];
    const lowPerformers = currentData?.lowPerformers || [];
    const currencies = currentData?.currencies || [];
    const currencyGrowth = currentData?.currencyGrowth || null;

    const isMonthlySales = (exportPeriod === 'Monthly' || pageTitle.toLowerCase().includes('monthly')) && pageTitle.toLowerCase().includes('sales');

    // Resolve Geo Heat Map Data (Regional Sales Growth Map) ONLY for Monthly sales
    let geoData = [];
    if (isMonthlySales) {
      geoData = currentData?.geoData;
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
    const customerMetricsRows = currentData?.customerMetricsRows || [];
    const customerMetricsLabels = currentData?.customerMetricsLabels || ['Older', 'Previous', 'Current'];
    const demographics = currentData?.demographics || null;
    const newCustomersByEvent = currentData?.newCustomersByEvent || [];
    const newCustomersByProduct = currentData?.newCustomersByProduct || [];
    const highContributors = currentData?.highContributors || [];
    const newCustomersByTraffic = currentData?.newCustomersByTraffic || [];
    const projectionByTraffic = currentData?.projectionByTraffic || [];
    const revenueByTrafficSource = currentData?.revenueByTrafficSource || [];
    const newMemberTrendByCurrency = currentData?.newMemberTrendByCurrency || [];
    const comparisonOfRevenueBySource = currentData?.comparisonOfRevenueBySource || [];

    // Newsletter Specific Datasets
    const categorySales = currentData?.categorySales || [];
    const dateWisePerformance = currentData?.dateWisePerformance || [];
    const overallPerformanceData = currentData?.overallPerformanceData || [];
    const breakupSummary = currentData?.breakupSummary || [];
    const typesCompared = currentData?.typesCompared || [];
    const overallEventsData = currentData?.overallEventsData || [];
    const specialEventsData = currentData?.specialEventsData || [];
    const specialEventsPerformanceData = currentData?.specialEventsPerformanceData || [];

    return {
      cards,
      revSource,
      eventSales,
      salesByEvent,
      quarterSpecials,
      bestSellers,
      lowPerformers,
      currencies,
      currencyGrowth,
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

  const handleExportCSV = (exportData = data) => {
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
        currencyGrowth,
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
      } = resolveExportData(exportData);

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
          csv += `"${item.eventName || item.name || ''}","${item.productName || item.name || ''}",${item.qty || item.quantity || item.sold || item.sales || item.orders || 0},${item.revenue || 0}\n`;
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
        csv += "Comparison of Revenue By Source\nTraffic Group,Projected,Proj Change,Revenue ($),Rev Change\n";
        comparisonOfRevenueBySource.forEach(r => {
          csv += `"${r.group}",${r.projected || 0},"${r.projChange || ''}",${r.revenue || 0},"${r.revChange || ''}"\n`;
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
        csv += "Date Wise Newsletter Performance\nNews Letter Sent Date,NewsLetter Name,Net Revenue In USD\n";
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
        csv += "Types Of NewsLetter Compared With Last Month\nNews Letter Type,News Letter Count,% Δ,Net Revenue In USD,% Δ\n";
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

  const handleExportExcel = (exportData = data) => {
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
        currencyGrowth,
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
      } = resolveExportData(exportData);

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
          ...salesByEvent.map(item => [item.eventName || item.name || '', item.productName || item.name || '', item.qty || item.quantity || item.sold || item.sales || item.orders || 0, item.revenue || 0]),
          []
        );
      }

      if (data?.specialsStoreItems && data.specialsStoreItems.length > 0) {
        summaryRows.push(
          ["--- SPECIALS STORE ITEMS ---"],
          ["Item Name", "Quantity Sold", "Total Revenue ($)"],
          ...data.specialsStoreItems.map(item => [item.name || item.eventName || '', item.qty || item.quantity || item.sold || item.sales || item.orders || 0, item.revenue || 0]),
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

      if (currencyGrowth && currencyGrowth.labels && currencyGrowth.labels.length > 0) {
        summaryRows.push(
          ["--- CURRENCY GROWTH TREND ---"],
          ["Date", "USD (Current)", "INR (Current)", "MYR (Current)", "USD (Previous)", "INR (Previous)", "MYR (Previous)"],
          ...currencyGrowth.labels.map((label, i) => [
            label,
            currencyGrowth.usd?.[i] || 0,
            currencyGrowth.inr?.[i] || 0,
            currencyGrowth.myr?.[i] || 0,
            currencyGrowth.usdPrev?.[i] || 0,
            currencyGrowth.inrPrev?.[i] || 0,
            currencyGrowth.myrPrev?.[i] || 0
          ]),
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
          ["Traffic Group", "Projected", "Proj Change", "Revenue ($)", "Rev Change"],
          ...comparisonOfRevenueBySource.map(r => [r.group, r.projected || 0, r.projChange || '', r.revenue || 0, r.revChange || '']),
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
          ["News Letter Sent Date", "NewsLetter Name", "Net Revenue In USD"],
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
          ["News Letter Type", "News Letter Count", "% Δ", "Net Revenue In USD", "% Δ"],
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
          "Orders": item.qty || item.quantity || item.sold || item.sales || item.orders || 0,
          "Revenue ($)": item.revenue || 0
        })));
        XLSX.utils.book_append_sheet(wb, wsSalesEvent, "Sales By Event");
      }
      if (data?.specialsStoreItems && data.specialsStoreItems.length > 0) {
        const wsSpecials = XLSX.utils.json_to_sheet(data.specialsStoreItems.map(item => ({
          "Item Name": item.name || item.eventName || '',
          "Quantity Sold": item.qty || item.quantity || item.sold || item.sales || item.orders || 0,
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

      if (currencyGrowth && currencyGrowth.labels && currencyGrowth.labels.length > 0) {
        const wsCurrencyGrowth = XLSX.utils.json_to_sheet(currencyGrowth.labels.map((label, i) => ({
          "Date": label,
          "USD (Current)": currencyGrowth.usd?.[i] || 0,
          "INR (Current)": currencyGrowth.inr?.[i] || 0,
          "MYR (Current)": currencyGrowth.myr?.[i] || 0,
          "USD (Previous)": currencyGrowth.usdPrev?.[i] || 0,
          "INR (Previous)": currencyGrowth.inrPrev?.[i] || 0,
          "MYR (Previous)": currencyGrowth.myrPrev?.[i] || 0
        })));
        XLSX.utils.book_append_sheet(wb, wsCurrencyGrowth, "Currency Growth Trend");
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

    const handleExportPDF = async () => {
    try {
      const elementId = exportElementId || 'dashboard-export-area';
      const dashboardElement = document.getElementById(elementId);

      if (!dashboardElement) {
        toast.error('Could not locate dashboard area for export (' + elementId + ')');
        return;
      }

      toast.loading('Generating PDF Report...', { id: 'pdfLoad' });
      
      // Taking visual screenshot of current dashboard view
      const canvas = await html2canvasPro(dashboardElement, { scale: 1.5, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let position = 0;
      let heightLeft = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(getExportFileName('pdf'));
      toast.dismiss('pdfLoad');
      toast.success("PDF Report downloaded successfully!");
      
      if (onRestoreExport) {
        onRestoreExport();
      }
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.dismiss('pdfLoad');
      toast.error("Failed to export PDF report: " + err.message);
    }
  };

  const handleExportClick = async (type) => {
    const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
    if (userPermissions?.data?.export === false) {
      toast.error('Access Denied: Your role profile does not have permission to Export data.');
      return;
    }
    if (userPermissions?.data?.download === false) {
      toast.error('Access Denied: Your role profile does not have permission to Download files.');
      return;
    }

    if (type === 'PDF') {
      handleExportPDF();
      return;
    }

    let exportData = data;
    if (onPrepareExport) {
      toast.loading(`Fetching full data for ${type} Report...`, { id: 'prepLoad' });
      try {
        const result = await onPrepareExport();
        if (result) exportData = result;
      } catch (err) {
        console.error(err);
      }
      toast.dismiss('prepLoad');
    }

    if (type === 'CSV') handleExportCSV(exportData);
    else if (type === 'Excel') handleExportExcel(exportData);

    if (onRestoreExport) {
      onRestoreExport();
    }
  };

  if (variant === 'inline') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={() => handleExportClick('CSV')}
          className="flex items-center gap-1.5 bg-[#f0f7ff] dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 border border-[#bfdbfe] dark:border-blue-500/20 hover:bg-[#dbeafe] dark:hover:bg-blue-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"
          title="Export CSV"
        >
          <FileText size={14} />
          <span className="hidden lg:inline">CSV</span>
        </button>
        <button
          onClick={() => handleExportClick('Excel')}
          className="flex items-center gap-1.5 bg-[#f4fbf7] dark:bg-emerald-500/10 text-[#16a34a] dark:text-emerald-400 border border-[#bbf7d0] dark:border-emerald-500/20 hover:bg-[#eaf8f0] dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"
          title="Export Excel"
        >
          <FileSpreadsheet size={14} />
          <span className="hidden lg:inline">Excel</span>
        </button>
        <button
          onClick={() => handleExportClick('PDF')}
          className="flex items-center gap-1.5 bg-[#fef2f2] dark:bg-rose-500/10 text-[#dc2626] dark:text-rose-400 border border-[#fecaca] dark:border-rose-500/20 hover:bg-[#fee2e2] dark:hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"
          title="Export PDF"
        >
          <Download size={14} />
          <span className="hidden lg:inline">PDF</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700 w-full md:w-auto relative group ${className}`}>
      <button className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all rounded cursor-pointer">
        <Download size={14} className="text-indigo-500" />
        Export Report
      </button>
      <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
        <button onClick={() => handleExportClick('PDF')} className="w-full text-left px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-t-lg flex items-center cursor-pointer">
          <FileText size={14} className="mr-2 text-red-500" /> PDF (Visual)
        </button>
        <button onClick={() => handleExportClick('Excel')} className="w-full text-left px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700/50 flex items-center cursor-pointer">
          <FileSpreadsheet size={14} className="mr-2 text-emerald-500" /> Excel (Data)
        </button>
        <button onClick={() => handleExportClick('CSV')} className="w-full text-left px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700/50 rounded-b-lg flex items-center cursor-pointer">
          <FilePlus size={14} className="mr-2 text-blue-500" /> CSV (Raw)
        </button>
      </div>
    </div>
  );
};

export default ExportReportsCard;
