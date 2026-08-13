import React, { useState, useEffect } from 'react';
import EChartWrapper from '../../charts/EChartWrapper';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Globe, AlertCircle } from 'lucide-react';
import { Chart } from "react-google-charts";
import { api } from '../../services/api';
import DailySales from './DailySales';
import MonthlySales from './MonthlySales';
import { usePagination } from '../../hooks/usePagination';

const salesCache = {};

const Sales = () => {
  const { startDate, endDate, setStartDate, setEndDate, dailyDate, setCalendarHidden } = useDateFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    setCalendarHidden(activeTab === 'daily');
    return () => setCalendarHidden(false); // Clean up on unmount
  }, [activeTab, setCalendarHidden]);

  const [showAllSalesByEvent, setShowAllSalesByEvent] = useState(false);
  const [showAllMonthSales, setShowAllMonthSales] = useState(false);
  const [showAllRevenueSource, setShowAllRevenueSource] = useState(false);
  const [showAllQuarterSpecials, setShowAllQuarterSpecials] = useState(false);

  useEffect(() => {
    let active = true;
    const dt = dailyDate ? dailyDate : new Date().toISOString().split('T')[0];
    const cacheKey = activeTab === 'daily' ? `daily_${dt}` : `monthly_${startDate}_${endDate}`;

    const fetchData = async () => {
      if (salesCache[cacheKey]) {
        setData(salesCache[cacheKey]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let result;
        if (activeTab === 'daily') {
          result = await api.getDailySalesDashboard(dt);
        } else {
          result = await api.getMonthlySalesDashboard(startDate, endDate);
        }
        if (active) {
          salesCache[cacheKey] = result;
          setData(result);
        }
      } catch (err) {
        console.error('Failed to load sales dashboard data:', err);
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
  }, [startDate, endDate, dailyDate, activeTab]);

  const activeData = data || {};
  const {
    categories = [],
    countries = [],
    currencies = [],
    bestSellers = [],
    lowPerformers = [],
    eventSales = [],
    revenueSource = [],
    salesByEventName = [],
    specialsStoreItems = [],
    quarterSpecials = []
  } = activeData;

  const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
  const showRevenue = !userPermissions || !userPermissions.data || userPermissions.data.viewRevenue !== false;

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

  const todayRevenueCards = activeData?.salesKpiData?.todayRevenueCards || [];
  const monthRevenueCards = activeData?.salesKpiData?.monthRevenueCards || [];

  const parseRevenue = (str) => {
    if (!str || typeof str !== 'string') return 0;
    return parseFloat(str.replace(/[^0-9.-]+/g, ""));
  };

  const kpiCards = activeTab === 'daily' ? todayRevenueCards : monthRevenueCards;
  let dynamicCurrencies = currencies && currencies.length > 0 ? currencies : [];

  if (dynamicCurrencies.length === 0 && kpiCards && kpiCards.length >= 4) {
    const total = parseRevenue(kpiCards[0]?.value);
    const usd = parseRevenue(kpiCards[1]?.value);
    const inr = parseRevenue(kpiCards[2]?.value);
    const myr = parseRevenue(kpiCards[3]?.value);

    if (total > 0) {
      dynamicCurrencies = [
        { name: 'INR Share', value: parseFloat(((inr / total) * 100).toFixed(1)) },
        { name: 'USD Share', value: parseFloat(((usd / total) * 100).toFixed(1)) },
        { name: 'MYR Share', value: parseFloat(((myr / total) * 100).toFixed(1)) }
      ];
      const other = 100 - (dynamicCurrencies[0].value + dynamicCurrencies[1].value + dynamicCurrencies[2].value);
      if (other > 0.1) {
        dynamicCurrencies.push({ name: 'Other Currencies', value: parseFloat(other.toFixed(1)) });
      }
    }
  }

  // Update activeData so children components receive the dynamic currencies
  activeData.currencies = dynamicCurrencies;
  const sortedEventSales = [...(eventSales || [])].sort((a, b) => b.revenue - a.revenue);
  const eventSalesChartPage = usePagination(sortedEventSales, 10);

  const categoryOption = {
    title: {
      text: 'Event Revenue Share',
      textStyle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
      left: 'center',
      top: 0
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const val = params[0];
        return `<div style="font-weight:bold;margin-bottom:4px;">${val.name}</div>
                Revenue: <span style="color:#10b981;font-weight:bold;">${val.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: eventSalesChartPage.currentData.map(e => e.name),
      axisLabel: { color: '#64748b', width: 90, overflow: 'truncate', interval: 0, rotate: 30, fontSize: 11 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 11, formatter: (value) => value >= 1000 ? `${value / 1000}k` : `${value}` },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
    },
    series: [
      {
        name: 'Revenue',
        type: 'bar',
        barWidth: '70%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#6868f9'
        },
        data: eventSalesChartPage.currentData.map(e => e.revenue)
      }
    ]
  };

  // Country Revenue Bar Chart
  const countryOption = {
    title: {
      text: 'Revenue by Currency',
      textStyle: { fontSize: 14 },
      top: 0,
      left: 'center'
    },
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: '#64748b' }
    },
    series: [
      {
        name: 'Currencies',
        type: 'pie',
        radius: ['35%', '55%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}',
          fontSize: 11,
          color: '#475569'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 15
        },
        itemStyle: {
          borderRadius: 6
        },
        data: (currencies || []).filter(curr => curr.value > 0).map((curr, index) => {
          const colors = {
            'INR Share': '#f97316', // Orange
            'USD Share': '#16a34a', // Green
            'MYR Share': '#eab308', // Yellow
            'Other Currencies': '#9ca3af'
          };
          return {
            name: curr.name.replace(' Share', ''),
            value: curr.value,
            itemStyle: { color: colors[curr.name] || '#6366f1' }
          };
        })
      }
    ]
  };

  let geoData = activeData?.geoData;
  if (!geoData || geoData.length <= 1) {
    geoData = [["Country", "Revenue Share %"]];
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
  }

  // Ensure currency growth has safe defaults if not provided
  let currencyGrowthData = activeData?.currencyGrowth || {
    labels: [],
    usd: [],
    inr: [],
    myr: [],
    usdPrev: [],
    inrPrev: [],
    myrPrev: []
  };

  // Attach enriched properties to activeData for children & export card
  activeData.geoData = geoData;
  activeData.currencyGrowth = currencyGrowthData;

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
      { name: 'USD (Current Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.usd || [], itemStyle: { color: '#2563eb' } }, // Blue
      { name: 'INR (Current Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.inr || [], itemStyle: { color: '#dc2626' } }, // Red
      { name: 'MYR (Current Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.myr || [], itemStyle: { color: '#16a34a' } }, // Green
      { name: 'USD (Previous Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.usdPrev || [], itemStyle: { color: '#9333ea' } }, // Purple
      { name: 'INR (Previous Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.inrPrev || [], itemStyle: { color: '#d97706' } }, // Amber
      { name: 'MYR (Previous Period)', type: 'line', symbol: 'circle', symbolSize: 6, data: currencyGrowthData.myrPrev || [], itemStyle: { color: '#0891b2' } }  // Cyan
    ]
  };

  const geoOptions = {
    backgroundColor: 'transparent',
    datalessRegionColor: '#cbd5e1', // Lighter slate for countries with no sales
    defaultColor: '#6868f9',
    colorAxis: { colors: ['#c7d2fe', '#6868f9', '#3730a3'] }, // Brand purple gradient for sales
    legend: 'none',
    tooltip: { trigger: 'focus' }
  };

  return (
    <div className="space-y-6 relative">

      {/* Top Navigation Tabs */}
      <div className="flex justify-center sm:justify-start mb-8">
        <div className="flex flex-col sm:flex-row bg-white dark:bg-cosmic-bg border border-gray-200 dark:border-cosmic-border rounded-2xl sm:rounded-full p-1 shadow-inner gap-1 sm:gap-0">
          <button
            onClick={() => setActiveTab('daily')}
            className={`relative flex justify-center items-center space-x-2 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ease-out ${activeTab === 'daily'
              ? 'bg-[#6868f9] text-white shadow-md transform scale-100'
              : 'bg-transparent text-cosmic-muted hover:text-cosmic-text transform scale-95 hover:scale-100'
              }`}
          >
            <Calendar size={16} className={activeTab === 'daily' ? 'text-white' : 'text-indigo-400'} />
            <span>Daily Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`relative flex justify-center items-center space-x-2 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ease-out ${activeTab === 'monthly'
              ? 'bg-[#6868f9] text-white shadow-md transform scale-100'
              : 'bg-transparent text-cosmic-muted hover:text-cosmic-text transform scale-95 hover:scale-100'
              }`}
          >
            <TrendingUp size={16} className={activeTab === 'monthly' ? 'text-white' : 'text-purple-400'} />
            <span>Monthly / Yearly Sales</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* GA4 Status Banners */}
        <div>
          {loading ? (
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg w-fit animate-pulse">
              <span className="w-2.5 h-2.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Syncing Real-Time GA4 Metrics...</span>
            </div>
          ) : activeData.gaConnected ? (
            activeData.gaRealTime ? (
              <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>GA4 Live Stream Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg w-fit">
                <span>GA4 Connected</span>
              </div>
            )
          ) : (
            <div className="flex items-center space-x-2 text-xs text-cosmic-muted font-semibold bg-cosmic-border/10 border border-cosmic-border/20 px-3 py-1.5 rounded-lg w-fit">
              <span>GA4 Disconnected (Configure settings in Integrations tab)</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4 w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
          <p className="text-cosmic-muted font-medium animate-pulse">Loading Sales Dashboard Data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'daily' ? (
            <DailySales
              eventSalesChartPage={eventSalesChartPage}
              data={activeData}
              showRevenue={showRevenue}
              categoryOption={categoryOption}
              countryOption={countryOption}
              currencyGrowthOption={currencyGrowthOption}
              showAllQuarterSpecials={showAllQuarterSpecials}
              setShowAllQuarterSpecials={setShowAllQuarterSpecials}
              dailyDate={dailyDate}
            />
          ) : (
            <MonthlySales
              eventSalesChartPage={eventSalesChartPage}
              data={activeData}
              showRevenue={showRevenue}
              geoData={geoData}
              geoOptions={geoOptions}
              categoryOption={categoryOption}
              countryOption={countryOption}
              currencyGrowthOption={currencyGrowthOption}
              showAllQuarterSpecials={showAllQuarterSpecials}
              setShowAllQuarterSpecials={setShowAllQuarterSpecials}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Sales;
