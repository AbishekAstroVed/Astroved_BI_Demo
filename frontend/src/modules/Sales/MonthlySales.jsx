import React from 'react';
import { Chart } from "react-google-charts";
import EChartWrapper from '../../charts/EChartWrapper';
import { DollarSign, ShoppingBag, TrendingDown, AlertCircle } from 'lucide-react';
import ExportReportsCard from '../../components/ExportReportsCard';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

const MonthlySales = ({
  data,
  showRevenue,
  geoData,
  geoOptions,
  categoryOption,
  countryOption,
  currencyGrowthOption,
  showAllQuarterSpecials,
  setShowAllQuarterSpecials,
  startDate,
  endDate
}) => {
  const monthRevenueCards = data?.salesKpiData?.monthRevenueCards || [];

  const productSales = data?.tablesData?.productSales || [];
  const stateWiseSales = data?.tablesData?.stateWiseSales || [];
  const specialPackageSales = data?.tablesData?.specialPackageSales || [];

  const revSourcePage = usePagination(data?.revenueSource || [], 10);
  const evtSalesPage = usePagination(data?.eventSales || [], 10);
  const prodSalesPage = usePagination(productSales, 10);
  const stateSalesPage = usePagination(stateWiseSales, 10);
  const specPkgSalesPage = usePagination(specialPackageSales, 10);


  const formatHeaderDate = (start, end) => {
    if (!start) return 'This Month';
    // Ensure we handle timezone parsing correctly without shifting the date backwards
    // For ISO dates "YYYY-MM-DD", appending "T00:00:00" ensures local parsing
    const parseDate = (d) => new Date(d.includes('T') ? d : d + 'T00:00:00');
    const formatOpts = { month: 'short', day: 'numeric', year: 'numeric' };
    const s = parseDate(start).toLocaleDateString('en-US', formatOpts);
    if (!end || start === end) return s;
    const e = parseDate(end).toLocaleDateString('en-US', formatOpts);
    return `${s} - ${e}`;
  };
  const dateStr = formatHeaderDate(startDate, endDate);
  const {
    eventSales = [],
    revenueSource = [],
    currencies = [],
    quarterSpecials = [],
    bestSellers = [],
    lowPerformers = [],
    specialsStoreItems = []
  } = data || {};

  const specStorePage = usePagination(specialsStoreItems, 10);

  return (
    <div className="flex flex-col space-y-6 mb-6">
      {/* Banner */}
      <div className="text-cosmic-text text-center font-bold text-base tracking-wide">
        Total Sales Insights {dateStr && <span className="text-sm font-normal ml-2">({dateStr})</span>}
      </div>

      {/* Monthly Revenue Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
          {monthRevenueCards.map((card, index) => (
            <div key={index} className={`bg-cosmic-card border ${index === 3 ? 'border-2' : ''} border-cosmic-border rounded-xl ${index === 3 ? 'shadow-md' : 'shadow-sm'} p-5 flex flex-col items-center justify-center`}>
              <span className={`${index === 3 ? 'text-xs' : 'text-[13px]'} font-medium text-slate-500 dark:text-slate-400 mb-2`}>{card.title}</span>
              <span className={`text-[32px] ${index === 3 ? 'font-medium' : 'font-normal'} tracking-tight text-slate-900 dark:text-white mb-2`}>
                {showRevenue ? card.value : '🔒'}
              </span>
              <span className={`text-[10px] font-medium flex items-center ${card.badgeColor}`}>
                {card.change}
              </span>
            </div>
          ))}
        </div>

        {/* Legend inside the row on the right */}
        <div className="w-full lg:w-48 bg-cosmic-card border border-cosmic-border rounded-xl p-3 flex flex-col justify-center space-y-2 text-[10px] text-cosmic-muted shadow-sm">
          <div className="font-semibold text-cosmic-text mb-1 border-b border-cosmic-border pb-1">Currency Legend</div>
          <div className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-[#f97316]"></span> <span>INR - India, Nepal, Sri Lanka</span></div>
          <div className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> <span>USD - USA & Others</span></div>
          <div className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span> <span>MYR - Malaysia, Philippines, China, Singapore</span></div>
        </div>
      </div>

      {/* Revenue Source as per Event Big Card */}
      <div className="w-full mt-6 mb-6">
        <div className="bg-cosmic-card border border-cosmic-border rounded-xl overflow-hidden flex flex-col">
          <div className="bg-[#f97316] p-3 flex justify-between items-center text-white">
            <h4 className="font-semibold text-sm">Revenue Source as per Event</h4>
          </div>
          <div className="overflow-x-auto flex-1">
            <div className="overflow-auto w-full max-h-[400px]">
              <table className="w-full text-left text-xs border-collapse relative">
                <thead className="bg-[#6868f9] text-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-2 px-3 font-medium w-8">#</th>
                    <th className="py-2 px-3 font-medium">Event Name</th>
                    <th className="py-2 px-3 font-medium">Product Name</th>
                    <th className="py-2 px-3 font-medium">Source</th>
                    <th className="py-2 px-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                  {revSourcePage.currentData && revSourcePage.currentData.length > 0 ? (
                    revSourcePage.currentData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cosmic-card-hover transition-colors">
                        <td className="py-2 px-3 text-cosmic-muted">{((revSourcePage.currentPage - 1) * 10) + idx + 1}.</td>
                        <td className="py-2 px-3">{item.eventName || item.name || '-'}</td>
                        <td className="py-2 px-3 text-xs text-cosmic-muted">{item.productName || item.name || '-'}</td>
                        <td className="py-2 px-3 text-cosmic-muted">{item.source}</td>
                        <td className="py-2 px-3 text-right text-cosmic-success">
                          {showRevenue ? `$${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '🔒'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-cosmic-muted text-sm italic">
                        No revenue source data available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination {...revSourcePage} />
          </div>
        </div>
      </div>

      {/* Event Revenue Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Month Total Sales By Event Name */}
        <div className="bg-cosmic-card border border-cosmic-border rounded-xl overflow-hidden flex flex-col">
          <div className="bg-cosmic-bg border-b border-cosmic-border p-3 flex justify-between items-center">
            <h4 className="text-cosmic-text font-semibold text-sm">Total Sales By Event Name</h4>
          </div>
          <div className="overflow-x-auto flex-1">
            <div className="overflow-auto w-full max-h-[320px]">
              <table className="w-full text-left text-xs border-collapse relative">
                <thead className="bg-[#6868f9] text-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-2 px-3 font-medium w-8">#</th>
                    <th className="py-2 px-3 font-medium">Event Name</th>
                    <th className="py-2 px-3 font-medium text-right">Qty</th>
                    <th className="py-2 px-3 font-medium text-right">Revenue ▾</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                  {evtSalesPage.currentData && evtSalesPage.currentData.length > 0 ? (
                    evtSalesPage.currentData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cosmic-card-hover transition-colors">
                        <td className="py-2 px-3 text-cosmic-muted">{((evtSalesPage.currentPage - 1) * 10) + idx + 1}.</td>
                        <td className="py-2 px-3">{item.name}</td>
                        <td className="py-2 px-3 text-right font-mono text-cosmic-muted">{item.qty}</td>
                        <td className="py-2 px-3 text-right text-cosmic-text font-medium">
                          {showRevenue ? `$${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '🔒'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-cosmic-muted text-sm italic">
                        No event sales data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination {...evtSalesPage} />
          </div>
        </div>

        {/* Currency Card */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex flex-col justify-between h-full">
          <div>
            <h4 className="text-cosmic-text font-semibold text-sm mb-4 flex items-center">
              <DollarSign size={16} className="text-cosmic-accent mr-1.5" />
              Currency Share Breakdown
            </h4>
            {showRevenue ? (
              <div className="space-y-4">
                {(currencies || []).map((curr, idx) => {
                  const colors = {
                    'INR Share': 'bg-[#f97316]',
                    'USD Share': 'bg-[#16a34a]',
                    'MYR Share': 'bg-[#eab308]',
                    'Other Currencies': 'bg-gray-400'
                  };
                  const barColor = colors[curr.name] || 'bg-indigo-500';
                  return (
                    <div key={curr.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-cosmic-text">{curr.name}</span>
                        <span className="text-cosmic-muted">{curr.value}%</span>
                      </div>
                      <div className="w-full bg-cosmic-bg h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor}`}
                          style={{ width: `${curr.value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-[10px] text-cosmic-muted font-bold">
                <span>🔒 Currency share restricted</span>
              </div>
            )}
          </div>
          <div className="mt-8">
            <div className="w-full bg-cosmic-card border border-cosmic-border rounded-xl p-3 flex flex-col justify-center space-y-2 text-[10px] text-cosmic-muted shadow-sm">
              <div className="font-semibold text-cosmic-text mb-1 border-b border-cosmic-border pb-1">Currency Legend</div>
              <div className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-[#f97316]"></span> <span>INR - India, Nepal, Sri Lanka</span></div>
              <div className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> <span>USD - USA & Others</span></div>
              <div className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span> <span>MYR - Malaysia, Philippines, China, Singapore</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Revenue Share */}
      <div className="w-full mt-6 mb-6">
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex flex-col shadow-lg ring-1 ring-[#6868f9]/20">
          {showRevenue ? (
            <EChartWrapper option={categoryOption} height="400px" />
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-xs text-cosmic-muted font-bold bg-cosmic-card border border-cosmic-border rounded-xl">
              <span className="mb-1 text-base text-cosmic-accent">🔒 Access Restricted</span>
              <span>Your role profile does not have permission to view event revenue share.</span>
            </div>
          )}
        </div>
      </div>

      {/* Revenue as per Specials Store Items */}
      <div className="w-full mb-6">
        <div className="bg-cosmic-card border border-cosmic-border rounded-xl overflow-hidden flex flex-col h-full">
          <div className="bg-[#f97316] p-3 flex justify-between items-center text-white">
            <h4 className="font-semibold text-sm">Revenue as per Specials Store Items</h4>
          </div>
          <div className="overflow-x-auto flex-1">
            <div className="overflow-auto w-full max-h-[280px]">
              <table className="w-full text-left text-xs border-collapse relative">
                <thead className="bg-[#6868f9] text-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-2 px-3 font-medium w-8">#</th>
                    <th className="py-2 px-3 font-medium">Store Item Name ⓘ ▾</th>
                    <th className="py-2 px-3 font-medium text-right">Qty</th>
                    <th className="py-2 px-3 font-medium text-right">Revenue ⓘ ▾</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                  {specStorePage.currentData && specStorePage.currentData.length > 0 ? (
                    specStorePage.currentData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cosmic-card-hover transition-colors">
                        <td className="py-2 px-3 text-cosmic-muted">{((specStorePage.currentPage - 1) * 10) + idx + 1}.</td>
                        <td className="py-2 px-3">{item.name}</td>
                        <td className="py-2 px-3 text-right">{item.qty}</td>
                        <td className="py-2 px-3 text-right text-cosmic-success">
                          {showRevenue ? `$${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '🔒'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-cosmic-muted text-sm italic">
                        No special store items available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination {...specStorePage} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Revenue by Country */}
        <div className="flex flex-col space-y-6">
          <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
            {showRevenue ? (
              <EChartWrapper option={countryOption} height="280px" />
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-xs text-cosmic-muted font-bold bg-cosmic-card border border-cosmic-border rounded-xl">
                <span className="mb-1 text-base text-cosmic-accent">🔒 Access Restricted</span>
                <span>Your role profile does not have permission to view country revenue.</span>
              </div>
            )}
          </div>
        </div>

        {/* Product performance (Best & Low Performers) and Chart */}
        <div className="flex flex-col space-y-6">
          <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl space-y-6">
            {/* Best Sellers */}
            <div>
              <h4 className="text-cosmic-text font-semibold text-sm mb-3 flex items-center">
                <ShoppingBag size={16} className="text-cosmic-success mr-1.5" />
                Best Selling Products
              </h4>
              <div className="overflow-x-auto">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-cosmic-border text-cosmic-muted font-medium">
                        <th className="py-2 px-3 w-16">Code</th>
                        <th className="py-2 px-3">Product Name</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3 text-right">Units Sold</th>
                        <th className="py-2 px-3 text-right">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                      {bestSellers?.map((prod) => (
                        <tr key={prod.id} className="hover:bg-cosmic-card-hover transition-colors">
                          <td className="py-2.5 px-3 font-mono text-indigo-400">{prod.id}</td>
                          <td className="py-2.5 px-3 font-medium">{prod.name}</td>
                          <td className="py-2.5 px-3 text-cosmic-muted">{prod.category}</td>
                          <td className="py-2.5 px-3 text-right font-medium">{prod.sales}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-cosmic-success">
                            {showRevenue ? `$${prod.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '🔒 Restricted'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Low Performers */}
            <div className="pt-4 border-t border-cosmic-border">
              <h4 className="text-cosmic-text font-semibold text-sm mb-3 flex items-center">
                <TrendingDown size={16} className="text-cosmic-danger mr-1.5" />
                Low Performing Products / Alert List
              </h4>
              <div className="overflow-x-auto">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-cosmic-border text-cosmic-muted font-medium">
                        <th className="py-2 px-3 w-16">Code</th>
                        <th className="py-2 px-3">Product Name</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3 text-right">Units Sold</th>
                        <th className="py-2 px-3 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                      {lowPerformers?.map((prod) => (
                        <tr key={prod.id} className="hover:bg-cosmic-card-hover transition-colors">
                          <td className="py-2.5 px-3 font-mono text-indigo-400">{prod.id}</td>
                          <td className="py-2.5 px-3 font-medium">{prod.name}</td>
                          <td className="py-2.5 px-3 text-cosmic-muted">{prod.category}</td>
                          <td className="py-2.5 px-3 text-right font-medium">{prod.sales}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-cosmic-danger">
                            {showRevenue ? `$${prod.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '🔒 Restricted'}
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
      </div>

      {/* This Month Sales Growth Stats Map */}
      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="bg-cosmic-card border border-cosmic-border rounded-xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#f97316] p-3 flex justify-between items-center text-white">
            <h4 className="font-semibold text-sm">{dateStr} Sales Growth Stats Map</h4>
          </div>
          <div className="flex-1 bg-cosmic-bg flex flex-col relative w-full h-full overflow-hidden">
            <Chart
              chartType="GeoChart"
              width="100%"
              height="100%"
              data={geoData}
              options={geoOptions}
              rootProps={{ 'data-testid': '1' }}
            />
          </div>
        </div>
      </div>

      <div className="bg-cosmic-card border border-cosmic-border rounded-xl overflow-hidden flex flex-col mt-6">
        <div className="bg-[#6868f9] p-3 flex justify-between items-center text-white">
          <h4 className="font-semibold text-sm">Currency Growth (Current vs Previous Period)</h4>
        </div>
        <div className="p-4">
          <EChartWrapper option={currencyGrowthOption} height="400px" />
        </div>
      </div>

      {/* Export Reports Component */}
      <ExportReportsCard data={{ ...data, geoData }} defaultPeriod="Monthly" pageTitle="Monthly Sales" showPeriodTabs={false} />
    </div>
  );
};

export default MonthlySales;
