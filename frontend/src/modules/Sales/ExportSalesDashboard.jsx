import React, { useState, useEffect } from 'react';
import { Chart } from "react-google-charts";
import EChartWrapper from '../../charts/EChartWrapper';
import { api } from '../../services/api';

const ExportSalesDashboard = () => {
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(window.location.search);
  const period = queryParams.get('period') || 'Daily';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const dData = await api.getDailySalesDashboard(today);
        
        // For monthly, fetch current month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
        const mData = await api.getMonthlySalesDashboard(startOfMonth, endOfMonth);

        setDailyData(dData);
        setMonthlyData(mData);
      } catch (error) {
        console.error("Export fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading Report Data...</div>;

  const todayRevenueCards = dailyData?.salesKpiData?.todayRevenueCards || [];
  const monthRevenueCards = monthlyData?.salesKpiData?.monthRevenueCards || [];
  const dailyEventSales = dailyData?.eventSales || [];
  const monthlyEventSales = monthlyData?.eventSales || [];
  const monthlyRevenueSource = monthlyData?.revenueSource || [];
  const dailySpecials = dailyData?.specialsStoreItems || [];
  const monthlySpecials = monthlyData?.specialsStoreItems || [];
  const dailyBestSellers = dailyData?.bestSellers || [];
  const monthlyBestSellers = monthlyData?.bestSellers || [];
  const dailyLowPerformers = dailyData?.lowPerformers || [];
  const monthlyLowPerformers = monthlyData?.lowPerformers || [];

  const dynamicCurrencies = monthlyData?.currencies || [];
  let geoData = [["Country", "Revenue Share %"]];
  const countryMap = {
    'INR Share': 'IN',
    'USD Share': 'US',
    'MYR Share': 'MY'
  };
  if (dynamicCurrencies && dynamicCurrencies.length > 0) {
    dynamicCurrencies.forEach(c => {
      if (countryMap[c.name]) {
        geoData.push([countryMap[c.name], c.value]);
      }
    });
  }

  const geoOptions = {
    colorAxis: { colors: ['#e2e8f0', '#3b22b1'] },
    backgroundColor: 'transparent',
    datalessRegionColor: '#e2e8f0',
    defaultColor: '#e2e8f0',
    legend: 'none',
    tooltip: { isHtml: true }
  };

  let currencyGrowthData = monthlyData?.currencyGrowth || {
    labels: [], usd: [], inr: [], myr: [], usdPrev: [], inrPrev: [], myrPrev: []
  };

  const currencyGrowthOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['USD (Current Period)', 'INR (Current Period)', 'MYR (Current Period)', 'USD (Previous Period)', 'INR (Previous Period)', 'MYR (Previous Period)'],
      icon: 'circle',
      textStyle: { fontSize: 10, color: '#6b7280' },
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: currencyGrowthData.labels || [],
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
        formatter: (value) => value === 0 ? '0' : `${value / 1000}K`
      },
      splitLine: { lineStyle: { color: '#e5e7eb' } }
    },
    series: [
      { name: 'USD (Current Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.usd || [], itemStyle: { color: '#2563eb' } },
      { name: 'INR (Current Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.inr || [], itemStyle: { color: '#dc2626' } },
      { name: 'MYR (Current Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.myr || [], itemStyle: { color: '#16a34a' } },
      { name: 'USD (Previous Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.usdPrev || [], itemStyle: { color: '#9333ea' } },
      { name: 'INR (Previous Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.inrPrev || [], itemStyle: { color: '#d97706' } },
      { name: 'MYR (Previous Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.myrPrev || [], itemStyle: { color: '#0891b2' } }
    ]
  };

  return (
    <div id="report-ready" className="p-1 bg-slate-50 text-slate-800" style={{ width: '1200px' }}>
      
      <div className="mb-2">
        <h2 className="text-xl font-bold text-center mb-4">Total Sales Insights (Monthly)</h2>
        <div className="grid grid-cols-4 gap-2">
          {monthRevenueCards.map((card, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm p-2 text-center">
              <div className="text-sm text-slate-500 mb-2">{card.title}</div>
              <div className="text-3xl text-slate-900 mb-2">{card.value}</div>
              <div className="text-xs text-green-600">{card.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Daily Sales Insights (Always show) */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-center mb-4">Total Sales Insights (Daily)</h2>
        <div className="grid grid-cols-4 gap-2">
          {todayRevenueCards.map((card, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm p-2 text-center">
              <div className="text-sm text-slate-500 mb-2">{card.title}</div>
              <div className="text-3xl text-slate-900 mb-2">{card.value}</div>
              <div className="text-xs text-red-500">{card.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Daily Sales By Event Name (Only if period is Daily) */}
      {period.toLowerCase().includes('daily') && (
        <div className="mb-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white border-b border-slate-200 p-2">
              <h4 className="font-semibold text-slate-800">Total Sales By Event Name (Daily)</h4>
            </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#6868f9] text-white">
              <tr>
                <th className="py-1 px-2 w-12">#</th>
                <th className="py-1 px-2">Event Name</th>
                <th className="py-1 px-2 text-right">Qty</th>
                <th className="py-1 px-2 text-right">Revenue ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyEventSales.length > 0 ? (
                dailyEventSales.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1 px-2 text-slate-500">{idx + 1}.</td>
                    <td className="py-1 px-2">{item.name}</td>
                    <td className="py-1 px-2 text-right">{item.qty}</td>
                    <td className="py-1 px-2 text-right font-medium text-slate-900">{item.revenue.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 text-center text-slate-500 italic">No event sales data available for today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* 3c. Daily Specials Store Items (Only if period is Daily) */}
      {period.toLowerCase().includes('daily') && (
        <div className="mb-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#f97316] text-white p-2">
              <h4 className="font-semibold">Revenue as per Specials Store Items (Daily)</h4>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#6868f9] text-white">
                <tr>
                  <th className="py-1 px-2 w-12">#</th>
                  <th className="py-1 px-2">Store Item Name</th>
                  <th className="py-1 px-2 text-right">Qty</th>
                  <th className="py-1 px-2 text-right">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailySpecials.length > 0 ? (
                  dailySpecials.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 px-2 text-slate-500">{idx + 1}.</td>
                      <td className="py-1 px-2">{item.name}</td>
                      <td className="py-1 px-2 text-right">{item.qty}</td>
                      <td className="py-1 px-2 text-right font-medium text-green-600">{item.revenue.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-2 text-center text-slate-500 italic">No special store items data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3c2. Daily Best Sellers & Low Performers */}
      {period.toLowerCase().includes('daily') && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Best Sellers */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white border-b border-slate-200 p-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="text-emerald-500">🛍️</span> Best Selling Products (Daily)
              </h4>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-1 px-2 font-medium">Code</th>
                  <th className="py-1 px-2 font-medium">Product Name</th>
                  <th className="py-1 px-2 font-medium">Category</th>
                  <th className="py-1 px-2 font-medium text-right">Units Sold</th>
                  <th className="py-1 px-2 font-medium text-right">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyBestSellers.length > 0 ? (
                  dailyBestSellers.slice(0, 10).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 px-2 text-slate-500">{item.code || '-'}</td>
                      <td className="py-1 px-2 font-medium text-slate-700">{item.name}</td>
                      <td className="py-1 px-2 text-slate-500">{item.category}</td>
                      <td className="py-1 px-2 text-right">{item.qty || item.unitsSold || 0}</td>
                      <td className="py-1 px-2 text-right font-medium text-emerald-600">{item.revenue?.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-2 text-center text-slate-500 italic">No best selling products data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Low Performers */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white border-b border-slate-200 p-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="text-red-500">📉</span> Low Performing Products / Alert List (Daily)
              </h4>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-1 px-2 font-medium">Code</th>
                  <th className="py-1 px-2 font-medium">Product Name</th>
                  <th className="py-1 px-2 font-medium">Category</th>
                  <th className="py-1 px-2 font-medium text-right">Units Sold</th>
                  <th className="py-1 px-2 font-medium text-right">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyLowPerformers.length > 0 ? (
                  dailyLowPerformers.slice(0, 10).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 px-2 text-slate-500">{item.code || '-'}</td>
                      <td className="py-1 px-2 font-medium text-slate-700">{item.name}</td>
                      <td className="py-1 px-2 text-slate-500">{item.category}</td>
                      <td className="py-1 px-2 text-right">{item.qty || item.unitsSold || 0}</td>
                      <td className="py-1 px-2 text-right font-medium text-red-500">{item.revenue?.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-2 text-center text-slate-500 italic">No low performing products data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3b. Monthly Sales By Event Name (Only if period is NOT Daily) */}
      {!period.toLowerCase().includes('daily') && (
        <div className="mb-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white border-b border-slate-200 p-2">
              <h4 className="font-semibold text-slate-800">Total Sales By Event Name ({period})</h4>
            </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#6868f9] text-white">
              <tr>
                <th className="py-1 px-2 w-12">#</th>
                <th className="py-1 px-2">Event Name</th>
                <th className="py-1 px-2 text-right">Qty</th>
                <th className="py-1 px-2 text-right">Revenue ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyEventSales.length > 0 ? (
                monthlyEventSales.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1 px-2 text-slate-500">{idx + 1}.</td>
                    <td className="py-1 px-2">{item.name}</td>
                    <td className="py-1 px-2 text-right">{item.qty}</td>
                    <td className="py-1 px-2 text-right font-medium text-slate-900">{item.revenue.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 text-center text-slate-500 italic">No event sales data available for this month.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* 3d. Monthly Specials Store Items (Only if period is NOT Daily) */}
      {!period.toLowerCase().includes('daily') && (
        <div className="mb-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#f97316] text-white p-2">
              <h4 className="font-semibold">Revenue as per Specials Store Items ({period})</h4>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#6868f9] text-white">
                <tr>
                  <th className="py-1 px-2 w-12">#</th>
                  <th className="py-1 px-2">Store Item Name</th>
                  <th className="py-1 px-2 text-right">Qty</th>
                  <th className="py-1 px-2 text-right">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlySpecials.length > 0 ? (
                  monthlySpecials.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 px-2 text-slate-500">{idx + 1}.</td>
                      <td className="py-1 px-2">{item.name}</td>
                      <td className="py-1 px-2 text-right">{item.qty}</td>
                      <td className="py-1 px-2 text-right font-medium text-green-600">{item.revenue.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-2 text-center text-slate-500 italic">No special store items data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Monthly Revenue Source as per Event (Only if period is NOT Daily) */}
      {!period.toLowerCase().includes('daily') && (
        <div className="mb-0">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#f97316] text-white p-2">
              <h4 className="font-semibold">Revenue Source as per Event ({period})</h4>
            </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#6868f9] text-white">
              <tr>
                <th className="py-1 px-2 w-12">#</th>
                <th className="py-1 px-2">Event Name</th>
                <th className="py-1 px-2">Product Name</th>
                <th className="py-1 px-2">Source</th>
                <th className="py-1 px-2 text-right">Revenue ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyRevenueSource.length > 0 ? (
                monthlyRevenueSource.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1 px-2 text-slate-500">{idx + 1}.</td>
                    <td className="py-1 px-2">{item.eventName || item.name}</td>
                    <td className="py-1 px-2 text-slate-500">{item.productName || item.name}</td>
                    <td className="py-1 px-2 text-slate-500">{item.source}</td>
                    <td className="py-1 px-2 text-right font-medium text-green-600">{item.revenue.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 italic">No revenue source data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* 4b. Monthly Best Sellers & Low Performers (Only if period is NOT Daily) */}
      {!period.toLowerCase().includes('daily') && (
        <div className="grid grid-cols-2 gap-2 mb-0 mt-5">
          {/* Best Sellers */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white border-b border-slate-200 p-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="text-emerald-500">🛍️</span> Best Selling Products ({period})
              </h4>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-1 px-2 font-medium">Code</th>
                  <th className="py-1 px-2 font-medium">Product Name</th>
                  <th className="py-1 px-2 font-medium">Category</th>
                  <th className="py-1 px-2 font-medium text-right">Units Sold</th>
                  <th className="py-1 px-2 font-medium text-right">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyBestSellers.length > 0 ? (
                  monthlyBestSellers.slice(0, 10).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 px-2 text-slate-500">{item.code || '-'}</td>
                      <td className="py-1 px-2 font-medium text-slate-700">{item.name}</td>
                      <td className="py-1 px-2 text-slate-500">{item.category}</td>
                      <td className="py-1 px-2 text-right">{item.qty || item.unitsSold || 0}</td>
                      <td className="py-1 px-2 text-right font-medium text-emerald-600">{item.revenue?.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-2 text-center text-slate-500 italic">No best selling products data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Low Performers */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white border-b border-slate-200 p-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="text-red-500">📉</span> Low Performing Products / Alert List ({period})
              </h4>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-1 px-2 font-medium">Code</th>
                  <th className="py-1 px-2 font-medium">Product Name</th>
                  <th className="py-1 px-2 font-medium">Category</th>
                  <th className="py-1 px-2 font-medium text-right">Units Sold</th>
                  <th className="py-1 px-2 font-medium text-right">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyLowPerformers.length > 0 ? (
                  monthlyLowPerformers.slice(0, 10).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 px-2 text-slate-500">{item.code || '-'}</td>
                      <td className="py-1 px-2 font-medium text-slate-700">{item.name}</td>
                      <td className="py-1 px-2 text-slate-500">{item.category}</td>
                      <td className="py-1 px-2 text-right">{item.qty || item.unitsSold || 0}</td>
                      <td className="py-1 px-2 text-right font-medium text-red-500">{item.revenue?.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-2 text-center text-slate-500 italic">No low performing products data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4c. Monthly Sales Growth Stats Map (Only if period is NOT Daily) */}
      {!period.toLowerCase().includes('daily') && (
        <div className="mb-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[300px]">
            <div className="bg-[#f97316] p-3 flex justify-between items-center text-white">
              <h4 className="font-semibold text-sm">Sales Growth Stats Map ({period})</h4>
            </div>
            <div className="flex-1 bg-slate-50 flex flex-col relative w-full h-full overflow-hidden">
              <Chart
                chartType="GeoChart"
                width="100%"
                height="100%"
                data={geoData}
                options={geoOptions}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4d. Currency Growth (Only if period is NOT Daily) */}
      {!period.toLowerCase().includes('daily') && (
        <div className="mb-0">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="bg-[#6868f9] p-3 flex justify-between items-center text-white">
              <h4 className="font-semibold text-sm">Currency Growth (Current vs Previous Period)</h4>
            </div>
            <div className="p-1 bg-slate-50">
              <EChartWrapper option={currencyGrowthOption} height="300px" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExportSalesDashboard;
