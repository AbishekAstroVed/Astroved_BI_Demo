# Automated Report Scheduler Implementation Plan

This plan addresses all requirements for the automated report scheduler, correct data bindings, and PDF generation via html2canvas-pro.

## 1. Dashboard Selection & Options Removal
We will remove the unauthorized dashboards from the scheduler so the user can only select from the 5 allowed options.
### Changes:
- **`frontend/src/modules/Reports/ReportsBuilder.jsx`**: Update the `DASHBOARD_OPTIONS` array to ONLY include:
  - Executive Dashboard
  - Customer Dashboard
  - Sales Dashboard
  - Newsletter Performance
  - Operations Dashboard
- Update `adminController.js` to ONLY process these dashboards and completely remove `Daily Sales`, `Monthly Sales`, `AI Insights`, etc. from the `sendReportEmail` logic.

## 2. Format Selection (PDF, Excel, CSV)
The user requires being able to select formats like PDF, Excel, and CSV simultaneously via checkboxes, instead of a single-select dropdown.
### Changes:
- **`frontend/src/modules/Reports/ReportsBuilder.jsx`**: Change `scheduleFormat` from a single string to an array (e.g. `['PDF', 'Excel']`). We'll render checkboxes instead of a `<select>`.
- **`backend/models/ReportSchedule.js`**: We will save it as a comma-separated string to preserve DB compatibility (e.g. `"PDF,Excel"`).
- **`backend/controllers/adminController.js`**: Update the format check logic to handle arrays or comma-separated strings (e.g. `format.includes('PDF')`).

## 3. Real Data Mapping in Email HTML (No more "N/A")
The email HTML body currently renders "N/A" for KPIs because it looks for `data.kpis.revenue.value`, while the backend controllers actually return flat fields like `data.todayRevenue`, `data.todayOrders`, etc., inside the dashboard JSON response.
### Changes:
- **`backend/controllers/adminController.js`**: Update the HTML builder in `sendReportEmail`. We will read the correct property based on the selected `period`. 
  - For example, if period is `Daily`, we map to `data.todayRevenue`. If `Monthly`, we map to `data.monthRevenue`, ensuring the email body matches the exact real-time backend data.

## 4. PDF Generation via html2canvas-pro
The headless browser implementation is already set up using Puppeteer + html2canvas-pro. We will refine it to ensure it perfectly respects the scheduled period.
### Changes:
- **Period Injection**: We already injected `localStorage.setItem('astroved_report_period', period)` in the Puppeteer `evaluate()` script. We will ensure that when the Puppeteer instance opens the dashboard, it automatically loads the exact `Daily`, `Weekly`, `Monthly`, or `Yearly` data before `html2canvas-pro` captures it.
- **Frontend Dashboard Components**: (`Executive.jsx`, `Sales.jsx`, `Customer.jsx`, `MonthlyCustomers.jsx`, `Operations.jsx`) will prioritize `localStorage.getItem('astroved_report_period')` as their default state on initial load, guaranteeing the PDF screenshots perfectly match the scheduled period.

## 5. Fetching Fresh Data at Scheduled Time
When the scheduler cron job triggers (in `adminController.js`), it will query the live backend dashboard controller functions (e.g. `getExecutiveDashboard`) and pass the `dateRange` for the selected period (Daily = yesterday, Weekly = last 7 days, etc.). This ensures the email is always generated with fresh backend data, not old or mock data.

## Open Questions
- For the checkbox implementation of `Format` (PDF, Excel, CSV), should we just use a comma-separated string `PDF,Excel,CSV` when sending it to the backend to avoid altering the Mongoose schema for `ReportSchedule` (where `format` is defined as `String`)? I recommend yes, as it requires zero database migration.

Please click **Proceed** to approve this plan, and I will begin implementing all required changes!
