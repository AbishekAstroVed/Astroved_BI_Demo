import React from 'react';
import KPICard from '../../components/KPICard';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { Activity, Users, FileText, Clock, Monitor, Smartphone, Tablet } from 'lucide-react';

const GoogleAnalytics = () => {
  const { startDate, endDate } = useDateFilter();

  const mockData = {
    kpis: {
      sessions: '124.5K',
      users: '89.2K',
      pageviews: '412.3K',
      bounceRate: '42.8%',
      avgSessionDuration: '00:03:14'
    },
    realtime: {
      activeUsers: 142,
      pageViewsPerMinute: 45,
      topActivePages: [
        { path: '/products/astro-consultation', users: 34 },
        { path: '/', users: 28 },
        { path: '/horoscope/daily', users: 15 }
      ]
    },
    topPages: [
      { path: '/', views: '45.2K', bounce: '32%' },
      { path: '/products', views: '28.1K', bounce: '45%' },
      { path: '/blog/latest-trends', views: '18.4K', bounce: '51%' },
      { path: '/about', views: '12.9K', bounce: '28%' },
      { path: '/contact', views: '8.5K', bounce: '15%' }
    ],
    devices: [
      { name: 'Mobile', value: 65, color: '#4F46E5', icon: Smartphone },
      { name: 'Desktop', value: 28, color: '#10B981', icon: Monitor },
      { name: 'Tablet', value: 7, color: '#F59E0B', icon: Tablet }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="14" width="5" height="8" rx="1" fill="#F9AB00" />
            <rect x="9" y="8" width="5" height="14" rx="1" fill="#E37400" />
            <rect x="16" y="2" width="5" height="20" rx="1" fill="#F9AB00" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-cosmic-text">Google Analytics (GA4) Overview</h2>
      </div>

      {/* Real-time Overview */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute inset-0 opacity-75"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full relative"></div>
            </div>
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Right Now</p>
              <h3 className="text-4xl font-black">{mockData.realtime.activeUsers}</h3>
              <p className="text-indigo-200 text-xs mt-1">Active users on site</p>
            </div>
          </div>
          
          <div className="flex-1 w-full bg-indigo-700/50 rounded-xl p-4 border border-indigo-500/30">
            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-3">Top Active Pages</h4>
            <div className="space-y-2">
              {mockData.realtime.topActivePages.map((page, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="font-semibold truncate pr-4">{page.path}</span>
                  <span className="font-black bg-indigo-500/50 px-2 py-0.5 rounded">{page.users}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <KPICard title="Total Sessions" value={mockData.kpis.sessions} compChange={15.2} formatType="number" />
        <KPICard title="Total Users" value={mockData.kpis.users} compChange={12.4} formatType="number" />
        <KPICard title="Pageviews" value={mockData.kpis.pageviews} compChange={8.7} formatType="number" />
        <KPICard title="Avg Session Duration" value={mockData.kpis.avgSessionDuration} compChange={-2.1} formatType="text" />
        <KPICard title="Bounce Rate" value={mockData.kpis.bounceRate} compChange={-4.5} formatType="percentage" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages Table */}
        <div className="lg:col-span-2 bg-cosmic-card border border-cosmic-border p-6 rounded-2xl">
          <h4 className="text-cosmic-text font-semibold text-sm mb-4 flex items-center">
            <FileText size={16} className="text-indigo-400 mr-1.5" />
            Most Viewed Pages
          </h4>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cosmic-border">
                  <th className="pb-3 text-cosmic-muted font-bold uppercase tracking-wider">Page Path</th>
                  <th className="pb-3 text-cosmic-muted font-bold uppercase tracking-wider text-right">Pageviews</th>
                  <th className="pb-3 text-cosmic-muted font-bold uppercase tracking-wider text-right">Bounce Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cosmic-border">
                {mockData.topPages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-cosmic-bg/50 transition-colors">
                    <td className="py-3 font-semibold text-cosmic-text truncate max-w-[200px]">{page.path}</td>
                    <td className="py-3 font-bold text-cosmic-text text-right">{page.views}</td>
                    <td className="py-3 text-cosmic-muted font-medium text-right">{page.bounce}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Categories */}
        <div className="bg-cosmic-card border border-cosmic-border p-6 rounded-2xl flex flex-col">
          <h4 className="text-cosmic-text font-semibold text-sm mb-6 flex items-center">
            <Activity size={16} className="text-indigo-400 mr-1.5" />
            Sessions by Device
          </h4>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {mockData.devices.map((device, idx) => {
              const Icon = device.icon;
              return (
                <div key={idx} className="flex items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-4" style={{ backgroundColor: `${device.color}15`, color: device.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-cosmic-text">{device.name}</span>
                      <span className="text-sm font-extrabold text-cosmic-text">{device.value}%</span>
                    </div>
                    <div className="w-full bg-cosmic-bg rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${device.value}%`, backgroundColor: device.color }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAnalytics;
