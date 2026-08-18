import React, { useState, useEffect } from 'react';
import KPICard from '../../components/KPICard';
import EChartWrapper from '../../charts/EChartWrapper';
import { getMarketingData, formatCurrency } from '../../services/mockData';
import { useDateFilter } from '../../contexts/DateFilterContext';
import {
  Award, Megaphone, Target, TrendingUp, Layers, Search, Filter,
  ExternalLink, ShieldCheck, Activity, CheckCircle2, XCircle, ArrowUpRight,
  Sparkles, RefreshCw, Settings, Plus, Play, Pause, Calculator, Key, Eye, EyeOff,
  Video, Image, LayoutGrid, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';

const Marketing = ({ setCurrentModule }) => {
  const { startDate, endDate } = useDateFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'meta' | 'google' | 'campaigns'
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Interactive Sync & Modal States
  const [syncingMeta, setSyncingMeta] = useState(false);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [showMetaConnectModal, setShowMetaConnectModal] = useState(false);
  const [showGoogleConnectModal, setShowGoogleConnectModal] = useState(false);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showRoasCalcModal, setShowRoasCalcModal] = useState(false);

  // Config Form States
  const [metaForm, setMetaForm] = useState({ appId: '', appSecret: '', accessToken: '', adAccountId: '', pixelId: '' });
  const [googleForm, setGoogleForm] = useState({ developerToken: '', customerId: '', clientId: '', clientSecret: '', refreshToken: '' });
  const [showSecrets, setShowSecrets] = useState({});

  // Campaign Launch Form State
  const [newCampaignForm, setNewCampaignForm] = useState({
    platform: 'Meta Ads',
    name: '',
    dailyBudget: 10000,
    creativeType: 'Video Reel',
    network: 'Search'
  });

  // ROAS Forecast Calculator State
  const [calcSpend, setCalcSpend] = useState(100000);
  const [calcCpc, setCalcCpc] = useState(10);
  const [calcConvRate, setCalcConvRate] = useState(4.5);
  const [calcAvgTicket, setCalcAvgTicket] = useState(1200);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.getMarketingDashboard(startDate, endDate);
      setData(result);
    } catch (err) {
      console.error('Failed to load marketing dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const activeData = data || getMarketingData(startDate, endDate);
  const { trafficSplit, revenueBySource, roas, adSpend, metaAdsData, googleAdsData } = activeData;

  const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
  const showRevenue = !userPermissions || !userPermissions.data || userPermissions.data.viewRevenue !== false;
  const showCost = !userPermissions || !userPermissions.data || userPermissions.data.viewCost !== false;

  // Handlers for Meta & Google Sync
  const handleSyncMeta = async () => {
    setSyncingMeta(true);
    try {
      const res = await api.syncMetaAds();
      toast.success(res.message || 'Meta Ads API synced successfully!');
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to sync Meta Ads');
    } finally {
      setSyncingMeta(false);
    }
  };

  const handleSyncGoogle = async () => {
    setSyncingGoogle(true);
    try {
      const res = await api.syncGoogleAds();
      toast.success(res.message || 'Google Ads API synced successfully!');
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to sync Google Ads');
    } finally {
      setSyncingGoogle(false);
    }
  };

  // Handler for Toggling Campaign Status (ACTIVE <-> PAUSED)
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.updateCampaignStatus(id, { status: nextStatus });
      toast.success(`Campaign updated to ${nextStatus}`);
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update campaign status');
    }
  };

  // Handler for Creating New Campaign
  const handleCreateCampaignSubmit = async (e) => {
    e.preventDefault();
    if (!newCampaignForm.name.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }
    try {
      const res = await api.createCampaign(newCampaignForm);
      toast.success(res.message || 'Campaign launched successfully!');
      setShowCreateCampaignModal(false);
      setNewCampaignForm({ platform: 'Meta Ads', name: '', dailyBudget: 10000, creativeType: 'Video Reel', network: 'Search' });
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to launch campaign');
    }
  };

  // Handlers for Credential Save
  const handleSaveMetaKeys = async (e) => {
    e.preventDefault();
    try {
      await api.updateIntegrationConfig('meta-ads', metaForm);
      toast.success('Meta Ads credentials saved successfully!');
      setShowMetaConnectModal(false);
      await fetchData();
    } catch (err) {
      toast.error('Failed to save Meta Ads keys');
    }
  };

  const handleSaveGoogleKeys = async (e) => {
    e.preventDefault();
    try {
      await api.updateIntegrationConfig('google-ads', googleForm);
      toast.success('Google Ads API keys saved successfully!');
      setShowGoogleConnectModal(false);
      await fetchData();
    } catch (err) {
      toast.error('Failed to save Google Ads keys');
    }
  };

  // ECharts Options
  const trafficSplitOption = {
    title: { text: 'Traffic Acquisition Split', textStyle: { fontSize: 14, color: '#94a3b8' } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} visitors ({d}%)' },
    legend: { orient: 'horizontal', bottom: '0', textStyle: { color: '#94a3b8' } },
    series: [
      {
        name: 'Traffic Channels',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        itemStyle: { borderRadius: 8, borderColor: '#0f172a', borderWidth: 2 },
        data: (trafficSplit || []).map((t, idx) => {
          const colors = ['#6366f1', '#4285F4', '#0668E1', '#06b6d4', '#f59e0b'];
          return {
            name: t.name,
            value: t.value,
            itemStyle: { color: colors[idx % colors.length] }
          };
        }),
        label: { show: true, fontSize: 11, formatter: '{b}' }
      }
    ]
  };

  const revenueSourceOption = {
    title: { text: 'Revenue Contribution by Channel', textStyle: { fontSize: 14, color: '#94a3b8' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: (revenueBySource || []).map(r => r.source),
      axisLabel: { rotate: 20, color: '#94a3b8', fontSize: 10 },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (val) => formatCurrency(val), color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    series: [
      {
        name: 'Revenue Contributions ($)',
        type: 'bar',
        barWidth: '40%',
        data: (revenueBySource || []).map(r => r.revenue),
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#4285F4' },
              { offset: 1, color: '#0668E1' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  const metaPlacementOption = {
    title: { text: 'Meta Ad Placements Performance', textStyle: { fontSize: 14, color: '#94a3b8' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: (metaAdsData?.placementBreakdown || []).map(p => p.placement),
      axisLabel: { rotate: 15, color: '#94a3b8', fontSize: 10 }
    },
    yAxis: [
      { type: 'value', name: 'Spend ($)', axisLabel: { formatter: (v) => `${v / 1000}k`, color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
      { type: 'value', name: 'ROAS (x)', axisLabel: { formatter: '{value}x', color: '#10b981' }, splitLine: { show: false } }
    ],
    series: [
      {
        name: 'Ad Spend',
        type: 'bar',
        barWidth: '35%',
        data: (metaAdsData?.placementBreakdown || []).map(p => p.spend),
        itemStyle: { color: '#0668E1', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: 'ROAS',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: (metaAdsData?.placementBreakdown || []).map(p => p.roas),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 }
      }
    ]
  };

  const googleNetworkOption = {
    title: { text: 'Google Ads Network Split', textStyle: { fontSize: 14, color: '#94a3b8' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: (googleAdsData?.networkBreakdown || []).map(n => n.network),
      axisLabel: { rotate: 15, color: '#94a3b8', fontSize: 10 }
    },
    yAxis: [
      { type: 'value', name: 'Spend ($)', axisLabel: { formatter: (v) => `${v / 1000}k`, color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
      { type: 'value', name: 'Conversions', axisLabel: { color: '#f59e0b' }, splitLine: { show: false } }
    ],
    series: [
      {
        name: 'Spend',
        type: 'bar',
        barWidth: '35%',
        data: (googleAdsData?.networkBreakdown || []).map(n => n.spend),
        itemStyle: { color: '#4285F4', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: 'Conversions',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: (googleAdsData?.networkBreakdown || []).map(n => n.conversions),
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 3 }
      }
    ]
  };

  const totalMarketingRevenue = (revenueBySource || []).reduce((acc, curr) => acc + curr.revenue, 0);

  const allCampaigns = [
    ...(metaAdsData?.campaigns || []),
    ...(googleAdsData?.campaigns || [])
  ];

  const filteredCampaigns = allCampaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'ALL' || (platformFilter === 'META' && c.platform.includes('Meta')) || (platformFilter === 'GOOGLE' && c.platform.includes('Google'));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Calculated Forecast Values
  const estClicks = Math.floor(calcSpend / (calcCpc || 1));
  const estConversions = Math.floor(estClicks * (calcConvRate / 100));
  const estRevenue = estConversions * calcAvgTicket;
  const estRoas = (estRevenue / (calcSpend || 1)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Banner: Integrations Sync Status & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cosmic-card border border-cosmic-border p-4 rounded-2xl">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {/* GA4 Badge */}
          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
            <span>GA4: {activeData.gaConnected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {/* Meta Ads Badge */}
          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <span className={`w-2 h-2 rounded-full ${metaAdsData?.connected ? 'bg-blue-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span>Meta Ads: {metaAdsData?.isLiveApi ? 'Live API Active' : metaAdsData?.connected ? 'Connected' : 'Mock Mode'}</span>
          </div>

          {/* Google Ads Badge */}
          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className={`w-2 h-2 rounded-full ${googleAdsData?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span>Google Ads: {googleAdsData?.isLiveApi ? 'Live API Active' : googleAdsData?.connected ? 'Connected' : 'Mock Mode'}</span>
          </div>

          {setCurrentModule && (
            <button
              onClick={() => setCurrentModule('integrations')}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
              title="Configure API Keys in Admin Integrations"
            >
              <Settings size={13} />
              <span>Admin Connector</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRoasCalcModal(true)}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <Calculator size={13} />
            <span>ROAS Forecaster</span>
          </button>

          <button
            onClick={() => setShowCreateCampaignModal(true)}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Plus size={14} />
            <span>Launch Campaign</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-2 flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-cosmic-muted hover:text-cosmic-text bg-cosmic-card/50 border border-cosmic-border/50'
              }`}
          >
            <TrendingUp size={14} />
            <span>Overview & Channels</span>
          </button>

          <button
            onClick={() => setActiveTab('meta')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${activeTab === 'meta'
                ? 'bg-[#0668E1] text-white shadow-lg shadow-[#0668E1]/30'
                : 'text-cosmic-muted hover:text-cosmic-text bg-cosmic-card/50 border border-cosmic-border/50'
              }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 12C12 15.3137 9.31371 18 6 18C2.68629 18 0 15.3137 0 12C0 8.68629 2.68629 6 6 6C9.31371 6 12 8.68629 12 12ZM12 12C12 15.3137 14.6863 18 18 18C21.3137 18 24 15.3137 24 12C24 8.68629 21.3137 6 18 6C14.6863 6 12 8.68629 12 12Z" /></svg>
            <span>Meta Ads Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${activeTab === 'google'
                ? 'bg-[#4285F4] text-white shadow-lg shadow-[#4285F4]/30'
                : 'text-cosmic-muted hover:text-cosmic-text bg-cosmic-card/50 border border-cosmic-border/50'
              }`}
          >
            <Search size={14} />
            <span>Google Ads</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${activeTab === 'campaigns'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-cosmic-muted hover:text-cosmic-text bg-cosmic-card/50 border border-cosmic-border/50'
              }`}
          >
            <Layers size={14} />
            <span>All Campaigns Matrix</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & CHANNELS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KPICard
              title="Combined Ad ROAS"
              value={showCost && showRevenue ? `${roas}x` : '🔒 Restricted'}
              compChange={showCost && showRevenue ? 4.2 : null}
              formatType="text"
            />
            <KPICard
              title="Total Paid Ad Spend"
              value={showCost ? adSpend : '🔒 Restricted'}
              compChange={showCost ? -1.5 : null}
              formatType={showCost ? 'currency' : 'text'}
            />
            <KPICard
              title="Total Marketing Revenue"
              value={showRevenue ? totalMarketingRevenue : '🔒 Restricted'}
              compChange={showRevenue ? 8.6 : null}
              formatType={showRevenue ? 'currency' : 'text'}
            />
            <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 to-transparent blur-xl rounded-full" />
              <div>
                <span className="text-cosmic-muted text-sm font-medium">Efficiency Index</span>
                <h3 className="text-3xl font-extrabold text-cosmic-text mt-2">
                  {showCost && showRevenue ? 'A+' : '🔒'}
                </h3>
                <span className="text-[10px] text-cosmic-success font-semibold mt-1 block">
                  {showCost && showRevenue ? 'Optimal budget deployment' : 'Budget deployment restricted'}
                </span>
              </div>
              <Award size={36} className="text-cosmic-accent opacity-75 shrink-0" />
            </div>
          </div>

          {/* Channel Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Meta Ads Card */}
            <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 12C12 15.3137 9.31371 18 6 18C2.68629 18 0 15.3137 0 12C0 8.68629 2.68629 6 6 6C9.31371 6 12 8.68629 12 12ZM12 12C12 15.3137 14.6863 18 18 18C21.3137 18 24 15.3137 24 12C24 8.68629 21.3137 6 18 6C14.6863 6 12 8.68629 12 12Z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-cosmic-text">Meta Ads Manager</h4>
                    <span className="text-[10px] text-cosmic-muted">Facebook & Instagram Campaigns</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('meta')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-cosmic-border/50 text-center">
                <div>
                  <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Ad Spend</span>
                  <span className="text-sm font-black text-cosmic-text">{showCost ? formatCurrency(metaAdsData?.totalSpend || 0) : '🔒'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Revenue</span>
                  <span className="text-sm font-black text-emerald-400">{showRevenue ? formatCurrency(metaAdsData?.totalRevenue || 0) : '🔒'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">ROAS</span>
                  <span className="text-sm font-black text-blue-400">{showCost && showRevenue ? `${metaAdsData?.roas}x` : '🔒'}</span>
                </div>
              </div>
            </div>

            {/* Google Ads Card */}
            <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Search size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-cosmic-text">Google Ads Network</h4>
                    <span className="text-[10px] text-cosmic-muted">Search, YouTube Video, GDN & PMax</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('google')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-cosmic-border/50 text-center">
                <div>
                  <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Ad Spend</span>
                  <span className="text-sm font-black text-cosmic-text">{showCost ? formatCurrency(googleAdsData?.totalSpend || 0) : '🔒'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Revenue</span>
                  <span className="text-sm font-black text-emerald-400">{showRevenue ? formatCurrency(googleAdsData?.totalRevenue || 0) : '🔒'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">ROAS</span>
                  <span className="text-sm font-black text-indigo-400">{showCost && showRevenue ? `${googleAdsData?.roas}x` : '🔒'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
              <EChartWrapper option={trafficSplitOption} height="320px" />
            </div>
            <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl lg:col-span-2">
              {showRevenue ? (
                <EChartWrapper option={revenueSourceOption} height="320px" />
              ) : (
                <div className="h-[320px] flex flex-col items-center justify-center text-xs text-cosmic-muted font-bold bg-cosmic-card border border-cosmic-border rounded-xl">
                  <span className="mb-1 text-base text-cosmic-accent">🔒 Access Restricted</span>
                  <span>Your role profile does not have permission to view revenue details.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: META ADS MANAGER */}
      {activeTab === 'meta' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Platform Account Banner */}
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-cosmic-card border border-blue-500/20 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0668E1] text-white flex items-center justify-center shadow-lg shadow-[#0668E1]/20 shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 12C12 15.3137 9.31371 18 6 18C2.68629 18 0 15.3137 0 12C0 8.68629 2.68629 6 6 6C9.31371 6 12 8.68629 12 12ZM12 12C12 15.3137 14.6863 18 18 18C21.3137 18 24 15.3137 24 12C24 8.68629 21.3137 6 18 6C14.6863 6 12 8.68629 12 12Z" /></svg>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold text-cosmic-text">{metaAdsData?.accountName}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                    {metaAdsData?.isLiveApi ? 'Live Meta API Active' : metaAdsData?.connected ? 'Connected' : 'Sandbox Mode'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-cosmic-muted mt-1 flex-wrap">
                  <span>Ad Account ID: <code className="text-blue-300">{metaAdsData?.adAccountId}</code></span>
                  <span>Pixel ID: <code className="text-indigo-300">{metaAdsData?.pixelId}</code></span>
                  <span>Last Sync: <span className="text-emerald-400 font-semibold">{metaAdsData?.lastSync}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSyncMeta}
                disabled={syncingMeta}
                className="px-3 py-1.5 text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw size={13} className={syncingMeta ? 'animate-spin' : ''} />
                <span>{syncingMeta ? 'Syncing...' : 'Sync Meta API'}</span>
              </button>

              <button
                onClick={() => {
                  setMetaForm({
                    appId: metaAdsData?.appId || '',
                    appSecret: '',
                    accessToken: '',
                    adAccountId: metaAdsData?.adAccountId || '',
                    pixelId: metaAdsData?.pixelId || ''
                  });
                  setShowMetaConnectModal(true);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-[#0668E1] hover:bg-blue-600 text-white rounded-xl shadow-md transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Key size={13} />
                <span>Configure Keys</span>
              </button>
            </div>
          </div>

          {/* Meta KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-xl">
              <span className="text-[10px] text-cosmic-muted font-bold uppercase block">Meta Ad Spend</span>
              <span className="text-xl font-black text-cosmic-text mt-1 block">{showCost ? formatCurrency(metaAdsData?.totalSpend || 0) : '🔒'}</span>
              <span className="text-[10px] text-cosmic-muted mt-0.5 block">CPM: ${metaAdsData?.cpm}</span>
            </div>

            <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-xl">
              <span className="text-[10px] text-cosmic-muted font-bold uppercase block">Meta Revenue</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">{showRevenue ? formatCurrency(metaAdsData?.totalRevenue || 0) : '🔒'}</span>
              <span className="text-[10px] text-cosmic-muted mt-0.5 block">Conversions: {metaAdsData?.conversions?.toLocaleString()}</span>
            </div>

            <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-xl">
              <span className="text-[10px] text-cosmic-muted font-bold uppercase block">Meta CTR</span>
              <span className="text-xl font-black text-blue-400 mt-1 block">{metaAdsData?.ctr}%</span>
              <span className="text-[10px] text-cosmic-muted mt-0.5 block">Clicks: {metaAdsData?.clicks?.toLocaleString()}</span>
            </div>

            <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-xl">
              <span className="text-[10px] text-cosmic-muted font-bold uppercase block">Avg. CPC</span>
              <span className="text-xl font-black text-indigo-400 mt-1 block">${metaAdsData?.cpc}</span>
              <span className="text-[10px] text-cosmic-muted mt-0.5 block">Impressions: {(metaAdsData?.impressions / 1000000).toFixed(2)}M</span>
            </div>
          </div>

          {/* Placement & Ad Creative Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
              <EChartWrapper option={metaPlacementOption} height="300px" />
            </div>

            <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex flex-col justify-between">
              <h4 className="text-sm font-extrabold text-cosmic-text mb-3 flex items-center justify-between">
                <span>Ad Creative Formats Performance</span>
                <Sparkles size={14} className="text-blue-400" />
              </h4>
              <div className="space-y-2.5 overflow-y-auto max-h-[250px] pr-1">
                {(metaAdsData?.creativeBreakdown || []).map((cr, idx) => (
                  <div key={idx} className="p-3 bg-cosmic-bg/60 border border-cosmic-border rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        {cr.format.includes('Reels') ? <Video size={16} /> : cr.format.includes('Carousel') ? <LayoutGrid size={16} /> : <Image size={16} />}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-cosmic-text">{cr.format}</h5>
                        <span className="text-[10px] text-cosmic-muted">Share of Impression Volume: {cr.share}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-blue-400 block">{cr.ctr}% CTR</span>
                      <span className="text-[10px] text-emerald-400">{cr.conversions?.toLocaleString()} Sales</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Meta Campaigns Table */}
          <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-extrabold text-cosmic-text">Active Meta Campaigns Control</h4>
              <button
                onClick={() => setShowCreateCampaignModal(true)}
                className="text-xs font-bold px-3 py-1.5 bg-[#0668E1] hover:bg-blue-600 text-white rounded-xl shadow-md transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Meta Campaign</span>
              </button>
            </div>

            <div className="space-y-3">
              {(metaAdsData?.campaigns || []).map(c => (
                <div key={c.id} className="p-4 bg-cosmic-bg/60 border border-cosmic-border rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-[200px] flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-xs font-bold text-cosmic-text">{c.name}</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        {c.creativeType || 'Video Reel'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] text-cosmic-muted mt-1">
                      <span>CTR: {c.ctr}%</span>
                      <span>CPC: ${c.cpc}</span>
                      <span>Clicks: {c.clicks?.toLocaleString()}</span>
                      <span>Conversions: {c.conversions}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="text-xs font-extrabold text-emerald-400 block">{c.roas}x ROAS</span>
                      <span className="text-[10px] text-cosmic-muted">{showCost ? formatCurrency(c.spend) : '🔒'}</span>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${c.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                    >
                      {c.status === 'ACTIVE' ? <Pause size={12} /> : <Play size={12} />}
                      <span>{c.status}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE ADS */}
      {activeTab === 'google' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Platform Account Banner */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-blue-950/40 to-cosmic-card border border-indigo-500/20 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4285F4] text-white flex items-center justify-center shadow-lg shadow-[#4285F4]/20 shrink-0">
                <Search size={24} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold text-cosmic-text">{googleAdsData?.accountName}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                    {googleAdsData?.isLiveApi ? 'Live Google API Active' : googleAdsData?.connected ? 'Connected' : 'Sandbox Mode'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-cosmic-muted mt-1 flex-wrap">
                  <span>Customer ID: <code className="text-indigo-300">{googleAdsData?.customerId}</code></span>
                  <span>Developer Token: <code className="text-emerald-300">{googleAdsData?.developerToken}</code></span>
                  <span>Last Sync: <span className="text-emerald-400 font-semibold">{googleAdsData?.lastSync}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSyncGoogle}
                disabled={syncingGoogle}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw size={13} className={syncingGoogle ? 'animate-spin' : ''} />
                <span>{syncingGoogle ? 'Syncing...' : 'Sync Google API'}</span>
              </button>

              <button
                onClick={() => {
                  setGoogleForm({
                    developerToken: '',
                    customerId: googleAdsData?.customerId || '',
                    clientId: '',
                    clientSecret: '',
                    refreshToken: ''
                  });
                  setShowGoogleConnectModal(true);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-[#4285F4] hover:bg-blue-600 text-white rounded-xl shadow-md transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Key size={13} />
                <span>Configure Keys</span>
              </button>
            </div>
          </div>

          {/* Google KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-xl">
              <span className="text-[10px] text-cosmic-muted font-bold uppercase block">Google Ad Spend</span>
              <span className="text-xl font-black text-cosmic-text mt-1 block">{showCost ? formatCurrency(googleAdsData?.totalSpend || 0) : '🔒'}</span>
              <span className="text-[10px] text-cosmic-muted mt-0.5 block">Search & Video PPC</span>
            </div>

            <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-xl">
              <span className="text-[10px] text-cosmic-muted font-bold uppercase block">Google Revenue</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">{showRevenue ? formatCurrency(googleAdsData?.totalRevenue || 0) : '🔒'}</span>
              <span className="text-[10px] text-cosmic-muted mt-0.5 block">Conversions: {googleAdsData?.conversions?.toLocaleString()}</span>
            </div>

            <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-xl">
              <span className="text-[10px] text-cosmic-muted font-bold uppercase block">Google CTR</span>
              <span className="text-xl font-black text-indigo-400 mt-1 block">{googleAdsData?.ctr}%</span>
              <span className="text-[10px] text-cosmic-muted mt-0.5 block">Clicks: {googleAdsData?.clicks?.toLocaleString()}</span>
            </div>

            <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-xl">
              <span className="text-[10px] text-cosmic-muted font-bold uppercase block">Avg. CPC</span>
              <span className="text-xl font-black text-amber-400 mt-1 block">${googleAdsData?.cpc}</span>
              <span className="text-[10px] text-cosmic-muted mt-0.5 block">Impressions: {(googleAdsData?.impressions / 1000000).toFixed(2)}M</span>
            </div>
          </div>

          {/* Google Network & High-Converting Keywords Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
              <EChartWrapper option={googleNetworkOption} height="300px" />
            </div>

            <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex flex-col justify-between">
              <h4 className="text-sm font-extrabold text-cosmic-text mb-3 flex items-center justify-between">
                <span>High-Converting Google Keywords</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  QS Avg: {googleAdsData?.qualityScoreAvg}/10
                </span>
              </h4>
              <div className="space-y-2.5 overflow-y-auto max-h-[250px] pr-1">
                {(googleAdsData?.keywords || []).map((k, idx) => (
                  <div key={idx} className="p-3 bg-cosmic-bg/60 border border-cosmic-border rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="text-xs font-bold text-cosmic-text font-mono">{k.keyword}</h5>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${k.matchType === 'EXACT' ? 'bg-emerald-500/20 text-emerald-400' :
                            k.matchType === 'PHRASE' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/20 text-slate-400'
                          }`}>
                          {k.matchType}
                        </span>
                      </div>
                      <span className="text-[10px] text-cosmic-muted mt-0.5 block">Clicks: {k.clicks?.toLocaleString()} | CPC: ${k.cpc}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-400 block">QS: {k.qualityScore}/10</span>
                      <span className="text-[10px] text-emerald-400">{k.conversions} Sales</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Google Campaigns Table */}
          <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-extrabold text-cosmic-text">Active Google Campaigns Control</h4>
              <button
                onClick={() => setShowCreateCampaignModal(true)}
                className="text-xs font-bold px-3 py-1.5 bg-[#4285F4] hover:bg-blue-600 text-white rounded-xl shadow-md transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Google Campaign</span>
              </button>
            </div>

            <div className="space-y-3">
              {(googleAdsData?.campaigns || []).map(c => (
                <div key={c.id} className="p-4 bg-cosmic-bg/60 border border-cosmic-border rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-[200px] flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-xs font-bold text-cosmic-text">{c.name}</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                        {c.network || 'Search'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] text-cosmic-muted mt-1">
                      <span>CTR: {c.ctr}%</span>
                      <span>CPC: ${c.cpc}</span>
                      <span>Clicks: {c.clicks?.toLocaleString()}</span>
                      <span>Conversions: {c.conversions}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <span className="text-xs font-extrabold text-emerald-400 block">{c.roas}x ROAS</span>
                      <span className="text-[10px] text-cosmic-muted">{showCost ? formatCurrency(c.spend) : '🔒'}</span>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${c.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                    >
                      {c.status === 'ACTIVE' ? <Pause size={12} /> : <Play size={12} />}
                      <span>{c.status}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ALL CAMPAIGNS MATRIX */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls & Filters */}
          <div className="bg-cosmic-card border border-cosmic-border p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-3 text-cosmic-muted" />
                <input
                  type="text"
                  placeholder="Search campaign name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-cosmic-muted font-semibold">Platform:</span>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-1.5 rounded-xl focus:outline-none"
                >
                  <option value="ALL">All Platforms</option>
                  <option value="META">Meta Ads</option>
                  <option value="GOOGLE">Google Ads</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-cosmic-muted font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-1.5 rounded-xl focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="PAUSED">Paused Only</option>
                </select>
              </div>

              <button
                onClick={() => setShowCreateCampaignModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all shadow-md"
              >
                <Plus size={14} />
                <span>New Campaign</span>
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-cosmic-card border border-cosmic-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-cosmic-border bg-cosmic-bg/40 text-cosmic-muted uppercase text-[10px] font-bold tracking-wider">
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Platform</th>
                    <th className="p-4">Status Action</th>
                    <th className="p-4 text-right">Ad Spend</th>
                    <th className="p-4 text-right">Clicks</th>
                    <th className="p-4 text-right">CTR</th>
                    <th className="p-4 text-right">CPC</th>
                    <th className="p-4 text-right">Conversions</th>
                    <th className="p-4 text-right">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border/50 text-cosmic-text font-medium">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-cosmic-muted">
                        No campaigns found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-cosmic-card-hover/50 transition-colors">
                        <td className="p-4 font-bold text-cosmic-text">
                          <span>{c.name}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${c.platform.includes('Meta')
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                            {c.platform}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(c.id, c.status)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer ${c.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                              }`}
                          >
                            {c.status === 'ACTIVE' ? <Pause size={10} /> : <Play size={10} />}
                            <span>{c.status}</span>
                          </button>
                        </td>
                        <td className="p-4 text-right font-mono">
                          {showCost ? formatCurrency(c.spend) : '🔒'}
                        </td>
                        <td className="p-4 text-right font-mono">{c.clicks?.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono">{c.ctr}%</td>
                        <td className="p-4 text-right font-mono">${c.cpc}</td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-400">{c.conversions?.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono">
                          <span className={`px-2 py-0.5 rounded-lg font-black ${c.roas >= 4.5
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : c.roas >= 3.5
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            {showCost && showRevenue ? `${c.roas}x` : '🔒'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: META ADS CONNECT & ACCESS TOKEN */}
      {showMetaConnectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cosmic-card border border-blue-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-cosmic-border/50">
              <div className="flex items-center space-x-2 text-[#0668E1]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 12C12 15.3137 9.31371 18 6 18C2.68629 18 0 15.3137 0 12C0 8.68629 2.68629 6 6 6C9.31371 6 12 8.68629 12 12ZM12 12C12 15.3137 14.6863 18 18 18C21.3137 18 24 15.3137 24 12C24 8.68629 21.3137 6 18 6C14.6863 6 12 8.68629 12 12Z" /></svg>
                <h4 className="text-sm font-extrabold text-cosmic-text">Meta Ads Graph API Connector</h4>
              </div>
              <button onClick={() => setShowMetaConnectModal(false)} className="text-cosmic-muted hover:text-cosmic-text text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveMetaKeys} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Ad Account ID</label>
                <input
                  type="text"
                  value={metaForm.adAccountId}
                  onChange={e => setMetaForm({ ...metaForm, adAccountId: e.target.value })}
                  placeholder="e.g. act_1092837465"
                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Meta Access Token (System User / Long-Lived)</label>
                <div className="relative">
                  <input
                    type={showSecrets['metaToken'] ? 'text' : 'password'}
                    value={metaForm.accessToken}
                    onChange={e => setMetaForm({ ...metaForm, accessToken: e.target.value })}
                    placeholder="EAAXXXXXXX..."
                    className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 pr-9 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(prev => ({ ...prev, metaToken: !prev.metaToken }))}
                    className="absolute right-2.5 top-2.5 text-cosmic-muted hover:text-cosmic-text"
                  >
                    {showSecrets['metaToken'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Pixel ID</label>
                <input
                  type="text"
                  value={metaForm.pixelId}
                  onChange={e => setMetaForm({ ...metaForm, pixelId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-cosmic-border/50 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMetaConnectModal(false)}
                  className="px-3 py-1.5 bg-cosmic-bg text-cosmic-text border border-cosmic-border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0668E1] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save & Connect API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GOOGLE ADS CONNECT */}
      {showGoogleConnectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cosmic-card border border-indigo-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-cosmic-border/50">
              <div className="flex items-center space-x-2 text-[#4285F4]">
                <Search size={20} />
                <h4 className="text-sm font-extrabold text-cosmic-text">Google Ads REST API Connector</h4>
              </div>
              <button onClick={() => setShowGoogleConnectModal(false)} className="text-cosmic-muted hover:text-cosmic-text text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveGoogleKeys} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Customer ID</label>
                <input
                  type="text"
                  value={googleForm.customerId}
                  onChange={e => setGoogleForm({ ...googleForm, customerId: e.target.value })}
                  placeholder="e.g. 123-456-7890"
                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Developer Token</label>
                <div className="relative">
                  <input
                    type={showSecrets['devToken'] ? 'text' : 'password'}
                    value={googleForm.developerToken}
                    onChange={e => setGoogleForm({ ...googleForm, developerToken: e.target.value })}
                    placeholder="Enter Developer Token"
                    className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 pr-9 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(prev => ({ ...prev, devToken: !prev.devToken }))}
                    className="absolute right-2.5 top-2.5 text-cosmic-muted hover:text-cosmic-text"
                  >
                    {showSecrets['devToken'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-cosmic-border/50 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleConnectModal(false)}
                  className="px-3 py-1.5 bg-cosmic-bg text-cosmic-text border border-cosmic-border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#4285F4] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save & Connect API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LAUNCH NEW CAMPAIGN */}
      {showCreateCampaignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cosmic-card border border-emerald-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-cosmic-border/50">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Plus size={20} />
                <h4 className="text-sm font-extrabold text-cosmic-text">Launch New Ad Campaign</h4>
              </div>
              <button onClick={() => setShowCreateCampaignModal(false)} className="text-cosmic-muted hover:text-cosmic-text text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Platform</label>
                <select
                  value={newCampaignForm.platform}
                  onChange={e => setNewCampaignForm({ ...newCampaignForm, platform: e.target.value })}
                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="Meta Ads">Meta Ads (Facebook & IG)</option>
                  <option value="Google Ads">Google Ads (Search & YouTube)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaignForm.name}
                  onChange={e => setNewCampaignForm({ ...newCampaignForm, name: e.target.value })}
                  placeholder="e.g. Diwalipuja Special Offer 2026"
                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Target Daily Budget ($)</label>
                <input
                  type="number"
                  value={newCampaignForm.dailyBudget}
                  onChange={e => setNewCampaignForm({ ...newCampaignForm, dailyBudget: Number(e.target.value) })}
                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {newCampaignForm.platform === 'Meta Ads' ? (
                <div>
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Ad Creative Format</label>
                  <select
                    value={newCampaignForm.creativeType}
                    onChange={e => setNewCampaignForm({ ...newCampaignForm, creativeType: e.target.value })}
                    className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none"
                  >
                    <option value="Video Reel">Instagram Reel & Short Video</option>
                    <option value="Carousel">Product Showcase Carousel</option>
                    <option value="Single Image">Single Image Hero Post</option>
                    <option value="Story Video">IG & FB Stories Ad</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Google Ad Network</label>
                  <select
                    value={newCampaignForm.network}
                    onChange={e => setNewCampaignForm({ ...newCampaignForm, network: e.target.value })}
                    className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none"
                  >
                    <option value="Search">Google Search Network (PPC)</option>
                    <option value="YouTube">YouTube Video Placement</option>
                    <option value="GDN">Google Display Network</option>
                    <option value="PMax">Performance Max (PMax)</option>
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-cosmic-border/50 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCampaignModal(false)}
                  className="px-3 py-1.5 bg-cosmic-bg text-cosmic-text border border-cosmic-border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ROAS & ROI FORECASTER */}
      {showRoasCalcModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cosmic-card border border-emerald-500/30 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-cosmic-border/50">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Calculator size={20} />
                <h4 className="text-sm font-extrabold text-cosmic-text">Marketing ROAS & ROI Forecast Simulator</h4>
              </div>
              <button onClick={() => setShowRoasCalcModal(false)} className="text-cosmic-muted hover:text-cosmic-text text-xs cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Monthly Planned Ad Spend ($)</label>
                  <input
                    type="number"
                    value={calcSpend}
                    onChange={e => setCalcSpend(Number(e.target.value))}
                    className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Target CPC ($)</label>
                  <input
                    type="number"
                    value={calcCpc}
                    onChange={e => setCalcCpc(Number(e.target.value))}
                    className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Expected Conversion Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcConvRate}
                    onChange={e => setCalcConvRate(Number(e.target.value))}
                    className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">Avg Order Value ($)</label>
                  <input
                    type="number"
                    value={calcAvgTicket}
                    onChange={e => setCalcAvgTicket(Number(e.target.value))}
                    className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Forecast Results */}
              <div className="bg-cosmic-bg/80 border border-emerald-500/20 p-4 rounded-xl flex flex-col justify-between space-y-3">
                <h5 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Simulated Forecast</h5>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-cosmic-muted">Est. Ad Clicks:</span>
                    <span className="font-bold text-cosmic-text">{estClicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-cosmic-muted">Est. Orders/Sales:</span>
                    <span className="font-bold text-cosmic-text">{estConversions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-cosmic-muted">Forecasted Revenue:</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(estRevenue)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-cosmic-border/60 text-center">
                  <span className="text-[10px] text-cosmic-muted font-bold uppercase block">Predicted ROAS Multiplier</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">{estRoas}x</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-cosmic-border/50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRoasCalcModal(false)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;
