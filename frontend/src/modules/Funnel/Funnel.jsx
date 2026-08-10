import React from 'react';
import EChartWrapper from '../../charts/EChartWrapper';
import { getFunnelData } from '../../services/mockData';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { Filter, Users } from 'lucide-react';

const Funnel = () => {
  const { startDate, endDate } = useDateFilter();
  const funnelData = getFunnelData(startDate, endDate);

  // ECharts Funnel configuration
  const funnelOption = {
    title: {
      text: 'Visual Conversion Funnel',
      textStyle: { fontSize: 14 },
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c} ({d}%)'
    },
    legend: {
      show: false
    },
    series: [
      {
        name: 'Funnel Step',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 20,
        width: '55%',
        min: 0,
        max: funnelData[0].count,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}: {c}',
          textStyle: { fontWeight: 'bold' }
        },
        labelLine: {
          show: true
        },
        itemStyle: {
          borderColor: 'transparent',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 14
          }
        },
        data: funnelData.map((f, idx) => {
          const colors = [
            '#6366f1', // Visitor
            '#4f46e5', // Registration
            '#4338ca', // View
            '#06b6d4', // Cart
            '#0891b2', // Checkout
            '#0e7490', // Payment
            '#10b981'  // Purchase
          ];
          return {
            name: f.step,
            value: f.count,
            itemStyle: { color: colors[idx] }
          };
        })
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Chart */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl lg:col-span-1 flex flex-col justify-center">
          <EChartWrapper option={funnelOption} height="400px" />
        </div>

        {/* Detailed Funnel Table */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl lg:col-span-2 space-y-6">
          <div>
            <h4 className="text-cosmic-text font-semibold text-sm mb-2 flex items-center">
              <Filter size={16} className="text-indigo-400 mr-1.5" />
              Conversion Funnel Metrics & Drop-offs
            </h4>
            <p className="text-xs text-cosmic-muted mb-4">
              Analyzing user drop-offs from entry point to successful pooja service or consultation purchase.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-cosmic-border text-cosmic-muted font-medium">
                    <th className="py-3 pl-4">Funnel Step</th>
                    <th className="py-3 text-right pr-4">Users Volume</th>
                    <th className="py-3 text-right pr-4">Conversion from Previous</th>
                    <th className="py-3 text-right pr-4">Overall Conversion</th>
                    <th className="py-3 text-right">Drop-off Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border/30 text-cosmic-text">
                  {funnelData.map((f, idx) => {
                    const dropOff = idx === 0 ? 0 : 100 - f.pctOfPrev;
                    return (
                      <tr key={idx} className="hover:bg-cosmic-card-hover transition-colors">
                        <td className="py-4 pl-4 font-semibold flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-cosmic-bg border border-cosmic-border flex items-center justify-center text-[10px] text-cosmic-muted">
                            {idx + 1}
                          </span>
                          <span>{f.step}</span>
                        </td>
                        <td className="py-4 text-right font-mono font-semibold pr-4">{f.count.toLocaleString()}</td>
                        <td className="py-4 text-right pr-4">
                          <span className={`font-semibold ${idx === 0 ? 'text-cosmic-muted' : 'text-indigo-400'}`}>
                            {idx === 0 ? '-' : `${f.pctOfPrev}%`}
                          </span>
                        </td>
                        <td className="py-4 text-right text-cyan-400 font-semibold pr-4">{f.pctOfTotal}%</td>
                        <td className="py-4 text-right font-semibold text-cosmic-danger text-rose-500">
                          {idx === 0 ? '-' : `${dropOff.toFixed(0)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="pt-4 border-t border-cosmic-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center space-x-3">
              <Users className="text-indigo-400 shrink-0" size={20} />
              <div>
                <p className="text-[10px] text-cosmic-muted uppercase">Visitor to Registration</p>
                <p className="text-sm font-bold text-cosmic-text">42.0% Conversion</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center space-x-3">
              <Users className="text-emerald-400 shrink-0" size={20} />
              <div>
                <p className="text-[10px] text-cosmic-muted uppercase">Visitor to Purchase</p>
                <p className="text-sm font-bold text-cosmic-text">6.1% Overall Success</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Funnel;
