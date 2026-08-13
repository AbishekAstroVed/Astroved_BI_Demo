import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import EChartWrapper from '../../charts/EChartWrapper';
import worldGeoJson from '../../assets/world.json';
import { api } from '../../services/api';
import { useDateFilter } from '../../contexts/DateFilterContext';
import MultiSelectDropdown from '../../components/MultiSelectDropdown';
import SearchableDropdown from '../../components/SearchableDropdown';
import ExportReportsCard from '../../components/ExportReportsCard';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

echarts.registerMap('world', worldGeoJson);

const Newsletter = () => {
  const { startDate, endDate } = useDateFilter();
  const [nlCategory, setNlCategory] = useState([]);
  const [eventName, setEventName] = useState('All');
  const [allEvents, setAllEvents] = useState([]);
  const [showAllCategorySales, setShowAllCategorySales] = useState(false);
  const [showAllStatistics, setShowAllStatistics] = useState(false);
  const [showAllDateWise, setShowAllDateWise] = useState(false);
  const [showAllBreakup, setShowAllBreakup] = useState(false);
  const [showAllSpecialEvents, setShowAllSpecialEvents] = useState(false);
  const [showAllTypesCompared, setShowAllTypesCompared] = useState(false);

  const [kpiData, setKpiData] = useState({
    western: 0,
    targeted: 0,
    india: 0,
    overall: 0
  });

  const [overallEventsData, setOverallEventsData] = useState([]);
  const [specialEventsData, setSpecialEventsData] = useState([]);
  const [dateWisePerformance, setDateWisePerformance] = useState([]);
  const [specialEventsPerformanceData, setSpecialEventsPerformanceData] = useState([]);
  const [overallPerformanceData, setOverallPerformanceData] = useState([]);
  const [currentYearSummaryData, setCurrentYearSummaryData] = useState([]);
  const [previousYearSummaryData, setPreviousYearSummaryData] = useState([]);
  const [eventsCompared, setEventsCompared] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const events = await api.getAllEventNames();
        setAllEvents(events);
      } catch (err) {
        console.error("Failed to fetch all events", err);
      }
    };
    fetchAllEvents();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Pass the start and end dates and selected categories to the API
        const categories = nlCategory.map(c => c.value); // MultiSelectDropdown uses {label, value} objects
        const data = await api.getNewsletterDashboard(startDate, endDate, categories, eventName);
        if (data.kpiData) {
          setKpiData(data.kpiData);
        }
        if (data.specialEventsData) {
          setSpecialEventsData(data.specialEventsData);
        }
        if (data.overallEventsData) {
          setOverallEventsData(data.overallEventsData);
        }
        if (data.dateWisePerformance) {
          setDateWisePerformance(data.dateWisePerformance);
        }
        if (data.specialEventsPerformanceData) {
          setSpecialEventsPerformanceData(data.specialEventsPerformanceData);
        }
        if (data.overallPerformanceData) {
          setOverallPerformanceData(data.overallPerformanceData);
        }
        if (data.breakupSummaryData) {
          const maxCount = Math.max(...data.breakupSummaryData.map(d => d.count), 1);
          const maxRevenue = Math.max(...data.breakupSummaryData.map(d => d.revenue), 1);

          const mappedBreakup = data.breakupSummaryData.map((item) => {
            const countOpacity = Math.max(0.1, item.count / maxCount);
            const revOpacity = Math.max(0.1, item.revenue / maxRevenue);
            return {
              ...item,
              countOpacity,
              revOpacity
            };
          });
          setBreakupSummary(mappedBreakup);
        }
        if (data.typesComparedData) {
          setTypesCompared(data.typesComparedData);
        }
        if (data.eventsComparedData) {
          setEventsCompared(data.eventsComparedData);
        }
        if (data.currentYearSummaryData) {
          setCurrentYearSummaryData(data.currentYearSummaryData);
        }
        if (data.previousYearSummaryData) {
          setPreviousYearSummaryData(data.previousYearSummaryData);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching newsletter data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate, nlCategory, eventName]);

  const categorySales = specialEventsData.map((item) => ({
    id: item.id,
    name: item.name,
    revenue: item.nlw + item.nli + item.oml
  })).sort((a, b) => b.revenue - a.revenue);

  const handleCategoryClick = (categoryType) => {
    if (nlCategory.length === 1 && nlCategory[0].value === categoryType) {
      setNlCategory([]); // Toggle off
    } else {
      setNlCategory([{ label: categoryType, value: categoryType }]);
    }
  };


  const categorySalesPage = usePagination(categorySales || [], 10);

  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
  const maxVisibleItems = isMobileView ? 5 : 12;

  const eventConversionChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        if (!params || !params.length) return '';
        const dataItem = params[0].data;
        const fullName = dataItem?.fullName || params[0].name;
        return `${fullName}<br/>${params[0].marker} ${params[0].seriesName}: ${params[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    },
    grid: { bottom: '15%', left: '15%', right: '5%', top: '15%' },
    xAxis: {
      type: 'category',
      data: categorySalesPage.currentData.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name),
      axisLabel: { color: 'var(--cosmic-text)', fontSize: 10, rotate: 45 }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: 'var(--cosmic-text)',
        formatter: (value) => value >= 1000 ? `${value / 1000}k` : `${value}`
      },
      splitLine: { lineStyle: { color: 'var(--cosmic-border)' } }
    },
    series: [
      {
        name: 'Net Revenue In USD',
        type: 'bar',
        barWidth: isMobileView ? '50%' : '60%',
        data: categorySalesPage.currentData.map(item => ({
          value: Number(item.revenue.toFixed(2)),
          fullName: item.name
        })),
        itemStyle: { color: '#0284c7', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: 'var(--cosmic-text)',
          formatter: '${c}',
          fontSize: isMobileView ? 9 : 11
        }
      }
    ]
  };

  const donutData = categorySales.slice(0, 10).map(item => ({
    value: Number(item.revenue.toFixed(2)),
    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
    fullName: item.name
  }));

  const eventRevenueDonutOption = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const fullName = params.data?.fullName || params.name;
        return `${params.marker} <b>${fullName}</b><br/>Revenue: ${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${params.percent}%)`;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#1e293b' }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 5,
      left: 'center',
      textStyle: { fontSize: isMobileView ? 9 : 11, color: 'var(--cosmic-text)' },
      itemWidth: isMobileView ? 8 : 10,
      itemHeight: isMobileView ? 8 : 10
    },
    series: [
      {
        type: 'pie',
        radius: isMobileView ? ['35%', '55%'] : ['40%', '60%'],
        center: ['50%', '42%'],
        data: donutData,
        itemStyle: {
          borderRadius: 4,
          borderColor: 'var(--cosmic-card)',
          borderWidth: 2
        },
        label: { show: false },
        labelLine: { show: false }
      }
    ]
  };

  const categoryRevenueDonutOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.marker} <b>${params.name}</b><br/>Revenue: ${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${params.percent}%)`;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#1e293b' }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 5,
      left: 'center',
      itemWidth: isMobileView ? 10 : 12,
      itemHeight: isMobileView ? 10 : 12,
      textStyle: { color: 'var(--cosmic-text)', fontSize: isMobileView ? 9 : 11 }
    },
    series: [
      {
        type: 'pie',
        radius: isMobileView ? ['35%', '55%'] : ['40%', '60%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'var(--cosmic-card)',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: (params) => {
            return `${params.name}\n${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          },
          fontSize: isMobileView ? 9 : 11,
          color: 'var(--cosmic-text)',
          fontWeight: '500'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 15,
          smooth: true
        },
        data: [
          { value: kpiData.western, name: 'Western NL', itemStyle: { color: '#06b6d4' } },
          { value: kpiData.india, name: 'India NL', itemStyle: { color: '#f97316' } },
          { value: kpiData.targeted, name: 'Targetted NL', itemStyle: { color: '#8b5cf6' } }
        ].filter(item => item.value > 0)
      }
    ]
  };

  const [breakupSummary, setBreakupSummary] = useState([]);

  const [typesCompared, setTypesCompared] = useState([]);
  const heatMapOption = {
    tooltip: { trigger: 'item' },
    geo: {
      map: 'world',
      roam: true,
      itemStyle: {
        areaColor: '#1e293b',
        borderColor: '#334155'
      },
      emphasis: {
        itemStyle: {
          areaColor: '#334155'
        },
        label: { show: false }
      }
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        symbolSize: function (data) {
          return Math.sqrt(data[2]) * 1.5;
        },
        itemStyle: { color: '#f472b6', opacity: 0.7, borderColor: '#be185d' },
        data: [
          [-100, 40, 800], [-80, 35, 2000], [-120, 30, 200], [-90, 20, 100],
          [10, 50, 400], [20, 45, 100], [0, 40, 250], [80, 20, 1000], [140, -25, 400],
          [130, -30, 150]
        ]
      }
    ]
  };

  const categoryWiseStatOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['NLW', 'OML', 'NLI'], axisLabel: { color: 'var(--cosmic-text)' } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--cosmic-text)' }, splitLine: { lineStyle: { color: 'var(--cosmic-border)' } } },
    series: [
      { name: 'Net Revenue In USD', type: 'bar', data: [kpiData.western, kpiData.targeted, kpiData.india], itemStyle: { color: '#00bcd4' }, label: { show: true, position: 'top', color: 'var(--cosmic-text)', formatter: '${c}' } }
    ]
  };

  const combinedYearlyChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: isMobileView ? '15%' : '10%', right: '5%', bottom: '15%', top: '15%' },
    legend: {
      data: ['Current Year', 'Previous Year'],
      textStyle: { color: 'var(--cosmic-text)' },
      top: 0
    },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisLabel: { color: 'var(--cosmic-text)' },
      axisLine: { lineStyle: { color: 'var(--cosmic-border)' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: 'var(--cosmic-text)',
        formatter: (value) => value >= 1000 ? `${value / 1000}k` : `${value}`
      },
      splitLine: { lineStyle: { color: '#334155' } }
    },
    series: [
      {
        name: 'Current Year',
        type: 'bar',
        data: Array.from({ length: 12 }, (_, i) => {
          const match = currentYearSummaryData.find(item => item.monthNum === i + 1);
          return match ? match.revenue : null;
        }),
        itemStyle: { color: '#f97316' }, // Orange to match header
        label: {
          show: true,
          position: 'top',
          color: '#f97316',
          formatter: (params) => params.value ? (params.value >= 1000 ? (params.value / 1000).toFixed(1) + 'k' : params.value) : '',
          fontSize: isMobileView ? 8 : 10
        },
        barGap: '10%'
      },
      {
        name: 'Previous Year',
        type: 'bar',
        data: Array.from({ length: 12 }, (_, i) => {
          const match = previousYearSummaryData.find(item => item.monthNum === i + 1);
          return match ? match.revenue : null;
        }),
        itemStyle: { color: '#6868f9' }, // Purple to match header
        label: {
          show: true,
          position: 'top',
          color: '#6868f9',
          formatter: (params) => params.value ? (params.value >= 1000 ? (params.value / 1000).toFixed(1) + 'k' : params.value) : '',
          fontSize: isMobileView ? 8 : 10
        }
      }
    ]
  };

  const dateWisePerformancePage = usePagination(dateWisePerformance || [], 10);
  const overallPerformanceDataPage = usePagination(overallPerformanceData || [], 10);
  const breakupSummaryPage = usePagination(breakupSummary || [], 10);
  const typesComparedPage = usePagination(typesCompared || [], 10);
  const overallEventsDataPage = usePagination(overallEventsData || [], 10);
  const specialEventsDataPage = usePagination(specialEventsData || [], 10);
  const specialEventsPerformanceDataPage = usePagination(specialEventsPerformanceData || [], 10);
  const eventsComparedPage = usePagination(eventsCompared || [], 10);

  return (
    <div className="space-y-6">

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center mb-8">
        <div className="flex-1 min-w-[200px]">
          <MultiSelectDropdown
            options={[
              { value: 'NLW', label: 'NLW' },
              { value: 'NLI', label: 'NLI' },
              { value: 'OML', label: 'OML' }
            ]}
            selected={nlCategory}
            onChange={setNlCategory}
            placeholder="Select NL Category"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <SearchableDropdown
            options={[
              { label: 'All Events', value: 'All' },
              ...Array.from(new Set([...allEvents, ...categorySales.map(c => c.name)])).map(e => ({ label: e, value: e }))
            ]}
            selected={eventName}
            onChange={setEventName}
            placeholder="Select Event Name"
          />
        </div>


      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
          <p className="text-cosmic-muted font-medium animate-pulse">Loading Newsletter Dashboard Data...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {(nlCategory.length === 0 || nlCategory.includes('NLW')) && (
              <div className="bg-cosmic-card border border-cosmic-border rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-cosmic-muted mb-2 text-center">Western NL Revenue (NLW)</span>
                <span className="text-4xl font-normal text-cosmic-text">${kpiData.western.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {(nlCategory.length === 0 || nlCategory.includes('OML')) && (
              <div className="bg-cosmic-card border border-cosmic-border rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-cosmic-muted mb-2 text-center">Targetted NL Revenue (OML)</span>
                <span className="text-4xl font-normal text-cosmic-text">${kpiData.targeted}</span>
              </div>
            )}
            {(nlCategory.length === 0 || nlCategory.includes('NLI')) && (
              <div className="bg-cosmic-card border border-cosmic-border rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-cosmic-muted mb-2 text-center">India NL Revenue (NLI)</span>
                <span className="text-4xl font-normal text-cosmic-text">${kpiData.india.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="bg-cosmic-card border border-cosmic-border rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
              <span className="text-sm font-medium text-cosmic-muted mb-2 text-center">Overall NL Revenue (NLW + NLI + OML)</span>
              <span className="text-4xl font-normal text-cosmic-text">${kpiData.overall.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Tables Section */}
          {/* Category Wise Sales Insights */}

          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden">
            <div className="bg-[#6868f9] p-3 flex justify-between items-center text-white px-4">
              <div className="flex-1"></div>
              <h4 className="font-semibold text-sm mx-auto">Category Wise Sales Insights</h4>
              <div className="flex-1 flex justify-end"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                  <thead className="bg-cosmic-card text-cosmic-text border-b border-cosmic-border sticky top-0 z-20">
                    <tr>
                      <th className="py-3 px-4 font-medium border-b border-cosmic-border">Event Name</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">NetRevenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {categorySalesPage.currentData.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-cosmic-bg transition-colors cursor-pointer ${eventName === item.name ? 'bg-indigo-500/20' : ''}`}
                        onClick={() => setEventName(eventName === item.name ? 'All' : item.name)}
                        title="Click to filter dashboard by this event"
                      >
                        <td className="py-2.5 px-4 font-medium">{item.name}</td>
                        <td className="py-2.5 px-4 text-right">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-cosmic-card text-cosmic-text font-bold border-t-2 border-cosmic-border sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <tr>
                      <td className="py-3 px-4">Grand total</td>
                      <td className="py-3 px-4 text-right">${kpiData.overall.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <Pagination {...categorySalesPage} />
          </div>
          {/* Date Wise Newsletter Performance */}
          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden">
            <div className="bg-[#f97316] p-3 flex justify-between items-center text-white px-4">
              <div className="flex-1"></div>
              <h4 className="font-semibold text-sm mx-auto">Date Wise Newsletter Performance</h4>
              <div className="flex-1 flex justify-end"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                  <thead className="bg-cosmic-card text-cosmic-text border-b border-cosmic-border sticky top-0 z-20">
                    <tr>
                      <th className="py-3 px-4 font-medium border-b border-cosmic-border text-left">News Letter Sent Date</th>
                      <th className="py-3 px-4 font-medium border-b border-cosmic-border text-left">NewsLetter Name</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">Net Revenue In USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {dateWisePerformancePage.currentData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cosmic-bg transition-colors">
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <span className="text-cosmic-muted font-medium w-6 text-right">{((dateWisePerformancePage.currentPage - 1) * 10) + idx + 1}.</span>
                            <span>{item.date}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">{item.name}</td>
                        <td className="py-2.5 px-4 text-right">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination {...dateWisePerformancePage} />
          </div>

          {/* Over All NewsLetter Statistics Summary */}
          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-gray-500 p-3 flex justify-between items-center text-white px-4">
              <div className="flex-1"></div>
              <h4 className="font-semibold text-sm mx-auto">Over All NewsLetter Statistics Summary</h4>
              <div className="flex-1 flex justify-end"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                  <thead className="bg-cosmic-card text-cosmic-text border-b border-cosmic-border sticky top-0 z-20">
                    <tr>
                      <th className="py-3 px-3 font-medium w-8 text-center border-b border-cosmic-border"></th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border">NL Sent Date</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border">NewsLetter Name</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border">Subject</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-center">Type</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Sent</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Unsubscribe</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Open</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Open Rate (%)</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Clicks</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Click/Open</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {overallPerformanceDataPage.currentData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cosmic-bg transition-colors">
                        <td className="py-2.5 px-3 text-cosmic-muted text-center">{((overallPerformanceDataPage.currentPage - 1) * 10) + idx + 1}.</td>
                        <td className="py-2.5 px-3">{item.date}</td>
                        <td className="py-2.5 px-3">{item.name}</td>
                        <td className="py-2.5 px-3 truncate max-w-[200px]">{item.subject}</td>
                        <td className="py-2.5 px-3 text-center">{item.type}</td>
                        <td className="py-2.5 px-3 text-right">{item.sent.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">{item.unsub}</td>
                        <td className="py-2.5 px-3 text-right">{item.open.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${item.openRate > 25 ? 'bg-orange-500/20 text-orange-500' : item.openRate > 20 ? 'bg-orange-400/20 text-orange-400' : 'bg-orange-300/20 text-orange-300'}`}>
                            {item.openRate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">{item.clicks}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${item.clickOpen > 5 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-cosmic-bg text-cosmic-text'}`}>
                            {item.clickOpen}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination {...overallPerformanceDataPage} />
          </div>




          {/* Event Wise Newsletter Conversion Bar Chart */}
          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-transparent border-b border-cosmic-border p-3 flex justify-between items-center text-cosmic-text px-4">
              <h4 className="font-semibold text-sm mx-auto">Event Wise Newsletter Conversion</h4>
            </div>
            <div className="p-4 h-[350px]">
              <EChartWrapper
                option={eventConversionChartOption}
                onEvents={{
                  click: (params) => {
                    const match = categorySalesPage.currentData.find(c => c.name.startsWith(params.name.replace('...', '')));
                    const fullName = match ? match.name : params.name;
                    setEventName(prev => prev === fullName ? 'All' : fullName);
                    setTimeout(() => document.getElementById('breakup-summary')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }
                }}
              />
            </div>
            <div className="px-4 pb-4">
              <Pagination {...categorySalesPage} />
            </div>
          </div>

          {/* Event Wise and Category Wise Revenue Summary Donut Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden">
              <div className="bg-[#f97316] p-3 flex justify-between items-center text-white px-4">
                <h4 className="font-semibold text-sm mx-auto">Event Wise Revenue Summary</h4>
              </div>
              <div className="p-4 h-[350px] sm:h-[400px]">
                <EChartWrapper
                  option={eventRevenueDonutOption}
                  onEvents={{
                    click: (params) => {
                      const fullName = params.data?.fullName || params.name;
                      setEventName(prev => prev === fullName ? 'All' : fullName);
                      setTimeout(() => document.getElementById('breakup-summary')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden">
              <div className="bg-[#6868f9] p-3 flex justify-between items-center text-white px-4">
                <h4 className="font-semibold text-sm mx-auto">Category Wise Revenue Summary</h4>
              </div>
              <div className="p-4 h-[350px] sm:h-[400px]">
                <EChartWrapper
                  option={categoryRevenueDonutOption}
                  onEvents={{
                    click: (params) => {
                      let type = 'NLW';
                      if (params.name === 'India NL') type = 'NLI';
                      if (params.name === 'Targetted NL') type = 'OML';
                      handleCategoryClick(type);
                      setTimeout(() => document.getElementById('breakup-summary')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Breakup Summary of Overall Newsletters */}
          <div id="breakup-summary" className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-gray-500 p-3 flex justify-between items-center text-white px-4">
              <div className="flex-1"></div>
              <h4 className="font-semibold text-sm mx-auto">Breakup Summary of Overall Newsletters</h4>
              <div className="flex-1 flex justify-end"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                  <thead className="bg-cosmic-card text-cosmic-text border-b border-cosmic-border sticky top-0 z-20">
                    <tr>
                      <th className="py-3 px-3 font-medium w-8 text-center border-b border-cosmic-border"></th>
                      <th className="py-3 px-4 font-medium border-b border-cosmic-border">NewsLetter Type</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">NewsLetter Count</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">Net Revenue IN ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {breakupSummaryPage.currentData.map((item, idx) => {
                      const isSelected = nlCategory.length === 1 && nlCategory[0].value === item.type;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-cosmic-bg transition-colors cursor-pointer ${isSelected ? 'bg-indigo-500/20' : ''}`}
                          onClick={() => handleCategoryClick(item.type)}
                          title="Click to filter dashboard by this newsletter category"
                        >
                          <td className="py-2.5 px-3 text-cosmic-muted text-center">{((breakupSummaryPage.currentPage - 1) * 10) + idx + 1}.</td>
                          <td className="py-2.5 px-4 font-medium">{item.type}</td>
                          <td className="py-2.5 px-4 text-right font-medium">{item.count}</td>
                          <td className="py-2.5 px-4 text-right font-medium">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-cosmic-card text-cosmic-text font-bold border-t-2 border-cosmic-border sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <tr>
                      <td colSpan={2} className="py-4 px-4 text-left">Grand total</td>
                      <td className="py-4 px-4 text-right">{breakupSummary.reduce((acc, curr) => acc + curr.count, 0)}</td>
                      <td className="py-4 px-4 text-right">${breakupSummary.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <Pagination {...breakupSummaryPage} />
          </div>

          {/* Types Of NewsLetter Compared With Last Month */}
          <div id="types-compared-summary" className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-[#0284c7] p-3 flex justify-between items-center text-white px-4">
              <div className="flex-1"></div>
              <h4 className="font-semibold text-sm mx-auto">Types Of NewsLetter Compared With Last Month</h4>
              <div className="flex-1 flex justify-end"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                  <thead className="bg-cosmic-card text-cosmic-text border-b border-cosmic-border sticky top-0 z-20">
                    <tr>
                      <th className="py-3 px-3 font-medium w-8 text-center border-b border-cosmic-border"></th>
                      <th className="py-3 px-4 font-medium border-b border-cosmic-border">News Letter Type</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">News Letter Count</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">% Change</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">Net Revenue In USD</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">% Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {typesComparedPage.currentData.map((item, idx) => {
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-cosmic-bg transition-colors ${idx % 2 === 1 ? 'bg-black/5' : ''}`}
                        >
                          <td className="py-2.5 px-3 text-cosmic-muted text-center">{((typesComparedPage.currentPage - 1) * 10) + idx + 1}.</td>
                          <td className="py-2.5 px-4 font-medium">{item.type}</td>
                          <td className="py-2.5 px-4 text-right font-medium">{item.count}</td>
                          <td className="py-2.5 px-4 text-right font-medium">
                            {item.countPct !== null && item.countPct !== undefined && item.prevCount > 0 ? (
                              <span className={item.countPct >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {Math.abs(item.countPct).toFixed(1)}% {item.countPct >= 0 ? '↑' : '↓'}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-4 text-right font-medium">
                            {item.revPct !== null && item.revPct !== undefined && item.prevRevenue > 0 ? (
                              <span className={item.revPct >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {Math.abs(item.revPct).toFixed(1)}% {item.revPct >= 0 ? '↑' : '↓'}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-cosmic-card text-cosmic-text font-bold border-t-2 border-cosmic-border sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <tr>
                      <td colSpan={2} className="py-4 px-4 text-left">Grand total</td>
                      <td className="py-4 px-4 text-right">{typesCompared.reduce((acc, curr) => acc + curr.count, 0)}</td>
                      <td className="py-4 px-4 text-right">
                        {(() => {
                          const totalCount = typesCompared.reduce((acc, curr) => acc + curr.count, 0);
                          const totalPrevCount = typesCompared.reduce((acc, curr) => acc + curr.prevCount, 0);
                          if (totalPrevCount === 0) return '-';
                          const pct = ((totalCount - totalPrevCount) / totalPrevCount) * 100;
                          return <span className={pct >= 0 ? 'text-green-500' : 'text-red-500'}>{Math.abs(pct).toFixed(1)}% {pct >= 0 ? '↑' : '↓'}</span>;
                        })()}
                      </td>
                      <td className="py-4 px-4 text-right">${typesCompared.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 px-4 text-right">
                        {(() => {
                          const totalRev = typesCompared.reduce((acc, curr) => acc + curr.revenue, 0);
                          const totalPrevRev = typesCompared.reduce((acc, curr) => acc + curr.prevRevenue, 0);
                          if (totalPrevRev === 0) return '-';
                          const pct = ((totalRev - totalPrevRev) / totalPrevRev) * 100;
                          return <span className={pct >= 0 ? 'text-green-500' : 'text-red-500'}>{Math.abs(pct).toFixed(1)}% {pct >= 0 ? '↑' : '↓'}</span>;
                        })()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <Pagination {...typesComparedPage} />
          </div>

          {/* Overall Newsletters Performance */}
          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-[#f97316] p-3 flex justify-between items-center text-white px-4">
              <div className="flex-1"></div>
              <h4 className="font-semibold text-sm mx-auto">Overall Newsletters Performance</h4>
              <div className="flex-1 flex justify-end"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                  <thead className="bg-cosmic-card text-cosmic-text border-b border-cosmic-border sticky top-0 z-20">
                    <tr>
                      <th className="py-3 px-4 font-medium border-b border-cosmic-border">Event Name</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">NLW</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">NLI</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">OML</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {overallEventsDataPage.currentData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cosmic-bg transition-colors">
                        <td className="py-2.5 px-4">{item.name}</td>
                        <td className="py-2.5 px-4 text-right">${item.nlw.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-4 text-right">${item.nli.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-4 text-right">${item.oml.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-cosmic-card text-cosmic-text font-bold border-t-2 border-cosmic-border sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <tr>
                      <td className="py-3 px-4">Grand total</td>
                      <td className="py-3 px-4 text-right">${overallEventsData.reduce((acc, curr) => acc + curr.nlw, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right">${overallEventsData.reduce((acc, curr) => acc + curr.nli, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right">${overallEventsData.reduce((acc, curr) => acc + curr.oml, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <Pagination {...overallEventsDataPage} />
          </div>

          {/* Special Events Newsletters Performance */}
          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-[#6868f9] p-3 flex justify-between items-center text-white px-4">
              <div className="flex-1"></div>
              <h4 className="font-semibold text-sm mx-auto">Special Events Newsletters Performance</h4>
              <div className="flex-1 flex justify-end"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                  <thead className="bg-cosmic-card text-cosmic-text border-b border-cosmic-border sticky top-0 z-20">
                    <tr>
                      <th className="py-3 px-4 font-medium border-b border-cosmic-border">Event Name</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">NLW</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">NLI</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">OML</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {specialEventsDataPage.currentData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cosmic-bg transition-colors">
                        <td className="py-2.5 px-4">{item.name}</td>
                        <td className="py-2.5 px-4 text-right">${item.nlw.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-4 text-right">${item.nli.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-4 text-right">${item.oml.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-cosmic-card text-cosmic-text font-bold border-t-2 border-cosmic-border sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <tr>
                      <td className="py-3 px-4">Grand total</td>
                      <td className="py-3 px-4 text-right">${specialEventsData.reduce((acc, curr) => acc + curr.nlw, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right">${specialEventsData.reduce((acc, curr) => acc + curr.nli, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right">${specialEventsData.reduce((acc, curr) => acc + curr.oml, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <Pagination {...specialEventsDataPage} />
          </div>

          {/* Special Events NewsLetter Statistics Summary */}
          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-gray-500 p-3 flex justify-between items-center text-white px-4">
              <div className="flex-1"></div>
              <h4 className="font-semibold text-sm mx-auto">Special Events NewsLetter Statistics Summary</h4>
              <div className="flex-1 flex justify-end"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                  <thead className="bg-cosmic-card text-cosmic-text border-b border-cosmic-border sticky top-0 z-20">
                    <tr>
                      <th className="py-3 px-3 font-medium w-8 text-center border-b border-cosmic-border"></th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border">NL Sent Date</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border">NewsLetter Name</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border">Subject</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-center">Type</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Sent</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Unsubscribe</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Open</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Open Rate (%)</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Clicks</th>
                      <th className="py-3 px-3 font-medium border-b border-cosmic-border text-right">Click/Open</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {specialEventsPerformanceDataPage.currentData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cosmic-bg transition-colors">
                        <td className="py-2.5 px-3 text-cosmic-muted text-center">{((specialEventsPerformanceDataPage.currentPage - 1) * 10) + idx + 1}.</td>
                        <td className="py-2.5 px-3">{item.date}</td>
                        <td className="py-2.5 px-3">{item.name}</td>
                        <td className="py-2.5 px-3 truncate max-w-[200px]">{item.subject}</td>
                        <td className="py-2.5 px-3 text-center">{item.type}</td>
                        <td className="py-2.5 px-3 text-right">{item.sent.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">{item.unsub}</td>
                        <td className="py-2.5 px-3 text-right">{item.open.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${item.openRate > 25 ? 'bg-orange-500/20 text-orange-500' : item.openRate > 20 ? 'bg-orange-400/20 text-orange-400' : 'bg-orange-300/20 text-orange-300'}`}>
                            {item.openRate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">{item.clicks}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${item.clickOpen > 5 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-cosmic-bg text-cosmic-text'}`}>
                            {item.clickOpen}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination {...specialEventsPerformanceDataPage} />
          </div>

          {/* NewsLetter Statistics Based On Category Wise */}
          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-[#f97316] p-3 flex justify-between items-center text-white px-4">
              <h4 className="font-semibold text-sm mx-auto">NewsLetter Statistics Based On Category Wise</h4>
            </div>
            <div className="p-4 h-[350px]">
              <EChartWrapper option={categoryWiseStatOption} />
            </div>
          </div>

          {/* Over All NewsLetter Statistics Summary (Current vs Previous Year) */}
          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#f97316] to-[#6868f9] p-3 flex justify-between items-center text-white px-4">
              <h4 className="font-semibold text-sm mx-auto">Over All NewsLetter Statistics Summary (Current vs Previous Year)</h4>
            </div>
            <div className="p-8 h-[450px]">
              <EChartWrapper option={combinedYearlyChartOption} />
            </div>
          </div>

          {/* Events Compared With Previous Period */}
          <div className="bg-cosmic-card border border-cosmic-border shadow-sm flex flex-col rounded-xl overflow-hidden mb-8">
            <div className="bg-gray-500 p-3 flex justify-between items-center text-white px-4">
              <div className="flex-1"></div>
              <h4 className="font-semibold text-sm mx-auto">Events Compared With Previous Period</h4>
              <div className="flex-1 flex justify-end"></div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse relative whitespace-nowrap">
                  <thead className="bg-cosmic-card text-cosmic-text border-b border-cosmic-border sticky top-0 z-20">
                    <tr>
                      <th className="py-3 px-3 font-medium w-8 text-center border-b border-cosmic-border"></th>
                      <th className="py-3 px-4 font-medium border-b border-cosmic-border">Event Name</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">Prev Count</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">Current Count</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">% Change</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">Prev Revenue ($)</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">Current Revenue ($)</th>
                      <th className="py-3 px-4 font-medium text-right border-b border-cosmic-border">% Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmic-border text-cosmic-text bg-cosmic-card">
                    {eventsComparedPage.currentData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cosmic-bg transition-colors">
                        <td className="py-2.5 px-3 text-cosmic-muted text-center">{((eventsComparedPage.currentPage - 1) * 10) + idx + 1}.</td>
                        <td className="py-2.5 px-4">{item.type}</td>
                        <td className="py-2.5 px-4 text-right text-cosmic-muted">{item.prevCount || 0}</td>
                        <td className="py-2.5 px-4 text-right font-medium">{item.count}</td>
                        <td className="py-2.5 px-4 text-right">
                          {item.countPct !== null ? (
                            <span className={`flex items-center justify-end ${item.countPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {Math.abs(item.countPct).toFixed(1)}%
                              {item.countPct >= 0 ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right text-cosmic-muted">${(item.prevRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-4 text-right font-medium">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-4 text-right">
                          {item.revPct !== null ? (
                            <span className={`flex items-center justify-end ${item.revPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {Math.abs(item.revPct).toFixed(1)}%
                              {item.revPct >= 0 ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination {...eventsComparedPage} />
          </div>

          {/* Export Reports Component */}
          <div className="mt-8">
            <ExportReportsCard
              data={{
                newsletterKpiCards: [
                  { title: 'Western Newsletter (NLW)', value: `${kpiData.western?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`, change: 'NLW Revenue' },
                  { title: 'Targeted Mailers (OML)', value: `${kpiData.targeted?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`, change: 'OML Revenue' },
                  { title: 'India Newsletter (NLI)', value: `${kpiData.india?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`, change: 'NLI Revenue' },
                  { title: 'Overall Newsletter Sales', value: `${kpiData.overall?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`, change: 'Total Revenue' }
                ],
                categorySales,
                dateWisePerformance,
                overallPerformanceData,
                breakupSummary,
                typesCompared,
                overallEventsData,
                specialEventsData,
                specialEventsPerformanceData
              }}
              defaultPeriod="Monthly"
              pageTitle="Newsletter Reports"
              showPeriodTabs={false}
            />
          </div>
        </>
      )}

    </div>
  );
};

export default Newsletter;
