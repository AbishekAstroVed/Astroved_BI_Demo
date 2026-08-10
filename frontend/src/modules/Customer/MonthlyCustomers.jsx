import React, { useState, useEffect } from 'react';
import KPICard from '../../components/KPICard';
import EChartWrapper from '../../charts/EChartWrapper';
import { api } from '../../services/api';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { Heart, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import ExportReportsCard from '../../components/ExportReportsCard';

const customerCache = {};

const MonthlyCustomers = () => {
  const { startDate, endDate } = useDateFilter();
  const [activeTab, setActiveTab] = useState('monthly');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllContributors, setShowAllContributors] = useState(false);
  const [showAllTraffic, setShowAllTraffic] = useState(false);
  const [showAllProjection, setShowAllProjection] = useState(false);
  const [showAllRevenueTraffic, setShowAllRevenueTraffic] = useState(false);

  const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
  if (userPermissions && userPermissions.data && userPermissions.data.viewCustomer === false) {
    return (
      <div className="p-6 text-center bg-cosmic-card border border-cosmic-border rounded-2xl max-w-md mx-auto mt-10">
        <h3 className="text-sm font-extrabold text-cosmic-text mb-2 flex items-center justify-center space-x-1.5">
          <span>🔒 Access Restricted</span>
        </h3>
        <p className="text-xs text-cosmic-muted">Your role profile does not have permission to view Customer cohorts or reports.</p>
      </div>
    );
  }

  const [metricsPeriod, setMetricsPeriod] = useState('Monthly');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [prevDates, setPrevDates] = useState({ startDate, endDate });

  useEffect(() => {
    if (startDate !== prevDates.startDate || endDate !== prevDates.endDate) {
      setUseCustomDates(true);
      setPrevDates({ startDate, endDate });
    }
  }, [startDate, endDate]);
  const [liveMetrics, setLiveMetrics] = useState({ labels: ['-', '-', '-'], rows: [], demographics: null, demographicsPrev: null, raw: [] });
  const [newCustomersByEvent, setNewCustomersByEvent] = useState([]);
  const [newCustomersByProduct, setNewCustomersByProduct] = useState([]);
  const [highContributors, setHighContributors] = useState([]);
  const [newCustomersByTraffic, setNewCustomersByTraffic] = useState([]);
  const [projectionByTraffic, setProjectionByTraffic] = useState([]);
  const [revenueByTrafficSource, setRevenueByTrafficSource] = useState(customerCache['Monthly']?.revenueByTrafficSource || []);
  const [loadingMetrics, setLoadingMetrics] = useState(!customerCache['Monthly']);

  useEffect(() => {
    const fetchMetrics = async () => {
      const actualStart = useCustomDates ? startDate : undefined;
      const actualEnd = useCustomDates ? endDate : undefined;
      const cacheKey = (actualStart && actualEnd) ? `${metricsPeriod}_${actualStart}_${actualEnd}` : metricsPeriod;

      if (!customerCache[cacheKey]) {
        setLoadingMetrics(true);
      }
      try {
        let response = customerCache[cacheKey];
        if (!response) {
          response = await api.getCustomerMetrics(metricsPeriod, actualStart, actualEnd);
          customerCache[cacheKey] = response;
        }

        if (response && response.data && response.data.length > 0) {
          const len = response.data.length;
          const current = response.data[len - 1];
          const prev = response.data[len - 2] || current;
          const older = response.data[len - 3] || prev;

          const rows = [
            {
              metric: 'Total Customers',
              col1: older.totalCustomers || 0,
              col2: prev.totalCustomers || 0,
              col3: current.totalCustomers || 0
            },
            {
              metric: 'Total Order (Count)',
              col1: older.totalOrders || 0,
              col2: prev.totalOrders || 0,
              col3: current.totalOrders || 0
            },
            {
              metric: 'New Registered Customers with Purchase',
              col1: older.newRegistered || 0,
              col2: prev.newRegistered || 0,
              col3: current.newRegistered || 0
            },
            {
              metric: 'Repeat Purchase Customers (2+ orders, incl.)',
              col1: older.repeat || 0,
              col2: prev.repeat || 0,
              col3: current.repeat || 0
            },
            {
              metric: 'Non-Repeat (One-time) Customers',
              col1: older.nonRepeat || 0,
              col2: prev.nonRepeat || 0,
              col3: current.nonRepeat || 0
            },
            {
              metric: 'Repeat Customer Rate (% of total customers)',
              col1: older.repeatRate || '0%',
              col2: prev.repeatRate || '0%',
              col3: current.repeatRate || '0%'
            }
          ];
          setLiveMetrics({
            labels: [older.period || '-', prev.period || '-', current.period || '-'],
            rows,
            demographics: current.demographics || { newTotal: 0, newUsd: 0, newMyr: 0, newInr: 0, retTotal: 0, retUsd: 0, retMyr: 0, retInr: 0 },
            demographicsPrev: prev.demographics || { newTotal: 0, newUsd: 0, newMyr: 0, newInr: 0, retTotal: 0, retUsd: 0, retMyr: 0, retInr: 0 },
            raw: response.data
          });
          if (response.newCustomersByEventName) {
            setNewCustomersByEvent(response.newCustomersByEventName);
          }
          if (response.newCustomersByProductName) {
            setNewCustomersByProduct(response.newCustomersByProductName);
          }
          if (response.highContributors) {
            setHighContributors(response.highContributors);
          }
          if (response.newCustomersByTraffic) {
            setNewCustomersByTraffic(response.newCustomersByTraffic);
          }
          if (response.projectionByTraffic) {
            setProjectionByTraffic(response.projectionByTraffic);
          }
          if (response.revenueByTrafficSource) {
            setRevenueByTrafficSource(response.revenueByTrafficSource);
          }
        }
      } catch (error) {
        console.error("Failed to fetch customer metrics:", error);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, [metricsPeriod, startDate, endDate, useCustomDates]);





  const newCustomersByCountryOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Total New', 'USD', 'MYR', 'INR'],
      top: '5%',
      icon: 'rect',
      itemWidth: 15,
      itemHeight: 2
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: liveMetrics.raw.map(r => r.period)
    },
    yAxis: {
      type: 'value',
      name: 'Members',
      axisLabel: {
        formatter: (value) => {
          if (value >= 1000) return (value / 1000) + 'K';
          return value;
        }
      }
    },
    series: [
      {
        name: 'Total New',
        type: 'line',
        data: liveMetrics.raw.map(r => r.demographics.newTotal),
        itemStyle: { color: '#16a34a' },
        showSymbol: false,
        lineStyle: { width: 2 }
      },
      {
        name: 'USD',
        type: 'line',
        data: liveMetrics.raw.map(r => r.demographics.newUsd),
        itemStyle: { color: '#dc2626' },
        showSymbol: false,
        lineStyle: { width: 2 }
      },
      {
        name: 'MYR',
        type: 'line',
        data: liveMetrics.raw.map(r => r.demographics.newMyr),
        itemStyle: { color: '#f97316' },
        showSymbol: false,
        lineStyle: { width: 2 }
      },
      {
        name: 'INR',
        type: 'line',
        data: liveMetrics.raw.map(r => r.demographics.newInr),
        itemStyle: { color: '#4f46e5' },
        showSymbol: false,
        lineStyle: { width: 2 }
      }
    ]
  };


  const revenueBySourceOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['Target Final', 'Revenue', 'Projected Final'],
      top: '5%',
      icon: 'rect'
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: projectionByTraffic.map(item => item.group),
      axisLabel: { interval: 0, rotate: 45 }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => value === 0 ? '0' : `${value / 1000}K`
      },
      splitLine: { lineStyle: { color: '#6366f1', type: 'solid', opacity: 0.2 } }
    },
    series: [
      { name: 'Target Final', type: 'bar', data: projectionByTraffic.map(item => parseFloat(item.expected) || 0), itemStyle: { color: '#3b82f6' } },
      { name: 'Revenue', type: 'bar', data: projectionByTraffic.map(item => item.revenue || 0), itemStyle: { color: '#22c55e' } },
      { name: 'Projected Final', type: 'bar', data: projectionByTraffic.map(item => parseFloat(item.projected) || 0), itemStyle: { color: '#f59e0b' } }
    ]
  };



  return (
    <div className="space-y-6">
      {/* Global Metrics Period Toggle */}
      <div className="flex justify-start mb-2">
        <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700 w-full md:w-auto">
          {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period, idx) => (
            <button
              key={period}
              onClick={() => {
                setMetricsPeriod(period);
                setUseCustomDates(false);
              }}
              className={`flex-1 md:flex-none md:w-28 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-medium transition-all ${metricsPeriod === period && !useCustomDates
                ? 'bg-[#f0f7ff] dark:bg-blue-500/20 text-[#2563eb] dark:text-blue-400 border border-[#bfdbfe] dark:border-blue-500/30 rounded shadow-sm z-10'
                : 'text-slate-500 dark:text-slate-400 bg-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 border-y border-transparent ' + (metricsPeriod !== period && idx !== 0 && metricsPeriod !== ['Daily', 'Weekly', 'Monthly', 'Yearly'][idx - 1] ? 'border-l-[1px] border-l-slate-200 dark:border-l-slate-600' : 'border-l-0')
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={metricsPeriod === period && !useCustomDates ? 'text-[#3b82f6]' : 'text-slate-400'}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
              {period}
            </button>
          ))}
        </div>
      </div>

      {loadingMetrics ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4 w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
          <p className="text-cosmic-muted font-medium animate-pulse">Loading Customer Dashboard Data...</p>
        </div>
      ) : (
        <>
          {/* Metrics Table */}
          <div className="bg-cosmic-card border border-cosmic-border rounded-xl shadow-sm flex flex-col mb-8 overflow-hidden">
            <div className="bg-[#f97316] p-3 flex justify-between items-center text-white">
              <h4 className="font-semibold text-sm">
                Customer Metrics
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#6868f9] text-white">
                  <tr>
                    <th className="py-2 px-4 font-medium border-r border-white/20">Metric</th>
                    <th className="py-2 px-4 font-medium border-r border-white/20 text-center">
                      {liveMetrics?.labels?.[0] || 'Period 1'}
                    </th>
                    <th className="py-2 px-4 font-medium border-r border-white/20 text-center">
                      {liveMetrics?.labels?.[1] || 'Period 2'}
                    </th>
                    <th className="py-2 px-4 font-medium text-center">
                      {liveMetrics?.labels?.[2] || 'Period 3'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                  {loadingMetrics ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-500">Loading live data from SQL Server...</td>
                    </tr>
                  ) : (
                    liveMetrics?.rows?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-cosmic-bg border-b border-cosmic-border last:border-0">
                        <td className="py-3 px-4 border-r border-cosmic-border font-medium text-slate-800 dark:text-slate-200">
                          {row.metric}
                        </td>
                        <td className="py-3 px-4 text-center border-r border-cosmic-border text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                          {row.col1}
                        </td>
                        <td className="py-3 px-4 text-center border-r border-cosmic-border text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                          {row.col2}
                        </td>
                        <td className="py-3 px-4 text-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                          {row.col3}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparison Section (From Screenshot) */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-normal text-center text-cosmic-text mb-6">
              Comparison of New Customer Contributions
            </h2>

            {/* 4 Cards Row - New Members */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[
                { label: 'New Members', curr: liveMetrics?.demographics?.newTotal || 0, prev: liveMetrics?.demographicsPrev?.newTotal || 0 },
                { label: 'New USD Members', curr: liveMetrics?.demographics?.newUsd || 0, prev: liveMetrics?.demographicsPrev?.newUsd || 0 },
                { label: 'New MYR Members', curr: liveMetrics?.demographics?.newMyr || 0, prev: liveMetrics?.demographicsPrev?.newMyr || 0 },
                { label: 'New INR Members', curr: liveMetrics?.demographics?.newInr || 0, prev: liveMetrics?.demographicsPrev?.newInr || 0 }
              ].map((card, idx) => (
                <div key={idx} className="bg-cosmic-card border border-cosmic-border rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-sm font-medium text-cosmic-muted mb-1 text-center">{card.label}</span>
                  <span className="text-4xl font-normal text-cosmic-text mb-2">{card.curr}</span>
                  <div className="flex items-center space-x-1 bg-cosmic-bg px-1.5 py-0.5 rounded-sm">
                    <span className="bg-blue-500 text-white text-[9px] w-3 h-3 flex items-center justify-center font-bold">!</span>
                    <span className={`text-[11px] font-bold ${card.curr >= card.prev ? 'text-green-500' : 'text-red-500'}`}>
                      {card.prev === 0 ? (card.curr > 0 ? '+100.0%' : '0.0%') : `${(card.curr - card.prev) > 0 ? '+' : ''}${((card.curr - card.prev) / card.prev * 100).toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 4 Cards Row - Returning Members */}
            <h2 className="text-xl md:text-2xl font-normal text-center text-cosmic-text mb-6">
              Comparison of Returning Customer Contributions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Returning Members', curr: liveMetrics?.demographics?.retTotal || 0, prev: liveMetrics?.demographicsPrev?.retTotal || 0 },
                { label: 'Returning USD Members', curr: liveMetrics?.demographics?.retUsd || 0, prev: liveMetrics?.demographicsPrev?.retUsd || 0 },
                { label: 'Returning MYR Members', curr: liveMetrics?.demographics?.retMyr || 0, prev: liveMetrics?.demographicsPrev?.retMyr || 0 },
                { label: 'Returning INR Members', curr: liveMetrics?.demographics?.retInr || 0, prev: liveMetrics?.demographicsPrev?.retInr || 0 }
              ].map((card, idx) => (
                <div key={idx} className="bg-cosmic-card border border-cosmic-border rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-sm font-medium text-cosmic-muted mb-1 text-center">{card.label}</span>
                  <span className="text-4xl font-normal text-cosmic-text mb-2">{card.curr}</span>
                  <div className="flex items-center space-x-1 bg-cosmic-bg px-1.5 py-0.5 rounded-sm">
                    <span className="bg-blue-500 text-white text-[9px] w-3 h-3 flex items-center justify-center font-bold">!</span>
                    <span className={`text-[11px] font-bold ${card.curr >= card.prev ? 'text-green-500' : 'text-red-500'}`}>
                      {card.prev === 0 ? (card.curr > 0 ? '+100.0%' : '0.0%') : `${(card.curr - card.prev) > 0 ? '+' : ''}${((card.curr - card.prev) / card.prev * 100).toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 2 Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Table 1: Event Name */}
              <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col self-start rounded-xl overflow-hidden">
                <div className="bg-gray-500 p-2 flex justify-between items-center text-white px-4">
                  <h4 className="font-semibold text-sm">New Customers By Event Name</h4>
                </div>
                <div className="overflow-hidden">
                  <div className="overflow-y-auto overflow-x-auto max-h-[300px] w-full">
                    <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                      <thead className="bg-[#6868f9] text-white sticky top-0 z-10">
                        <tr>
                          <th className="py-2 px-3 font-medium w-8 text-center border-b border-white/20"></th>
                          <th className="py-2 px-3 font-medium border-b border-white/20">Event Name</th>
                          <th className="py-2 px-3 font-medium text-center border-b border-white/20">QTY ▾</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                        {newCustomersByEvent.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-cosmic-bg">
                            <td className="py-2 px-3 text-cosmic-muted text-center">{idx + 1}.</td>
                            <td className="py-2 px-3">{item.name}</td>
                            <td className="py-2 px-3 text-center">{item.qty}</td>
                            <td className="py-2 px-3 text-right">${item.revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Table 2: Product Name */}
              <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col self-start rounded-xl overflow-hidden">
                <div className="bg-[#f97316] p-2 flex justify-between items-center text-white px-4">
                  <h4 className="font-semibold text-sm">New Customers By Product Name</h4>
                </div>
                <div className="overflow-hidden">
                  <div className="overflow-y-auto overflow-x-auto max-h-[300px] w-full">
                    <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                      <thead className="bg-[#6868f9] text-white sticky top-0 z-10">
                        <tr>
                          <th className="py-2 px-3 font-medium w-8 text-center border-b border-white/20"></th>
                          <th className="py-2 px-3 font-medium border-b border-white/20">Product Name</th>
                          <th className="py-2 px-3 font-medium text-center border-b border-white/20">QTY ▾</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                        {newCustomersByProduct.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-cosmic-bg">
                            <td className="py-2 px-3 text-cosmic-muted text-center">{idx + 1}.</td>
                            <td className="py-2 px-3">{item.name}</td>
                            <td className="py-2 px-3 text-center">{item.qty}</td>
                            <td className="py-2 px-3 text-right">${item.revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Customers By Country & High Contributors Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chart: New Members Trend */}
            <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col h-[350px] self-start rounded-xl overflow-hidden">
              <div className="bg-[#f97316] p-2 flex justify-center items-center text-white">
                <h4 className="font-semibold text-sm">New Members Trend (by Currency)</h4>
              </div>
              <div className="flex-1 p-2">
                <EChartWrapper option={newCustomersByCountryOption} height="100%" />
              </div>
            </div>

            {/* Table: High Contributors */}
            <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col self-start w-full rounded-xl overflow-hidden">
              <div className="bg-gray-500 p-2 flex justify-between items-center text-white px-4">
                <h4 className="font-semibold text-sm">New Customers Sorted By High Contribution</h4>
              </div>
              <div className="overflow-hidden flex-1">
                <div className="overflow-y-auto overflow-x-auto max-h-[300px] w-full">
                  <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                    <thead className="bg-[#6868f9] text-white sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-3 font-medium border-b border-white/20">Customer Name</th>
                        <th className="py-2 px-3 font-medium border-b border-white/20">Currency</th>
                        <th className="py-2 px-3 font-medium border-b border-white/20">Country</th>
                        <th className="py-2 px-3 font-medium border-b border-white/20 text-center">QTY</th>
                        <th className="py-2 px-3 font-medium border-b border-white/20 text-right">Revenue ▾</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                      {highContributors.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-cosmic-bg">
                          <td className="py-2 px-3 flex items-center space-x-2">
                            <span className="text-cosmic-muted w-4">{idx + 1}.</span>
                            <span>{item.name}</span>
                          </td>
                          <td className="py-2 px-3">{item.currency}</td>
                          <td className="py-2 px-3">{item.country}</td>
                          <td className="py-2 px-3 text-center">{item.qty}</td>
                          <td className="py-2 px-3 text-right">${item.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Sources Table */}
          <div className="mb-8">
            <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden">
              <div className=" p-2 flex justify-between items-center text-cosmic-text px-4">
                <h4 className="font-semibold text-sm">New Customers By Traffic Sources</h4>
              </div>
              <div className="overflow-hidden">
                <div className="overflow-y-auto overflow-x-auto max-h-[300px] w-full">
                  <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                    <thead className="bg-[#6868f9] text-white sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-4 font-medium border-b border-white/20">Traffic Sources</th>
                        <th className="py-2 px-4 font-medium text-center border-b border-white/20">QTY</th>
                        <th className="py-2 px-4 font-medium text-right border-b border-white/20">% Δ</th>
                        <th className="py-2 px-4 font-medium text-right border-b border-white/20">Revenue ▾</th>
                        <th className="py-2 px-4 font-medium text-right border-b border-white/20">% Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                      {newCustomersByTraffic.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-cosmic-bg">
                          <td className="py-3 px-4 flex items-center space-x-2">
                            <span className="text-cosmic-muted w-4">{idx + 1}.</span>
                            <span>{item.source}</span>
                          </td>
                          <td className="py-3 px-4 text-center">{item.qty}</td>
                          <td className={`py-3 px-4 text-right ${item.qtyTrend === 'up' ? 'text-green-500' : item.qtyTrend === 'down' ? 'text-red-500' : ''}`}>
                            {item.qtyChange}
                          </td>
                          <td className="py-2 px-3 text-right">${item.revenue.toFixed(2)}</td>
                          <td className={`py-2 px-3 text-right ${item.revTrend === 'up' ? 'text-emerald-500' : item.revTrend === 'down' ? 'text-red-500' : ''}`}>
                            {item.revChange}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison of Revenue by Source Section */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-normal text-center text-cosmic-text mb-6">
              Comparison of Revenue by Source
            </h2>

            {/* Bar Chart */}
            <div className="bg-cosmic-card border border-cosmic-border shadow-sm p-4 h-[400px] mb-8 rounded-xl overflow-hidden">
              <EChartWrapper option={revenueBySourceOption} height="100%" />
            </div>

            {/* Two Tables Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Projection By Traffic Category */}
              <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col self-start w-full rounded-xl overflow-hidden">
                <div className="bg-[#f97316] p-2 flex justify-between items-center text-white px-4">
                  <h4 className="font-semibold text-sm">Projection By Traffic Category</h4>
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="overflow-y-auto overflow-x-auto max-h-[300px] w-full">
                    <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                      <thead className="bg-[#6868f9] text-white sticky top-0 z-10">
                        <tr>
                          <th className="py-2 px-3 font-medium border-b border-white/20">Traffic Group</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">Expected</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">Projected</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">% Δ</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">Revenue ▾</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">% Δ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                        {projectionByTraffic.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-cosmic-bg">
                            <td className="py-2 px-3 flex items-center space-x-2">
                              <span className="text-cosmic-muted w-4">{idx + 1}.</span>
                              <span>{item.group}</span>
                            </td>
                            <td className="py-2 px-3 text-right">{item.expected}</td>
                            <td className="py-2 px-3 text-right">{item.projected}</td>
                            <td className={`py-2 px-3 text-right ${item.projTrend === 'up' ? 'text-green-500' : item.projTrend === 'down' ? 'text-red-500' : ''}`}>
                              {item.projChange}
                            </td>
                            <td className="py-2 px-3 text-right">${item.revenue.toFixed(2)}</td>
                            <td className={`py-2 px-3 text-right ${item.revTrend === 'up' ? 'text-green-500' : item.revTrend === 'down' ? 'text-red-500' : ''}`}>
                              {item.revChange}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Revenue By Traffic Sources */}
              <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden">
                <div className="bg-[#f97316] p-2 flex justify-between items-center text-white px-4">
                  <h4 className="font-semibold text-sm">Revenue By Traffic Sources</h4>
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="overflow-y-auto overflow-x-auto max-h-[300px] w-full">
                    <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                      <thead className="bg-[#6868f9] text-white sticky top-0 z-10">
                        <tr>
                          <th className="py-2 px-3 font-medium border-b border-white/20">Traffic Source</th>
                          <th className="py-2 px-3 font-medium text-center border-b border-white/20">Quantity</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">% Δ</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">Revenue ▾</th>
                          <th className="py-2 px-3 font-medium text-right border-b border-white/20">% Δ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                        {revenueByTrafficSource.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-cosmic-bg">
                            <td className="py-2 px-3 flex items-center space-x-2">
                              <span className="text-cosmic-muted w-4">{idx + 1}.</span>
                              <span>{item.source}</span>
                            </td>
                            <td className="py-2 px-3 text-center">{item.qty}</td>
                            <td className={`py-2 px-3 text-right ${item.qtyTrend === 'up' ? 'text-green-500' : item.qtyTrend === 'down' ? 'text-red-500' : ''}`}>
                              {item.qtyChange}
                            </td>
                            <td className="py-2 px-3 text-right">${item.revenue.toFixed(2)}</td>
                            <td className={`py-2 px-3 text-right ${item.revTrend === 'up' ? 'text-green-500' : item.revTrend === 'down' ? 'text-red-500' : ''}`}>
                              {item.revChange}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Reports Component */}
          <ExportReportsCard
            data={{
              customerKpiCards: [
                { title: 'Total Registered Customers', value: String(liveMetrics.rows.find(r => r.metric.includes('Total Customers'))?.col3 || '0'), change: '+ Active Cohort' },
                { title: 'New Purchasing Customers', value: String(liveMetrics.rows.find(r => r.metric.includes('New Registered'))?.col3 || '0'), change: '+ Monthly Growth' },
                { title: 'Repeat Purchase Customers', value: String(liveMetrics.rows.find(r => r.metric.includes('Repeat Purchase'))?.col3 || '0'), change: '+ Loyalty Metric' },
                { title: 'High Contributor Accounts', value: String(highContributors.length || '0'), change: 'Top Tier Spenders' }
              ],
              customerMetricsRows: liveMetrics.rows || [],
              customerMetricsLabels: liveMetrics.labels || ['Older', 'Previous', 'Current'],
              demographics: liveMetrics.demographics || null,
              newCustomersByEvent,
              newCustomersByProduct,
              highContributors,
              newCustomersByTraffic,
              projectionByTraffic,
              revenueByTrafficSource,
              newMemberTrendByCurrency: liveMetrics.raw?.map(r => ({
                period: r.period,
                total: r.demographics?.newTotal || 0,
                usd: r.demographics?.newUsd || 0,
                myr: r.demographics?.newMyr || 0,
                inr: r.demographics?.newInr || 0
              })) || [],
              comparisonOfRevenueBySource: projectionByTraffic
            }}
            defaultPeriod={metricsPeriod}
            onPeriodChange={setMetricsPeriod}
            pageTitle="Customer Reports"
            showPeriodTabs={true}
          />
        </>
      )}
    </div>
  );
};

export default MonthlyCustomers;
