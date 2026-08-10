import React from 'react';
import KPICard from '../../components/KPICard';
import { getSEOData } from '../../services/mockData';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { Search, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';

const SEO = () => {
  const { startDate, endDate } = useDateFilter();
  const seo = getSEOData(startDate, endDate);
  const { kpis, keywords, landingPages, winners, losers } = seo;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Organic Search Clicks"
          value={kpis.clicks}
          compChange={12.4}
          formatType="number"
        />
        <KPICard
          title="Search Impressions"
          value={kpis.impressions}
          compChange={5.8}
          formatType="number"
        />
        <KPICard
          title="Average Click-Through Rate (CTR)"
          value={kpis.ctr}
          compChange={1.2}
          formatType="percentage"
        />
        <KPICard
          title="Average Search Position"
          value={kpis.position}
          compChange={-0.4}
          formatType="text"
        />
      </div>

      {/* Winners & Losers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Winners */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
          <h4 className="text-cosmic-success font-semibold text-sm mb-4 flex items-center">
            <CheckCircle2 size={16} className="mr-1.5" />
            Top Keyword Winners
          </h4>
          <div className="space-y-3">
            {winners.map((win, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-xs font-semibold text-cosmic-text">{win.keyword}</span>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-cosmic-success font-bold flex items-center">
                    <ChevronUp size={14} className="mr-0.5" />
                    {win.change}
                  </span>
                  <span className="text-cosmic-muted font-medium">Pos: <strong className="text-cosmic-text">{win.current}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
          <h4 className="text-cosmic-danger font-semibold text-sm mb-4 flex items-center">
            <AlertTriangle size={16} className="mr-1.5" />
            Top Keyword Losers
          </h4>
          <div className="space-y-3">
            {losers.map((lose, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <span className="text-xs font-semibold text-cosmic-text">{lose.keyword}</span>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-cosmic-danger font-bold flex items-center">
                    <ChevronDown size={14} className="mr-0.5" />
                    {lose.change}
                  </span>
                  <span className="text-cosmic-muted font-medium">Pos: <strong className="text-cosmic-text">{lose.current}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords and Landing Pages Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords Table */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
          <h4 className="text-cosmic-text font-semibold text-sm mb-4 flex items-center">
            <Search size={16} className="text-indigo-400 mr-1.5" />
            Top Search Queries / Keywords
          </h4>
          <div className="overflow-x-auto">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cosmic-border text-cosmic-muted font-medium">
                    <th className="py-2">Keyword</th>
                    <th className="py-2 text-right pr-4">Clicks</th>
                    <th className="py-2 text-right pr-4">Impressions</th>
                    <th className="py-2 text-right pr-4">CTR</th>
                    <th className="py-2 text-right">Avg Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                  {keywords.map((kw, idx) => (
                    <tr key={idx} className="hover:bg-cosmic-card-hover transition-colors">
                      <td className="py-3 font-medium">{kw.word}</td>
                      <td className="py-3 text-right font-semibold pr-4">{kw.clicks.toLocaleString()}</td>
                      <td className="py-3 text-right text-cosmic-muted pr-4">{kw.impressions.toLocaleString()}</td>
                      <td className="py-3 text-right font-medium text-cyan-400 pr-4">{kw.ctr}</td>
                      <td className="py-3 text-right font-mono text-indigo-300">{kw.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Landing Pages Table */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
          <h4 className="text-cosmic-text font-semibold text-sm mb-4 flex items-center">
            <Search size={16} className="text-cyan-400 mr-1.5" />
            Top Landing Pages
          </h4>
          <div className="overflow-x-auto">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cosmic-border text-cosmic-muted font-medium">
                    <th className="py-2">URL Path</th>
                    <th className="py-2 text-right pr-4">Clicks</th>
                    <th className="py-2 text-right">Avg CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                  {landingPages.map((lp, idx) => (
                    <tr key={idx} className="hover:bg-cosmic-card-hover transition-colors">
                      <td className="py-3 font-mono text-cosmic-muted hover:text-indigo-400 cursor-pointer">{lp.page}</td>
                      <td className="py-3 text-right font-semibold pr-4">{lp.clicks.toLocaleString()}</td>
                      <td className="py-3 text-right font-medium text-cyan-400">{lp.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEO;
