import React, { useState, useEffect } from 'react';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { useTheme } from '../../contexts/ThemeContext';
import { BarChart3, TrendingUp, Users, DollarSign, Search, Loader2, ChevronLeft, ChevronRight, Download, FileText, FileSpreadsheet, MousePointerClick, Wallet, Globe, MapPin, Map, ShoppingCart, Package } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import toast from 'react-hot-toast';

const HomePageBanner = ({ showRevenue = true }) => {
  const { startDate, endDate } = useDateFilter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);


  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const dateRangeLabel = startDate === endDate
    ? formatDate(startDate)
    : `${formatDate(startDate)} - ${formatDate(endDate)}`;

  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [currentPageMain, setCurrentPageMain] = useState(1);
  const [currentPageSec, setCurrentPageSec] = useState(1);
  const MAIN_ITEMS_PER_PAGE = 6;
  const SEC_ITEMS_PER_PAGE = 10;

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await api.getBannerSalesDashboard(startDate, endDate);
        const mappedData = data.map(row => ({
          code: row.TrafficCode,
          product: row.ProductName,
          global: {
            qty: row.USDQTY || 0,
            usd: row.USDAMOUNT || 0,
            discount: row.USDDiscountAmount || 0
          },
          india: {
            qty: row.INRQTY || 0,
            inr: row.INRAMOUNT || 0,
            usd: row.INRUSDTOT || 0,
            discount: row.INRUSDDiscountAmount || 0
          },
          mysg: {
            qty: row.MYRQTY || 0,
            myr: row.MYRAMOUNT || 0,
            usd: row.MYRUSDTOT || 0,
            discount: row.MYRUSDDiscountAmount || 0
          },
          clicks: row.TotalClicks || 0,
          discount: row.DiscountAmount || 0,
          totalUsd: row.USDTOTAL || 0,
          netTotalUsd: row.USDNETTOTAL || 0
        }));
        setAllData(mappedData);
      } catch (error) {
        console.error('Failed to fetch banner sales data', error);
        toast.error('Failed to load banner sales data');
        setAllData([]);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(allData);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredData(
        allData.filter(row =>
          (row.code && row.code.toLowerCase().includes(lowerQuery)) ||
          (row.product && row.product.toLowerCase().includes(lowerQuery))
        )
      );
    }
    setCurrentPageMain(1); // Reset to first page on search
    setCurrentPageSec(1);
  }, [searchQuery, allData]);

  // Pagination logic for main table
  const totalPagesMain = Math.ceil(filteredData.length / MAIN_ITEMS_PER_PAGE);
  let paginatedDataMain = filteredData.slice(
    (currentPageMain - 1) * MAIN_ITEMS_PER_PAGE,
    currentPageMain * MAIN_ITEMS_PER_PAGE
  );

  if (paginatedDataMain.length > 0 && paginatedDataMain.length < MAIN_ITEMS_PER_PAGE) {
    const emptyRowsCount = MAIN_ITEMS_PER_PAGE - paginatedDataMain.length;
    const emptyRows = Array(emptyRowsCount).fill({ isEmpty: true });
    paginatedDataMain = [...paginatedDataMain, ...emptyRows];
  }

  // Pagination logic for secondary table
  const totalPagesSec = Math.ceil(filteredData.length / SEC_ITEMS_PER_PAGE);
  let paginatedDataSec = filteredData.slice(
    (currentPageSec - 1) * SEC_ITEMS_PER_PAGE,
    currentPageSec * SEC_ITEMS_PER_PAGE
  );

  if (paginatedDataSec.length > 0 && paginatedDataSec.length < SEC_ITEMS_PER_PAGE) {
    const emptyRowsCount = SEC_ITEMS_PER_PAGE - paginatedDataSec.length;
    const emptyRows = Array(emptyRowsCount).fill({ isEmpty: true });
    paginatedDataSec = [...paginatedDataSec, ...emptyRows];
  }

  const totals = filteredData.reduce((acc, row) => {
    if (row.isEmpty) return acc;
    acc.globalQty += Number(row.global?.qty || 0);
    acc.globalUsd += Number(row.global?.usd || 0);
    acc.globalDiscount += Number(row.global?.discount || 0);
    acc.indiaQty += Number(row.india?.qty || 0);
    acc.indiaInr += Number(row.india?.inr || 0);
    acc.indiaUsd += Number(row.india?.usd || 0);
    acc.indiaDiscount += Number(row.india?.discount || 0);
    acc.mysgQty += Number(row.mysg?.qty || 0);
    acc.mysgMyr += Number(row.mysg?.myr || 0);
    acc.mysgUsd += Number(row.mysg?.usd || 0);
    acc.mysgDiscount += Number(row.mysg?.discount || 0);
    acc.clicks += Number(row.clicks || 0);
    acc.discount += Number(row.discount || 0);
    acc.totalUsd += Number(row.totalUsd || 0);
    acc.netTotalUsd += Number(row.netTotalUsd || 0);
    return acc;
  }, {
    globalQty: 0, globalUsd: 0, globalDiscount: 0, indiaQty: 0, indiaInr: 0, indiaUsd: 0, indiaDiscount: 0,
    mysgQty: 0, mysgMyr: 0, mysgUsd: 0, mysgDiscount: 0, clicks: 0, discount: 0,
    totalUsd: 0, netTotalUsd: 0
  });

  const getExportData = () => {
    return filteredData.map(row => ({
      'Traffic Code': row.code,
      'Product Name': row.product,
      'Global Qty': row.global?.qty || 0,
      'Global USD': (row.global?.usd || 0).toFixed(2),
      'India Qty': row.india?.qty || 0,
      'India INR': (row.india?.inr || 0).toFixed(2),
      'India USD': (row.india?.usd || 0).toFixed(2),
      'MY/SG Qty': row.mysg?.qty || 0,
      'MY/SG MYR': (row.mysg?.myr || 0).toFixed(2),
      'MY/SG USD': (row.mysg?.usd || 0).toFixed(2),
      'Total Clicks': row.clicks || 0,
      'USD Discount': (row.discount || 0).toFixed(2),
      'USD Total': (row.totalUsd || 0).toFixed(2),
      'USD Net Total': (row.netTotalUsd || 0).toFixed(2)
    }));
  };

  const exportHeaders = [
    'Traffic Code', 'Product Name', 'Global Qty', 'Global USD',
    'India Qty', 'India INR', 'India USD',
    'MY/SG Qty', 'MY/SG MYR', 'MY/SG USD',
    'Total Clicks', 'USD Discount', 'USD Total', 'USD Net Total'
  ];

  const exportToCSV = () => {
    const data = getExportData();
    const summaryRows = [
      'Summary Metrics',
      `Total Clicks,"${totals.clicks.toLocaleString()}"`,
      `Total Revenue,"$${totals.totalUsd.toFixed(2)}"`,
      `Total Net Revenue,"$${totals.netTotalUsd.toFixed(2)}"`,
      `Global Revenue,"$${totals.globalUsd.toFixed(2)}"`,
      `India Revenue,"$${totals.indiaUsd.toFixed(2)}"`,
      `MY/SG Revenue,"$${totals.mysgUsd.toFixed(2)}"`,
      '',
      'Detailed Report'
    ];
    const csvContent = [
      ...summaryRows,
      exportHeaders.join(','),
      ...data.map(row => exportHeaders.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `banner_sales_report_${startDate}_${endDate}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    const data = getExportData();
    const summaryRows = [
      ['Summary Metrics'],
      ['Total Clicks', totals.clicks],
      ['Total Revenue', totals.totalUsd],
      ['Total Net Revenue', totals.netTotalUsd],
      ['Global Revenue', totals.globalUsd],
      ['India Revenue', totals.indiaUsd],
      ['MY/SG Revenue', totals.mysgUsd],
      [],
      ['Detailed Report']
    ];
    const rows = [...summaryRows, exportHeaders, ...data.map(row => exportHeaders.map(h => row[h] || ''))];
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Banner Sales');
    XLSX.writeFile(workbook, `banner_sales_report_${startDate}_${endDate}.xlsx`);
  };

  const exportToPDF = async () => {
    const tableElement = document.getElementById('pdf-export-container');
    if (!tableElement) return toast.error('Table not found');

    const loadingToast = toast.loading('Generating PDF...');

    try {
      const canvas = await html2canvas(tableElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`banner_sales_report_${startDate}_${endDate}.pdf`);

      toast.success('PDF generated successfully', { id: loadingToast });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', { id: loadingToast });
    }
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4 w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6868f9]"></div>
          <p className="text-cosmic-muted font-medium animate-pulse">Loading Banner Sales Data</p>
        </div>
      ) : (
        <>
          {/* Export Buttons at Top */}
          <div className="flex justify-end w-full mb-2">
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={exportToCSV}
                className={`flex items-center justify-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg border font-semibold text-xs sm:text-sm shadow-sm transition-colors ${theme === 'dark' ? 'border-blue-900/50 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                <FileText className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={exportToExcel}
                className={`flex items-center justify-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg border font-semibold text-xs sm:text-sm shadow-sm transition-colors ${theme === 'dark' ? 'border-emerald-900/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40' : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                className={`flex items-center justify-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg border font-semibold text-xs sm:text-sm shadow-sm transition-colors ${theme === 'dark' ? 'border-rose-900/50 bg-rose-900/20 text-rose-400 hover:bg-rose-900/40' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'}`}
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Wrap both KPI and Table in one container for PDF export */}
          <div id="pdf-export-container" className="flex flex-col space-y-6">
            {/* KPI Summary Cards */}
            <div className="flex flex-col space-y-4">
              {/* Row 1: 4 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-cosmic-card border border-cosmic-border rounded-lg min-h-[130px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-[13px] text-cosmic-muted font-medium mb-1">Total Net Revenue</span>
                  <span className="text-[26px] font-bold text-cosmic-text">$ {totals.netTotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-cosmic-card border border-cosmic-border rounded-lg min-h-[130px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-[13px] text-cosmic-muted font-medium mb-1">Global Revenue</span>
                  <span className="text-[26px] font-normal text-cosmic-text">$ {(totals.globalUsd - totals.globalDiscount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-cosmic-card border border-cosmic-border rounded-lg min-h-[130px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                    <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-[13px] text-cosmic-muted font-medium mb-1">India Revenue</span>
                  <span className="text-[26px] font-normal text-cosmic-text">$ {(totals.indiaUsd - totals.indiaDiscount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-cosmic-card border border-cosmic-border rounded-lg min-h-[130px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-2">
                    <Map className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span className="text-[13px] text-cosmic-muted font-medium mb-1">Malaysia/Singapore Revenue</span>
                  <span className="text-[26px] font-normal text-cosmic-text">$ {(totals.mysgUsd - totals.mysgDiscount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Row 2: 4 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-cosmic-card border border-cosmic-border rounded-lg min-h-[130px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                    <MousePointerClick className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-[13px] text-cosmic-muted font-medium mb-1">Total Clicks</span>
                  <span className="text-[26px] font-normal text-cosmic-text">{totals.clicks.toLocaleString()}</span>
                </div>
                <div className="bg-cosmic-card border border-cosmic-border rounded-lg min-h-[130px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-2">
                    <Package className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span className="text-[13px] text-cosmic-muted font-medium mb-1">Global Quantity</span>
                  <span className="text-[26px] font-normal text-cosmic-text">{totals.globalQty.toLocaleString()}</span>
                </div>
                <div className="bg-cosmic-card border border-cosmic-border rounded-lg min-h-[130px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2">
                    <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-[13px] text-cosmic-muted font-medium mb-1">India Quantity</span>
                  <span className="text-[26px] font-normal text-cosmic-text">{totals.indiaQty.toLocaleString()}</span>
                </div>
                <div className="bg-cosmic-card border border-cosmic-border rounded-lg min-h-[130px] p-4 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                    <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-[13px] text-cosmic-muted font-medium mb-1">Malaysia/Singapore Quantity</span>
                  <span className="text-[26px] font-normal text-cosmic-text">{totals.mysgQty.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions & Search Bar Above Table */}
            <div className="flex flex-col md:flex-row justify-end items-center mb-5 gap-4 w-full">
              <div className="relative w-full sm:w-64 md:w-80 lg:w-96 group">
                {/* Glowing subtle background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-[#6868f9] rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6868f9] z-10 group-hover:scale-110 transition-transform duration-300" />
                <input
                  type="text"
                  placeholder="Search Traffic Code, Product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative bg-cosmic-card border border-[#6868f9]/30 text-sm text-cosmic-text pl-10 pr-5 py-2.5 rounded-full focus:outline-none focus:border-[#6868f9] focus:ring-2 focus:ring-[#6868f9]/20 placeholder-cosmic-muted w-full transition-all shadow-md hover:shadow-lg"
                />
              </div>
            </div>

            <div className="bg-cosmic-card border border-cosmic-border rounded-xl shadow-sm overflow-hidden flex flex-col p-2">
              <div className="bg-[#6868f9] p-3 flex justify-center items-center text-white border-b border-cosmic-border px-4 rounded-t-lg">
                <h4 className="font-semibold text-sm text-center">Banner Clicks Sales Report for {dateRangeLabel}</h4>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse relative min-w-[900px] lg:min-w-full">
                  <thead className="bg-[#6868f9] text-white">
                    {/* Top Level Headers */}
                    <tr>
                      <th colSpan="2" className="py-2 px-3 font-medium text-center border-b border-white/20 border-r border-white/10">Item Type</th>
                      <th colSpan="2" className="py-2 px-3 font-medium text-center border-b border-white/20 border-r border-white/10">Global</th>
                      <th colSpan="3" className="py-2 px-3 font-medium text-center border-b border-white/20 border-r border-white/10">India</th>
                      <th colSpan="3" className="py-2 px-3 font-medium text-center border-b border-white/20 border-r border-white/10">Malaysia/Singapore</th>
                      <th colSpan="1" className="py-2 px-3 font-medium text-center border-b border-white/20 border-r border-white/10">Clicks Details</th>
                      <th colSpan="1" className="py-2 px-3 font-medium text-center border-b border-white/20 border-r border-white/10">Discount Details</th>
                      <th colSpan="2" className="py-2 px-3 font-medium text-center border-b border-white/20">Total (All Markets) in USD</th>
                    </tr>
                    {/* Sub Level Headers */}
                    <tr className="bg-[#5b5be5]">
                      <th className="py-2 px-3 font-medium border-b border-white/20 border-r border-white/10">Traffic Code</th>
                      <th className="py-2 px-3 font-medium border-b border-white/20 border-r border-white/10">Product Name</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">Qty</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">USD</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">Qty</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">INR</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">USD</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">Qty</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">MYR</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">USD</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">Total Clicks</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">USD Discount</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20 border-r border-white/10">USD TOTAL</th>
                      <th className="py-2 px-2 font-medium text-center border-b border-white/20">USD Net Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {paginatedDataMain.map((row, idx) => {
                      if (row.isEmpty) {
                        return (
                          <tr key={`empty-${idx}`} className="h-[60px]">
                            <td className="py-2 px-3 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-3 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 border-r border-cosmic-border/30 text-transparent">&nbsp;</td>
                            <td className="py-2 px-2 text-transparent">&nbsp;</td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={idx} className="hover:bg-cosmic-bg transition-colors h-[60px]">
                          <td className="py-2 px-3 text-cosmic-text font-medium border-r border-cosmic-border/30">{row.code}</td>
                          <td className="py-2 px-3 border-r border-cosmic-border/30">{row.product}</td>
                          <td className="py-2 px-2 text-center border-r border-cosmic-border/30">{row.global.qty}</td>
                          <td className="py-2 px-2 text-right border-r border-cosmic-border/30">{row.global.usd.toFixed(2)}</td>
                          <td className="py-2 px-2 text-center border-r border-cosmic-border/30">{row.india.qty}</td>
                          <td className="py-2 px-2 text-right border-r border-cosmic-border/30">{row.india.inr.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right border-r border-cosmic-border/30">{row.india.usd.toFixed(2)}</td>
                          <td className="py-2 px-2 text-center border-r border-cosmic-border/30">{row.mysg.qty}</td>
                          <td className="py-2 px-2 text-right border-r border-cosmic-border/30">{row.mysg.myr.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right border-r border-cosmic-border/30">{row.mysg.usd.toFixed(2)}</td>
                          <td className="py-2 px-2 text-center border-r border-cosmic-border/30">{row.clicks}</td>
                          <td className="py-2 px-2 text-right border-r border-cosmic-border/30">{row.discount.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-semibold border-r border-cosmic-border/30">{row.totalUsd.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right font-bold">{row.netTotalUsd.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan="14" className="py-8 text-center text-cosmic-muted">No data available for this date range.</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className={`${theme === 'dark' ? 'bg-[#1a1a3a] text-[#ff6b6b]' : 'bg-[#ffffe0] text-[#c23b22]'} font-bold border-t border-cosmic-border sticky bottom-0 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]`}>
                    <tr>
                      <td colSpan="2" className="py-2 px-3 border-r border-cosmic-border/30 whitespace-nowrap">Total Revenue</td>
                      <td className="py-2 px-2 text-center text-cosmic-text border-r border-cosmic-border/30">{totals.globalQty}</td>
                      <td className="py-2 px-2 text-right text-cosmic-text border-r border-cosmic-border/30">{totals.globalUsd.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center text-cosmic-text border-r border-cosmic-border/30">{totals.indiaQty}</td>
                      <td className="py-2 px-2 text-right text-cosmic-text border-r border-cosmic-border/30">{totals.indiaInr.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-cosmic-text border-r border-cosmic-border/30">{totals.indiaUsd.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center text-cosmic-text border-r border-cosmic-border/30">{totals.mysgQty}</td>
                      <td className="py-2 px-2 text-right text-cosmic-text border-r border-cosmic-border/30">{totals.mysgMyr.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-cosmic-text border-r border-cosmic-border/30">{totals.mysgUsd.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center text-cosmic-text border-r border-cosmic-border/30">{totals.clicks}</td>
                      <td className="py-2 px-2 text-right text-cosmic-text border-r border-cosmic-border/30">{totals.discount.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-cosmic-text border-r border-cosmic-border/30">{totals.totalUsd.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-cosmic-text">{totals.netTotalUsd.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPagesMain > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 border-t border-cosmic-border bg-cosmic-card gap-3 text-center sm:text-left">
                  <span className="text-xs text-cosmic-muted">
                    Showing {(currentPageMain - 1) * MAIN_ITEMS_PER_PAGE + 1} to {Math.min(currentPageMain * MAIN_ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPageMain(prev => Math.max(prev - 1, 1))}
                      disabled={currentPageMain === 1}
                      className="p-1 rounded-md text-cosmic-muted hover:bg-cosmic-bg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-cosmic-text font-medium">
                      {currentPageMain} / {totalPagesMain}
                    </span>
                    <button
                      onClick={() => setCurrentPageMain(prev => Math.min(prev + 1, totalPagesMain))}
                      disabled={currentPageMain === totalPagesMain}
                      className="p-1 rounded-md text-cosmic-muted hover:bg-cosmic-bg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Close pdf-export-container */}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePageBanner;
