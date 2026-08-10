import React, { useState } from 'react';
import {
  TrendingUp, ShoppingBag, Megaphone, Search, Users,
  Filter, Activity, Sparkles, User, Calendar,
  Headphones, LogOut,
  ChevronsLeft, ChevronsRight, ChevronRight,
  Newspaper
} from 'lucide-react';

const Sidebar = ({ currentModule, setCurrentModule, collapsed, setCollapsed, mobileOpen, user, permissions, onLogout }) => {
  const mainMenu = [
    { id: 'executive', name: 'Executive Dashboard', icon: TrendingUp },
    { id: 'sales', name: 'Sales Dashboard', icon: ShoppingBag },
    { id: 'marketing', name: 'Marketing Dashboard', icon: Megaphone },
    { id: 'newsletter', name: "Newsletter Performance", icon: Newspaper },
    { id: 'seo', name: 'SEO Dashboard', icon: Search },
    { id: 'customer', name: 'Customer Dashboard', icon: Users },
    { id: 'funnel', name: 'Funnel Dashboard', icon: Filter },
    { id: 'operations', name: 'Operations Dashboard', icon: Activity },
    { id: 'ai-insights', name: 'AI Insights', icon: Sparkles, badge: 'NEW' },
  ];

  const permissionMap = {
    executive: 'executive',
    sales: 'sales',
    marketing: 'marketing',
    newsletter: 'newsletter',
    seo: 'seo',
    customer: 'customer',
    funnel: 'funnel',
    operations: 'operations',
    'ai-insights': 'ai'
  };

  const filteredMainMenu = mainMenu.filter(item => {
    if (!permissions || !permissions.dashboard) return true;
    const permKey = permissionMap[item.id];
    return permissions.dashboard[permKey] !== false;
  });

  const adminPanel = [
    { id: 'user-management', name: 'User Management', icon: User },
    { id: 'report-scheduler', name: 'Report Scheduler', icon: Calendar },
    { id: 'ai-settings', name: 'AI Settings', icon: Sparkles },
  ];

  const adminPanelMap = {
    'user-management': ['users', 'roles'],
    'report-scheduler': ['reports'],
    'ai-settings': ['ai']
  };

  const filteredAdminPanel = adminPanel.filter(item => {
    if (!permissions || !permissions.management) return true;
    const permKeys = adminPanelMap[item.id];
    if (!permKeys) return true;
    return permKeys.some(key => permissions.management[key] !== false);
  });

  const renderNavGroup = (title, items) => (
    <div className="space-y-1 mb-3">
      {!collapsed && (
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-4 block">
          {title}
        </span>
      )}
      <div className={`space-y-0 relative ${collapsed ? 'px-0' : 'pl-2'}`}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentModule(item.id)}
              className={`w-full flex items-center ${collapsed ? 'justify-center py-1.5' : 'justify-between px-3 py-1'} rounded-2xl text-[13px] font-semibold transition-all relative ${isActive
                ? (collapsed ? 'text-[#6868f9]' : 'bg-[#6868f9]/10 dark:bg-[#6868f9]/20 text-[#6868f9]')
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {/* Active Pill Indicator */}
              {isActive && !collapsed && (
                <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#6868f9] rounded-r-full" />
              )}

              <div className={`flex items-center ${collapsed ? '' : 'space-x-3'} truncate`}>
                <div className={`flex items-center justify-center ${collapsed ? 'w-9 h-9 rounded-xl' : 'w-7 h-7 rounded-lg'} ${isActive ? 'bg-[#6868f9] text-white shadow-md shadow-[#6868f9]/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  <Icon size={collapsed ? 16 : 14} strokeWidth={2.5} />
                </div>
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>
              {item.badge && !collapsed && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#6868f9] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className={`bg-white dark:bg-[#0b0c10] border-r border-slate-100 dark:border-slate-800 ${collapsed ? 'lg:w-20' : 'lg:w-[250px]'} w-[250px] h-screen flex flex-col justify-between p-4 z-40 shrink-0 fixed lg:static inset-y-0 left-0 transform lg:transform-none transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>

      <div className="space-y-6 flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
        <div className="flex items-start justify-between w-full shrink-0 pt-2">
          {collapsed ? (
            <div className="flex flex-col items-center justify-center w-full space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <img
                  src="https://cdn.astroved.com/images/images-av/AstroVed-Logo.svg"
                  alt="AstroVed Logo"
                  className="h-6 w-6 object-contain"
                />
              </div>
              <button
                onClick={() => setCollapsed(false)}
                className="hidden lg:flex w-7 h-7 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[#6868f9] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Expand Sidebar"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <img
                  src="https://cdn.astroved.com/images/images-av/AstroVed-Logo.svg"
                  alt="AstroVed Logo"
                  className="h-10 object-contain mb-1"
                />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.15em] uppercase block text-center">
                  Business Intelligence
                </span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="hidden lg:flex w-8 h-8 mt-1 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-[#6868f9] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0 ml-4"
                title="Collapse Sidebar"
              >
                <ChevronsLeft size={16} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        {/* Scrollable Nav Area */}
        <div className="overflow-y-auto flex-1 pr-2 -mr-2 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {renderNavGroup('MAIN MENU', filteredMainMenu)}
          {user && (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'System Admin') && renderNavGroup('ADMIN PANEL', filteredAdminPanel)}
        </div>
      </div>

      {/* Bottom Support Card */}
      <div className="pt-6 shrink-0 space-y-3">
        {!collapsed ? (
          <>
            <a
              href="mailto:support@astroved.com?subject=AstroVed%20BI%20Enterprise%20Support%20Request"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#6868f9]/5 dark:bg-[#6868f9]/10 border border-[#6868f9]/10 dark:border-[#6868f9]/20 cursor-pointer hover:bg-[#6868f9]/10 dark:hover:bg-[#6868f9]/20 transition-colors no-underline group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#6868f9]/10 dark:bg-[#6868f9]/20 flex items-center justify-center text-[#6868f9]">
                  <Headphones size={18} strokeWidth={2.5} />
                </div>
                <div className="leading-tight">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#6868f9] transition-colors">Need Help?</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Contact Support</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#6868f9]" strokeWidth={2.5} />
            </a>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-4 rounded-2xl text-[13px] font-bold border border-rose-100 dark:border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <a
              href="mailto:support@astroved.com?subject=AstroVed%20BI%20Enterprise%20Support%20Request"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#6868f9]/10 dark:bg-[#6868f9]/20 text-[#6868f9] hover:bg-[#6868f9]/20 dark:hover:bg-[#6868f9]/30 transition-colors cursor-pointer"
              title="Contact Support"
            >
              <Headphones size={18} strokeWidth={2.5} />
            </a>
            <button
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-rose-100 dark:border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all duration-200 cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

    </aside>
  );
};

export default Sidebar;
