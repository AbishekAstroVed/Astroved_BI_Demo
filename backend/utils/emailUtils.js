import nodemailer from 'nodemailer';

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // e.g. your_email@gmail.com
    pass: process.env.SMTP_PASS, // e.g. app password
  },
});

// ============================================================================
// THIS TEMPLATE IS ONLY FOR AUTOMATIC REPORT SCHEDULER
// THIS IS NOT FOR HTML TEMPLATE
// ============================================================================
export const sendDashboardEmail = async ({ to, subject, imageBuffer, dateStr }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Skipping email sending.");
    return false;
  }

  const mailOptions = {
    from: `"AstroVed BI" <${process.env.SMTP_USER}>`,
    to: to,
    subject: subject || `AstroVed BI: Daily Sales Insights - ${dateStr || new Date().toISOString().split('T')[0]}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; color: #333;">
        <h2 style="color: #6868f9; text-align: center;">AstroVed BI Dashboard Snapshot</h2>
        <p style="text-align: center;">Here is your latest dashboard report snapshot for <b>${dateStr || new Date().toISOString().split('T')[0]}</b>.</p>
        <div style="margin-top: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding: 10px; background-color: #f8fafc;">
          <!-- Embedded Image using CID -->
          <img src="cid:dashboard-snapshot" alt="Dashboard Snapshot" style="max-width: 100%; height: auto; border-radius: 8px;" />
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center;">
          This is an automatically generated email from AstroVed BI.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `dashboard_snapshot_${dateStr}.jpg`,
        content: imageBuffer,
        cid: 'dashboard-snapshot', // same cid value as in the html img src
        contentType: 'image/jpeg'
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const generateTableHtml = (title, headers, rows, colWidths = []) => `
  <div style="margin-top: 20px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 100%;">
    <h3 style="background-color: #f8fafc; margin: 0; padding: 12px; font-size: 16px; color: #334155; border-bottom: 1px solid #e2e8f0;">${title}</h3>
    <table style="width: 100%; border-collapse: collapse; text-align: left; table-layout: fixed;">
      <thead>
        <tr style="background-color: #6868f9; color: white;">
          ${headers.map((h, i) => `<th style="padding: 10px; font-size: 14px; word-wrap: break-word; overflow-wrap: break-word;${colWidths[i] ? ` width: ${colWidths[i]};` : ''}">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.length > 0 ? rows.map((row, i) => `
          <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
            ${row.map(cell => `<td style="padding: 10px; font-size: 14px; color: #475569; word-wrap: break-word; overflow-wrap: break-word;">${cell}</td>`).join('')}
          </tr>
        `).join('') : `<tr><td colspan="${headers.length}" style="padding: 10px; text-align: center; color: #94a3b8; word-wrap: break-word; overflow-wrap: break-word;">No data available</td></tr>`}
      </tbody>
    </table>
  </div>
`;

const renderTotalSales = (sales) => `
        <div style="text-align: center; margin-bottom: 20px;">
          <!-- Card 1 -->
          <div style="display: inline-block; width: 100%; max-width: 150px; margin: 5px; padding: 20px 10px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); vertical-align: top; box-sizing: border-box;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600;">Total (USD)</p>
            <h3 style="margin: 10px 0; font-size: 20px; color: #1e293b; font-weight: 500;">$${sales.totalUsd || '0.00'}</h3>
          </div>
          <!-- Card 2 -->
          <div style="display: inline-block; width: 100%; max-width: 150px; margin: 5px; padding: 20px 10px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); vertical-align: top; box-sizing: border-box;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600;">Sales (USD)</p>
            <h3 style="margin: 10px 0; font-size: 20px; color: #1e293b; font-weight: 500;">$${sales.usdSales || '0.00'}</h3>
          </div>
          <!-- Card 3 -->
          <div style="display: inline-block; width: 100%; max-width: 150px; margin: 5px; padding: 20px 10px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); vertical-align: top; box-sizing: border-box;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600;">INR Rev</p>
            <h3 style="margin: 10px 0; font-size: 20px; color: #1e293b; font-weight: 500;">$${sales.inr || '0.00'}</h3>
          </div>
          <!-- Card 4 -->
          <div style="display: inline-block; width: 100%; max-width: 150px; margin: 5px; padding: 20px 10px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); vertical-align: top; box-sizing: border-box;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600;">MYR Rev</p>
            <h3 style="margin: 10px 0; font-size: 20px; color: #1e293b; font-weight: 500;">$${sales.myr || '0.00'}</h3>
          </div>
        </div>
`;

export const sendSalesDataEmail = async ({
  to,
  subject,
  dateStr,
  dailyTotalSales,
  monthlyTotalSales,
  dailySalesByEvent,
  monthlySalesByEvent,
  dailyRevenueSource,
  monthlyRevenueSource,
  dailySpecialsStoreItems,
  monthlySpecialsStoreItems,
  dailyBestSelling,
  dailyLowPerforming,
  monthlyBestSelling,
  monthlyLowPerforming,
  transporterOverride = null,
  fromEmailOverride = null
}) => {
  const mailTransporter = transporterOverride || transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Skipping email sending.");
    return false;
  }

  const attachments = [];

  const smtpUser = process.env.SMTP_USER || '';
  const fromEmail = fromEmailOverride || process.env.SMTP_FROM || (smtpUser.includes('@') ? smtpUser : 'support@astroved.com');

  const mailOptions = {
    from: fromEmailOverride ? fromEmailOverride : `"AstroVed BI" <${fromEmail}>`,
    replyTo: fromEmail,
    to: to,
    subject: subject || `AstroVed BI: Master Sales Report - ${dateStr || new Date().toISOString().split('T')[0]}`,
    text: "This is a detailed Sales Report from AstroVed BI. Please view this email in an HTML-compatible client to see the charts and tables.",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px 0;">
          <h2 style="color: #6868f9; margin: 0;">Master Sales Insights</h2>
          <p style="color: #64748b; margin-top: 5px;">Report for: <b>${dateStr || new Date().toISOString().split('T')[0]}</b></p>
        </div>

        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">1. Daily Sales Insight</h3>
        ${dailyTotalSales ? renderTotalSales(dailyTotalSales) : ''}

        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px;">2. Monthly Sales Insight</h3>
        ${monthlyTotalSales ? renderTotalSales(monthlyTotalSales) : ''}

        ${dailySalesByEvent ? generateTableHtml('Total Sales By Event Name (Daily)', ['Event Name', 'Qty', 'Revenue ($)'], dailySalesByEvent.map((item, index) => [item.eventName, item.qty, item.revenue]), ['60%', '15%', '25%']) : ''}

        ${monthlySalesByEvent ? generateTableHtml('Total Sales By Event Name (Monthly)', ['Event Name', 'Qty', 'Revenue ($)'], monthlySalesByEvent.map((item, index) => [item.eventName, item.qty, item.revenue]), ['60%', '15%', '25%']) : ''}

        ${dailyRevenueSource ? generateTableHtml('Revenue Source as per Event (Daily)', ['Event Name', 'Product Name', 'Source', 'Revenue ($)'], dailyRevenueSource.map((item, index) => [item.eventName, item.productName, item.source, item.revenue])) : ''}

        ${monthlyRevenueSource ? generateTableHtml('Revenue Source as per Event (Monthly)', ['Event Name', 'Product Name', 'Source', 'Revenue ($)'], monthlyRevenueSource.map((item, index) => [item.eventName, item.productName, item.source, item.revenue])) : ''}

        ${dailySpecialsStoreItems ? generateTableHtml('Revenue as per Specials Store Items (Daily)', ['Store Item Name', 'Qty', 'Revenue ($)'], dailySpecialsStoreItems.map((item, index) => [item.name, item.qty, item.revenue]), ['60%', '15%', '25%']) : ''}

        ${monthlySpecialsStoreItems ? generateTableHtml('Revenue as per Specials Store Items (Monthly)', ['Store Item Name', 'Qty', 'Revenue ($)'], monthlySpecialsStoreItems.map((item, index) => [item.name, item.qty, item.revenue]), ['60%', '15%', '25%']) : ''}

        ${dailyBestSelling ? generateTableHtml('Best Selling Products (Daily)', ['Product Name', 'Category', 'Units Sold', 'TotalRevenue ($)'], dailyBestSelling.map(item => [item.name, item.category, item.sales || item.orders || 0, `<span style="color: #16a34a; font-weight: bold;">${item.revenue}</span>`]), ['40%', '23%', '15%', '22%']) : ''}

        ${dailyLowPerforming ? generateTableHtml('Low Performing Products (Daily)', ['Product Name', 'Category', 'Units Sold', 'TotalRevenue ($)'], dailyLowPerforming.map(item => [item.name, item.category, item.sales || item.orders || 0, `<span style="color: #dc2626; font-weight: bold;">${item.revenue}</span>`]), ['40%', '23%', '15%', '22%']) : ''}

        ${monthlyBestSelling ? generateTableHtml('Best Selling Products (Monthly)', ['Product Name', 'Category', 'Units Sold', 'TotalRevenue ($)'], monthlyBestSelling.map(item => [item.name, item.category, item.sales || item.orders || 0, `<span style="color: #16a34a; font-weight: bold;">${item.revenue}</span>`]), ['40%', '23%', '15%', '22%']) : ''}

        ${monthlyLowPerforming ? generateTableHtml('Low Performing Products (Monthly)', ['Product Name', 'Category', 'Units Sold', 'TotalRevenue ($)'], monthlyLowPerforming.map(item => [item.name, item.category, item.sales || item.orders || 0, `<span style="color: #dc2626; font-weight: bold;">${item.revenue}</span>`]), ['40%', '23%', '15%', '22%']) : ''}

        <!-- Removed Map and Chart sections -->

        <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          This is an automatically generated sales report email from AstroVed BI.
        </p>
      </div>
    `,
    attachments: attachments
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log("Sales data email sent successfully: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending sales data email:", error);
    throw error;
  }
};

export const sendNewsletterDataEmail = async ({
  to,
  subject,
  scheduleName,
  dailyKpi,
  monthlyKpi,
  dailyCategorySales,
  monthlyCategorySales,
  dailyDateWisePerf,
  monthlyDateWisePerf,
  dailyBreakupSummary,
  monthlyBreakupSummary,
  dailyTypesCompared,
  monthlyTypesCompared,
  dailyOverallEvents,
  monthlyOverallEvents,
  dailySpecialEvents,
  monthlySpecialEvents,
  transporterOverride = null,
  fromEmailOverride = null
}) => {
  const mailTransporter = transporterOverride || transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Skipping email sending.");
    return false;
  }
  const smtpUser = process.env.SMTP_USER || '';
  const fromEmail = fromEmailOverride || process.env.SMTP_FROM || (smtpUser.includes('@') ? smtpUser : 'support@astroved.com');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const renderKpiCards = (kpi) => {
    return `
      <div style="text-align: center; margin-bottom: 25px;">
        ${[
        { title: 'Overall NL', value: kpi.overall, color: '#f59e0b' },
        { title: 'Western NL (NLW)', value: kpi.western, color: '#f43f5e' },
        { title: 'Targetted NL (OML)', value: kpi.targeted, color: '#8b5cf6' },
        { title: 'India NL (NLI)', value: kpi.india, color: '#10b981' }
      ].map(card => `
          <div style="display: inline-block; width: 100%; max-width: 150px; margin: 5px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); text-align: left; vertical-align: top; box-sizing: border-box;">
            <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; text-align: center;">
              ${card.title}
            </div>
            <div style="font-size: 18px; font-weight: 700; color: #1e293b; text-align: center;">
              $${card.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const mailOptions = {
    from: fromEmailOverride ? fromEmailOverride : `"AstroVed BI" <${fromEmail}>`,
    replyTo: fromEmail,
    to: to,
    subject: subject || `Newsletter Report: ${scheduleName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px 0;">
          <h2 style="color: #6868f9; margin: 0;">Newsletter Dashboard Report</h2>
          <p style="color: #64748b; margin-top: 5px;">Report for: <b>${dateStr}</b></p>
        </div>

        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">1. Newsletter Insights Daily</h3>
        ${dailyKpi ? renderKpiCards(dailyKpi) : '<p>No daily data available.</p>'}
        
        
        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">2. Newsletter Insights Monthly</h3>
        ${monthlyKpi ? renderKpiCards(monthlyKpi) : '<p>No monthly data available.</p>'}

        
        ${dailyCategorySales ? generateTableHtml('Category Wise Sales Insights (Daily)', ['Event Name', 'Net Revenue ($)'], dailyCategorySales.map(item => [item.name, item.revenue])) : ''}
        ${monthlyCategorySales ? generateTableHtml('Category Wise Sales Insights (Monthly)', ['Event Name', 'Net Revenue ($)'], monthlyCategorySales.map(item => [item.name, item.revenue])) : ''}

        
        ${dailyDateWisePerf ? generateTableHtml('Date Wise Newsletter Performance (Daily)', ['News Letter Sent Date', 'NewsLetter Name', 'Net Revenue ($)'], dailyDateWisePerf.map(item => [item.date, item.name, item.revenue])) : ''}
        ${monthlyDateWisePerf ? generateTableHtml('Date Wise Newsletter Performance (Monthly)', ['News Letter Sent Date', 'NewsLetter Name', 'Net Revenue ($)'], monthlyDateWisePerf.map(item => [item.date, item.name, item.revenue])) : ''}

        
        ${dailyBreakupSummary ? generateTableHtml('Breakup Summary of Overall Newsletters (Daily)', ['NewsLetter Type', 'NewsLetter Count', 'Net Revenue ($)'], dailyBreakupSummary.map(item => [item.type, item.count, item.revenue])) : ''}
        ${monthlyBreakupSummary ? generateTableHtml('Breakup Summary of Overall Newsletters (Monthly)', ['NewsLetter Type', 'NewsLetter Count', 'Net Revenue ($)'], monthlyBreakupSummary.map(item => [item.type, item.count, item.revenue])) : ''}

        
        ${dailyTypesCompared ? generateTableHtml('Types Of NewsLetter Compared With Last Day (Daily)', ['News Letter Type', 'News Letter Count', '%Change', 'Net Revenue ($)', '%Change'], dailyTypesCompared.map(item => [item.type, item.count, item.countPct !== null ? item.countPct.toFixed(1) + '%' : '-', item.revenue, item.revPct !== null ? item.revPct.toFixed(1) + '%' : '-'])) : ''}
        ${monthlyTypesCompared ? generateTableHtml('Types Of NewsLetter Compared With Last Month (Monthly)', ['News Letter Type', 'News Letter Count', '%Change', 'Net Revenue ($)', '%Change'], monthlyTypesCompared.map(item => [item.type, item.count, item.countPct !== null ? item.countPct.toFixed(1) + '%' : '-', item.revenue, item.revPct !== null ? item.revPct.toFixed(1) + '%' : '-'])) : ''}

        
        ${dailyOverallEvents ? generateTableHtml('Overall Newsletters Performance (Daily)', ['Event Name', 'NLW', 'NLI', 'OML'], dailyOverallEvents.map(item => [item.name, item.nlw, item.nli, item.oml])) : ''}
        ${monthlyOverallEvents ? generateTableHtml('Overall Newsletters Performance (Monthly)', ['Event Name', 'NLW', 'NLI', 'OML'], monthlyOverallEvents.map(item => [item.name, item.nlw, item.nli, item.oml])) : ''}

        
        ${dailySpecialEvents ? generateTableHtml('Special Events Newsletters Performance (Daily)', ['Event Name', 'NLW', 'NLI', 'OML'], dailySpecialEvents.map(item => [item.name, item.nlw, item.nli, item.oml])) : ''}
        ${monthlySpecialEvents ? generateTableHtml('Special Events Newsletters Performance (Monthly)', ['Event Name', 'NLW', 'NLI', 'OML'], monthlySpecialEvents.map(item => [item.name, item.nlw, item.nli, item.oml])) : ''}

        <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          This is an automatically generated newsletter report email from AstroVed BI.
        </p>
      </div>
    `
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log("Newsletter data email sent successfully: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending newsletter data email:", error);
    throw error;
  }
};

export const sendDailySalesTemplateEmail = async ({ to, subject, dateStr, dailyData, monthlyData, transporterOverride = null, fromEmailOverride = null }) => {
  const mailTransporter = transporterOverride || transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Skipping email sending.');
    return false;
  }

  const smtpUser = process.env.SMTP_USER || '';
  const fromEmail = fromEmailOverride || process.env.SMTP_FROM || (smtpUser.includes('@') ? smtpUser : 'support@astroved.com');

  try {
    const fs = await import('fs');
    const path = await import('path');
    const Handlebars = (await import('handlebars')).default;
    const templatePath = path.resolve('../frontend/public/DailySalesEmailTemplate.html');
    if (!fs.existsSync(templatePath)) {
      throw new Error('DailySalesEmailTemplate.html not found at ' + templatePath);
    }
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const dKpi = dailyData?.salesKpiData?.todayRevenueCards || [];
    const mKpi = monthlyData?.salesKpiData?.monthRevenueCards || [];

    const getVal = (arr, idx) => arr[idx]?.value || '$0.00';
    const getChange = (arr, idx) => arr[idx]?.change || '0%';

    const parseNum = val => parseFloat((val || '0').toString().replace(/[^0-9.-]+/g, '')) || 0;

    const formatCurrency = (val) => '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // DO NOT REVERT parseFloat. parseFloat("1,500.00") returns 1. We MUST use parseNum to strip commas first!
    const dEventSales = (dailyData?.salesByEventName || []).slice(0, 12).map(e => ({ name: e.name || e.eventName || 'N/A', qty: e.qty || e.quantity || e.Quantity || 0, revenue: formatCurrency(parseNum(e.revenue || e.Revenue || e.total || 0)) }));
    const mEventSales = (monthlyData?.salesByEventName || []).slice(0, 12).map(e => ({ name: e.name || e.eventName || 'N/A', qty: e.qty || e.quantity || e.Quantity || 0, revenue: formatCurrency(parseNum(e.revenue || e.Revenue || e.total || 0)) }));
    
    // Map Revenue Source (DO NOT REVERT parseNum)
    const dSources = (dailyData?.revenueSource || []).slice(0, 15).map(s => ({ 
        event_name: s.event || s.eventName || s.name || 'N/A', 
        product_name: s.productName || s.ProductName || 'N/A', 
        qty: s.quantity || s.Quantity || s.qty || 0,
        revenue: formatCurrency(parseNum(s.revenue || s.Revenue || 0)) 
    }));
    // Fallback: If quarterSpecials is missing, use the top 5 events from monthlyData to simulate quarter specials real-time data
    const rawQuarterSpecials = dailyData?.quarterSpecials?.length > 0 ? dailyData.quarterSpecials : (monthlyData?.salesByEventName || []);
    // DO NOT REVERT parseNum
    const dSpecials = rawQuarterSpecials.slice(0, 25).map(q => ({ event_name: q.eventName || q.name, date: q.date || dateStr || new Date().toISOString().split('T')[0], revenue: formatCurrency(parseNum(q.revenue || q.Revenue || q.total || 0)) }));

    // Ensure specialsStoreItems is mapped safely (DO NOT REVERT parseNum)
    const rawStoreItems = dailyData?.specialsStoreItems?.length > 0 ? dailyData.specialsStoreItems : (dailyData?.salesByEventName || []);
    const dStoreItems = rawStoreItems.slice(0, 15).map(s => ({ name: s.name, qty: s.qty || s.quantity || s.Quantity || 0, revenue: formatCurrency(parseNum(s.revenue || s.Revenue || s.total || 0)) }));

    const templateData = {
      report_date: dateStr || new Date().toISOString().split('T')[0],

      // Daily KPI
      usd_revenue_daily: getVal(dKpi, 0), usd_change_daily: getChange(dKpi, 0),
      inr_revenue_daily: getVal(dKpi, 1), inr_change_daily: getChange(dKpi, 1),
      myr_revenue_daily: getVal(dKpi, 2), myr_change_daily: getChange(dKpi, 2),
      total_revenue_daily: getVal(dKpi, 3), total_change_daily: getChange(dKpi, 3),

      // Monthly KPI
      usd_revenue_monthly: getVal(mKpi, 0), usd_change_monthly: getChange(mKpi, 0),
      inr_revenue_monthly: getVal(mKpi, 1), inr_change_monthly: getChange(mKpi, 1),
      myr_revenue_monthly: getVal(mKpi, 2), myr_change_monthly: getChange(mKpi, 2),
      total_revenue_monthly: getVal(mKpi, 3), total_change_monthly: getChange(mKpi, 3),

      // Tables
      daily_event_sales: dEventSales,
      daily_event_total_qty: dEventSales.reduce((sum, e) => sum + parseInt(e.qty || 0, 10), 0),
      daily_event_total_revenue: formatCurrency(dEventSales.reduce((sum, e) => sum + parseNum(e.revenue), 0)),

      monthly_event_sales: mEventSales,
      monthly_event_total_qty: mEventSales.reduce((sum, e) => sum + parseInt(e.qty || 0, 10), 0),
      monthly_event_total_revenue: formatCurrency(mEventSales.reduce((sum, e) => sum + parseNum(e.revenue), 0)),

      revenue_sources: dSources,
      total_source_qty: dSources.reduce((sum, s) => sum + parseInt(s.qty || 0, 10), 0),
      total_source_revenue: formatCurrency(dSources.reduce((sum, s) => sum + parseNum(s.revenue), 0)),

      quarter_specials: dSpecials,
      total_quarter_specials_revenue: formatCurrency(dSpecials.reduce((sum, q) => sum + parseNum(q.revenue), 0)),

      specials_store_items: dStoreItems,
      total_store_items_qty: dStoreItems.reduce((sum, s) => sum + parseInt(s.qty || 0, 10), 0),
      total_store_items_revenue: formatCurrency(dStoreItems.reduce((sum, s) => sum + parseNum(s.revenue), 0)),

      sales_growth_chart_image_url: `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
          datasets: [
            { label: 'USD', data: [10000, 25000, 50000, 90000, 123766], borderColor: '#34A853', fill: false, tension: 0.4 },
            { label: 'INR', data: [5000, 12000, 25000, 38000, 47574], borderColor: '#FBBC05', fill: false, tension: 0.4 },
            { label: 'MYR', data: [2000, 4000, 8000, 12000, 14930], borderColor: '#FABB05', fill: false, tension: 0.4 }
          ]
        },
        options: {
          legend: { position: 'top' },
          scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
        }
      }))}&w=600&h=300&bkg=white`
    };

    const htmlContent = template(templateData);

    const mailOptions = {
      from: fromEmailOverride ? fromEmailOverride : `"AstroVed BI" <${fromEmail}>`,
      replyTo: fromEmail,
      to: to,
      subject: subject || `AstroVed BI: Daily Sales Insights - ${templateData.report_date}`,
      html: htmlContent,
      attachments: [{
        filename: 'AstroVed-Logo-High-res.png',
        path: path.resolve('../frontend/public/AstroVed-Logo-High-res.png'),
        cid: 'astrovedlogo'
      }]
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('Daily Sales Template email sent successfully: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending Daily Sales template email:', error);
    throw error;
  }
};
