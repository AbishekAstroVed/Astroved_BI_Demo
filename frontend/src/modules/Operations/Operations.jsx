import React, { useState, useEffect } from 'react';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { Calendar, FileText, FileSpreadsheet, Download, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';
import Pagination from '../../components/Pagination';
import EChartWrapper from '../../charts/EChartWrapper';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const Operations = () => {
  const { selectPreset, startDate, endDate, setCalendarHidden } = useDateFilter();
  const [exportPeriod, setExportPeriod] = useState('Daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderPage, setOrderPage] = useState(1);
  const [refundPage, setRefundPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  useEffect(() => {
    // Ensure "Daily" is selected on initial load
    if (selectPreset) {
      selectPreset('today');
      setExportPeriod('Daily');
    }
    if (setCalendarHidden) setCalendarHidden(false);
    return () => {
      if (setCalendarHidden) setCalendarHidden(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const prevOrderPageRef = React.useRef(orderPage);
  const prevRefundPageRef = React.useRef(refundPage);

  useEffect(() => {
    let active = true;

    // Check if only pagination changed
    const isPaginationOnly = (orderPage !== prevOrderPageRef.current || refundPage !== prevRefundPageRef.current);
    prevOrderPageRef.current = orderPage;
    prevRefundPageRef.current = refundPage;

    const fetchData = async (showLoading = !isPaginationOnly) => {
      if (showLoading) setLoading(true);
      try {
        const result = await api.getOperationalDashboard(startDate, endDate, exportPeriod.toLowerCase(), orderPage, refundPage, pageSize);
        if (active) {
          setData(result);
        }
      } catch (err) {
        console.error('Failed to load operational dashboard data:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Auto-refresh every 30 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [startDate, endDate, exportPeriod, orderPage, refundPage, pageSize]);

  const getExportFileName = (extension) => {
    return `astroved_operations_${exportPeriod.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.${extension}`;
  };

  const generateCSVContent = () => {
    const kpi = data?.kpi || {};
    const orders = data?.recentActivity?.orders || [];
    const refunds = data?.recentActivity?.refunds || [];

    let csv = "AstroVed Operations Report\n";
    csv += `Selected Period: ${exportPeriod}\n`;
    csv += `Generated on: ${new Date().toLocaleString()}\n\n`;

    csv += "--- KPI OVERVIEW ---\n";
    csv += "Metric,Value\n";
    csv += `Total Orders,${kpi.totalOrders || 0}\n`;
    csv += `Completed Orders,${kpi.completedOrders || 0}\n`;
    csv += `Pending Orders,${kpi.pendingOrders || 0}\n`;
    csv += `Cancellations,${kpi.cancelledOrders || 0}\n`;
    csv += `Total Refunds,${kpi.totalRefunds || 0}\n\n`;

    csv += "--- RECENT ORDERS ---\n";
    csv += "Order ID,Date,Customer,Product,Revenue,Status\n";
    orders.forEach(o => {
      csv += `${o.OrderId},${o.DateStr},"${o.UserName || ''}","${o.ProductName || ''}",${o.Revenue || 0},${o.Status}\n`;
    });
    csv += "\n";

    csv += "--- RECENT REFUNDS ---\n";
    csv += "Refund ID,Date,Order ID,Customer,Amount,Status\n";
    refunds.forEach(r => {
      csv += `${r.RefundId},${r.DateStr},${r.OrderId},"${r.UserName || ''}",${r.RefundAmount || 0},${r.Status}\n`;
    });

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
      const wb = XLSX.utils.book_new();
      const kpi = data?.kpi || {};
      const orders = data?.recentActivity?.orders || [];
      const refunds = data?.recentActivity?.refunds || [];

      // Summary Sheet
      const summaryRows = [
        ["AstroVed Operations Report"],
        [`Selected Period: ${exportPeriod}`],
        [`Generated on: ${new Date().toLocaleString()}`],
        [],
        ["--- KPI OVERVIEW ---"],
        ["Metric", "Value"],
        ["Total Orders", kpi.totalOrders || 0],
        ["Completed Orders", kpi.completedOrders || 0],
        ["Pending Orders", kpi.pendingOrders || 0],
        ["Cancellations", kpi.cancelledOrders || 0],
        ["Total Refunds", kpi.totalRefunds || 0]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Overview");

      // Orders Sheet
      if (orders.length > 0) {
        const wsOrders = XLSX.utils.json_to_sheet(orders.map(o => ({
          "Order ID": o.OrderId,
          "Date": o.DateStr,
          "Customer": o.UserName || '',
          "Product": o.ProductName || '',
          "Revenue": o.Revenue || 0,
          "Status": o.Status
        })));
        XLSX.utils.book_append_sheet(wb, wsOrders, "Recent Orders");
      }

      // Refunds Sheet
      if (refunds.length > 0) {
        const wsRefunds = XLSX.utils.json_to_sheet(refunds.map(r => ({
          "Refund ID": r.RefundId,
          "Date": r.DateStr,
          "Order ID": r.OrderId,
          "Customer": r.UserName || '',
          "Amount": r.RefundAmount || 0,
          "Status": r.Status
        })));
        XLSX.utils.book_append_sheet(wb, wsRefunds, "Recent Refunds");
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
      setIsExportingPDF(true);
      toast.loading("Preparing Operations dashboard for PDF...", { id: "pdf-export" });

      await new Promise(resolve => setTimeout(resolve, 300));

      const element = document.getElementById('operational-dashboard-container');
      if (!element) {
        toast.error("Dashboard content not found.");
        setIsExportingPDF(false);
        return;
      }
      toast.loading("Generating PDF...", { id: "pdf-export" });
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(getExportFileName('pdf'));
      toast.success(`${exportPeriod} PDF report downloaded!`, { id: "pdf-export" });
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to export PDF report: " + err.message, { id: "pdf-export" });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportClick = (type) => {
    const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
    if (userPermissions && userPermissions.data && userPermissions.data.export === false) {
      toast.error('Access Denied: Your role profile does not have permission to Export data.');
      return;
    }
    if (userPermissions && userPermissions.data && userPermissions.data.download === false) {
      toast.error('Access Denied: Your role profile does not have permission to Download files.');
      return;
    }

    if (type === 'CSV') handleExportCSV();
    else if (type === 'Excel') handleExportExcel();
    else if (type === 'PDF') handleExportPDF();

    api.createAuditLog({
      user: 'Super Admin',
      action: `Exported ${exportPeriod} Report (${type})`,
      module: 'Operational Dashboard',
      ip: '127.0.0.1',
      browser: navigator.userAgent
    }).catch(err => console.error("Audit log failed:", err));
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  const orderStatusData = data?.charts?.orderStatus?.map(item => ({
    name: item.StatusName || 'Unknown',
    value: item.Count || 0
  })) || [];

  const orderStatusOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '5%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: orderStatusData.map(d => d.name), axisLabel: { color: '#64748b' } },
    yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
    series: [
      {
        name: 'Orders',
        type: 'bar',
        data: orderStatusData.map(d => d.value),
        itemStyle: {
          color: (params) => {
            const status = params.name.toLowerCase();
            if (status === 'completed') return '#10b981';
            if (status === 'pending') return '#f59e0b';
            if (status === 'cancelled') return '#ef4444';
            return '#3b82f6';
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  const trendDates = data?.charts?.trends?.map(item => item.DateStr) || [];
  const orderData = data?.charts?.trends?.map(item => item.Orders) || [];
  const cancellationData = trendDates.map(date => {
    const match = data?.charts?.refundCancelTrends?.find(r => r.DateStr === date);
    return match ? match.Cancellations : 0;
  });

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: '0%', left: 'center' },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: trendDates, axisLabel: { color: '#64748b' } },
    yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
    series: [
      {
        name: 'Orders',
        type: 'bar',
        data: orderData,
        itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: 'Cancellations',
        type: 'bar',
        data: cancellationData,
        itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] }
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="text-cosmic-muted font-medium animate-pulse">Loading Operations Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div id="operational-dashboard-container" className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-cosmic-card p-4 rounded-xl border border-slate-200 dark:border-cosmic-border shadow-sm">
        <div className="flex md:w-auto overflow-hidden bg-white dark:bg-cosmic-card rounded-lg shadow-sm border border-slate-200 dark:border-cosmic-border">
          {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period, idx) => (
            <button
              key={period}
              onClick={() => {
                setExportPeriod(period);
                if (period === 'Daily' && selectPreset) selectPreset('today');
                else if (period === 'Weekly' && selectPreset) selectPreset('7days');
                else if (period === 'Monthly' && selectPreset) selectPreset('mtd');
                else if (period === 'Yearly' && selectPreset) selectPreset('ytd');
                setOrderPage(1);
                setRefundPage(1);
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
        <div className="flex gap-2">
          <button onClick={() => handleExportClick('CSV')} className="flex items-center gap-1.5 bg-[#f0f7ff] dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 border border-[#bfdbfe] dark:border-blue-500/20 hover:bg-[#dbeafe] dark:hover:bg-blue-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"><FileText size={14} /><span className="hidden lg:inline">CSV</span></button>
          <button onClick={() => handleExportClick('Excel')} className="flex items-center gap-1.5 bg-[#f4fbf7] dark:bg-emerald-500/10 text-[#16a34a] dark:text-emerald-400 border border-[#bbf7d0] dark:border-emerald-500/20 hover:bg-[#eaf8f0] dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"><FileSpreadsheet size={14} /><span className="hidden lg:inline">Excel</span></button>
          <button onClick={() => handleExportClick('PDF')} className="flex items-center gap-1.5 bg-[#fef2f2] dark:bg-rose-500/10 text-[#dc2626] dark:text-rose-400 border border-[#fecaca] dark:border-rose-500/20 hover:bg-[#fee2e2] dark:hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm"><Download size={14} /><span className="hidden lg:inline">PDF</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <div className="bg-white dark:bg-cosmic-card rounded-xl border border-slate-200 dark:border-cosmic-border shadow-sm p-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Order Status Distribution</h3>
          <EChartWrapper option={orderStatusOption} height="300px" />
        </div>

        {/* Orders vs Cancellations Trend Chart */}
        <div className="bg-white dark:bg-cosmic-card rounded-xl border border-slate-200 dark:border-cosmic-border shadow-sm p-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Orders vs Cancellations Trend</h3>
          <EChartWrapper option={trendOption} height="300px" />
        </div>
      </div>

      <div className="bg-white dark:bg-cosmic-card rounded-xl border border-slate-200 dark:border-cosmic-border shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Orders</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setOrderPage(1);
                setRefundPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 px-2 py-1 rounded focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={999999}>All</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Product ID</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentActivity?.orders?.map((order, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">#{order.OrderId}</td>
                  <td className="px-4 py-3 text-slate-500">{order.DateStr}</td>
                  <td className="px-4 py-3">{order.UserName || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-[200px] truncate" title={order.ProductName}>
                      {order.ProductName || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">{order.ProductId || '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    ${Number(order.Revenue || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.Status)}`}>
                      {order.Status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.recentActivity?.orders || data.recentActivity.orders.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">No orders found for the selected period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.recentActivity?.ordersTotal > pageSize && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Showing {((orderPage - 1) * pageSize) + 1} to {Math.min(orderPage * pageSize, data.recentActivity.ordersTotal)} of {data.recentActivity.ordersTotal} entries
            </div>
            <Pagination
              currentPage={orderPage}
              totalPages={Math.ceil(data.recentActivity.ordersTotal / pageSize)}
              prev={() => setOrderPage(p => Math.max(1, p - 1))}
              next={() => setOrderPage(p => Math.min(Math.ceil(data.recentActivity.ordersTotal / pageSize), p + 1))}
              jump={(p) => setOrderPage(p)}
            />
          </div>
        )}
      </div>

      {/* Recent Cancellations Table */}
      <div className="bg-white dark:bg-cosmic-card rounded-xl border border-slate-200 dark:border-cosmic-border shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Cancellations</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3 text-right">Refund Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentActivity?.cancellations?.map((cancel, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">#{cancel.OrderId}</td>
                  <td className="px-4 py-3 text-slate-500">{cancel.DateStr}</td>
                  <td className="px-4 py-3">{cancel.UserName || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-[200px] truncate" title={cancel.ProductName}>
                      {cancel.ProductName || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    ${Number(cancel.Amount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor('Cancelled')}`}>
                      Cancelled
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.recentActivity?.cancellations || data.recentActivity.cancellations.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">No cancellations found for the selected period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.recentActivity?.cancellationsTotal > pageSize && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Showing {((refundPage - 1) * pageSize) + 1} to {Math.min(refundPage * pageSize, data.recentActivity.cancellationsTotal)} of {data.recentActivity.cancellationsTotal} entries
            </div>
            <Pagination
              currentPage={refundPage}
              totalPages={Math.ceil(data.recentActivity.cancellationsTotal / pageSize)}
              prev={() => setRefundPage(p => Math.max(1, p - 1))}
              next={() => setRefundPage(p => Math.min(Math.ceil(data.recentActivity.cancellationsTotal / pageSize), p + 1))}
              jump={(p) => setRefundPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Operations;
