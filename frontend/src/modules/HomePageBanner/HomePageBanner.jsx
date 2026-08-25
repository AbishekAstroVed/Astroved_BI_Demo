import React, { useState, useEffect } from 'react';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { BarChart3, TrendingUp, Users, DollarSign, Search, Loader2 } from 'lucide-react';

const HomePageBanner = ({ showRevenue = true }) => {
  const { startDate, endDate } = useDateFilter();
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

  // Simulate an API call reacting to the calendar change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      // TODO: Fetch real data from backend here
      setFilteredData([]);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [startDate, endDate, searchQuery]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4 w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6868f9]"></div>
          <p className="text-cosmic-muted font-medium animate-pulse">Loading Banner Sales Data</p>
        </div>
      ) : (
        <>
          {/* Search Bar Above Table */}
          <div className="flex justify-end mb-4">
            <div className="relative w-full sm:w-64 md:w-80 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cosmic-muted" />
              <input
                type="text"
                placeholder="Global Search (Traffic Code, Product)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-cosmic-card border border-cosmic-border text-xs sm:text-sm text-cosmic-text pl-9 pr-4 py-2 sm:py-2.5 rounded-full focus:outline-none focus:border-[#6868f9] focus:ring-2 focus:ring-[#6868f9]/20 placeholder-cosmic-muted w-full transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="bg-cosmic-card border border-cosmic-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#6868f9] p-3 flex justify-center items-center text-white border-b border-cosmic-border px-4">
              <h4 className="font-semibold text-sm text-center">Banner Clicks Sales Report for {dateRangeLabel}</h4>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse relative min-w-[1000px]">
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
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-cosmic-bg transition-colors">
                      <td className="py-2 px-3 text-cosmic-muted border-r border-cosmic-border/30">{row.code}</td>
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
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan="14" className="py-8 text-center text-cosmic-muted">No data available for this date range.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePageBanner;
