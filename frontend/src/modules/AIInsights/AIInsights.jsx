import React, { useState, useEffect } from 'react';
import { getAIInsights } from '../../services/mockData';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import EChartWrapper from '../../charts/EChartWrapper';
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle,
  ArrowRight, Play, Loader2, ShieldAlert, Cpu, BarChart2, PieChart
} from 'lucide-react';

const AIInsights = ({ setCurrentModule }) => {
  const { startDate, endDate } = useDateFilter();
  const [insights, setInsights] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep insights empty on load so user must trigger live analysis
  useEffect(() => {
    setInsights([]);
    setRawData(null);
    setError('');
  }, [startDate, endDate]);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setError('');
    setInsights([]);
    setRawData(null);


    try {
      const data = await api.generateAIInsights(startDate, endDate);
      setInsights(data.insights || data);
      setRawData(data.rawData || null);
      toast.success('Live AI Insights generated successfully!');
    } catch (err) {
      const errMsg = err.message || 'Failed to generate insights';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTask = async (insight) => {
    const runToast = toast.loading(`Executing AI Task ${insight.id}: ${insight.title}...`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await api.createAuditLog({
        user: 'Super Admin',
        action: `Executed AI action task: ${insight.title} (${insight.id})`,
        module: 'AI Engine',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });
      toast.success(`Action successfully executed: Recommendation deployed!`, { id: runToast });
    } catch (err) {
      toast.error('Failed to execute AI task action', { id: runToast });
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <span className="text-sm font-bold text-cosmic-text animate-pulse">Generating  Live AI Insights... Please wait.</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-cosmic-card/45 border border-cosmic-border/50 p-6 rounded-2xl relative overflow-hidden animate-pulse">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-cosmic-border/40 shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-4 bg-cosmic-border/40 rounded w-1/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-cosmic-border/30 rounded w-3/4" />
                  <div className="h-3 bg-cosmic-border/30 rounded w-1/2" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-10 bg-cosmic-border/20 rounded-xl w-full" />
                  <div className="h-10 bg-cosmic-border/20 rounded-xl w-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Chart Configs
  const parseNum = (str) => Number(String(str).replace(/[^0-9.-]+/g, '')) || 0;

  let topProductsOption = {};
  let topProductsVolumeOption = {};
  let newsletterOption = {};
  let orderFulfillmentOption = {};

  if (rawData) {
    const products = rawData.executive?.topProducts || [];
    topProductsOption = {
      tooltip: { trigger: 'axis', backgroundColor: '#1a1f36', borderColor: '#4338ca', textStyle: { color: '#e2e8f0' } },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }, axisLabel: { color: '#94a3b8' } },
      yAxis: { type: 'category', data: products.map(p => p.name).reverse(), axisLabel: { color: '#94a3b8', width: 100, overflow: 'truncate' } },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '5%', containLabel: true },
      series: [{
        name: 'Revenue', type: 'bar',
        data: products.map(p => parseNum(p.revenue)).reverse(),
        itemStyle: { color: '#6366f1', borderRadius: [0, 4, 4, 0] }
      }]
    };

    topProductsVolumeOption = {
      tooltip: { trigger: 'axis', backgroundColor: '#1a1f36', borderColor: '#0ea5e9', textStyle: { color: '#e2e8f0' } },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }, axisLabel: { color: '#94a3b8' } },
      yAxis: { type: 'category', data: products.map(p => p.name).reverse(), axisLabel: { color: '#94a3b8', width: 100, overflow: 'truncate' } },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '5%', containLabel: true },
      series: [{
        name: 'Orders', type: 'bar',
        data: products.map(p => p.orders).reverse(),
        itemStyle: { color: '#0ea5e9', borderRadius: [0, 4, 4, 0] }
      }]
    };

    const nl = rawData.newsletter?.kpi || {};
    const execKpi = rawData.executive?.kpi || {};
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 to-transparent">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="animate-pulse" size={24} />
          </div>
          <div>
            <h3 className="text-cosmic-text font-bold text-lg">AI Problem Solver & Business Insights</h3>
            <p className="text-xs text-cosmic-muted mt-0.5">
              Automatically diagnosing dashboard anomalies and generating actionable strategies to improve metrics and solve bottlenecks.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateInsights}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 cursor-pointer w-full md:w-auto shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              <span>Diagnosing Metrics...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Live Insights</span>
            </>
          )}
        </button>
      </div>

      {/* Error / API Key Missing Warning Banner */}
      {error && (
        <div className="bg-rose-500/5 border border-rose-500/15 p-5 rounded-2xl flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-cosmic-text">OpenAI API Connection Needed</h4>
            <p className="text-xs text-cosmic-muted mt-1.5 leading-relaxed">
              {error}
            </p>
            {error.toLowerCase().includes('api key') && setCurrentModule && (
              <button
                onClick={() => setCurrentModule('ai-settings')}
                className="mt-3 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cosmic-card border border-cosmic-border hover:bg-cosmic-card-hover text-cosmic-text text-[11px] font-bold transition-all cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Go to AI Settings Panel</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Insights Panel */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : insights.length > 0 ? (
        <div className="space-y-6">


          {insights.length > 0 && (
            <div className="space-y-6 mt-8">
              {insights.map((insight, idx) => {
                const isPositive = insight.type === 'positive';
                const isNegative = insight.type === 'negative';

                return (
                  <div key={insight.id || idx} className="bg-cosmic-card border border-cosmic-border p-5 rounded-xl flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : isNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {isPositive ? <TrendingUp size={16} /> : isNegative ? <TrendingDown size={16} /> : <AlertTriangle size={16} />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-cosmic-text font-bold text-lg">{insight.title}</h4>
                            <span className="text-[10px] text-cosmic-muted font-mono bg-cosmic-bg px-2 py-1 rounded">{insight.id}</span>
                            {insight.dashboard && (
                              <span className="text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">{insight.dashboard}</span>
                            )}
                            {isPositive && (
                              <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded tracking-wider">High</span>
                            )}
                            {isNegative && (
                              <span className="text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 px-2 py-1 rounded tracking-wider">Drop</span>
                            )}
                            {!isPositive && !isNegative && (
                              <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 px-2 py-1 rounded tracking-wider">Anomaly</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-xs text-cosmic-muted font-bold uppercase tracking-wider">Observation</span>
                        <p className="text-sm text-cosmic-text/90 mt-1 leading-relaxed">
                          {insight.summary}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-cosmic-muted font-bold uppercase tracking-wider">Diagnosis</span>
                        <p className="text-sm text-cosmic-text/90 mt-1 leading-relaxed">
                          {insight.cause}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-cosmic-border/50">
                      <div>
                        <span className="text-xs text-cosmic-muted font-bold uppercase tracking-wider">What to Improve</span>
                        <ul className="mt-2 space-y-2">
                          {(insight.actions || []).map((action, actionIdx) => (
                            <li key={actionIdx} className="flex items-start space-x-2">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span className="text-sm text-cosmic-text/90">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : !error ? (
        <div className="bg-cosmic-card border-2 border-dashed border-cosmic-border p-12 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-cosmic-bg text-indigo-400 flex items-center justify-center mx-auto border border-cosmic-border">
            <Cpu size={28} className="animate-pulse" />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-lg font-bold text-cosmic-text mb-2">Diagnostic Engine Ready</h4>
            <p className="text-sm text-cosmic-muted">
              Click the <strong className="text-indigo-400">Generate Insights</strong> button above to diagnose issues and compute resolution strategies based on live dashboard data.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AIInsights;
