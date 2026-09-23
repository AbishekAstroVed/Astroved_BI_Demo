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
        { title: 'Western NL (NLW)', value: kpi.western, color: '#f43f5e' },
        { title: 'Targetted NL (OML)', value: kpi.targeted, color: '#8b5cf6' },
        { title: 'India NL (NLI)', value: kpi.india, color: '#10b981' },
        { title: 'Overall NL', value: kpi.overall, color: '#f59e0b' }
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
