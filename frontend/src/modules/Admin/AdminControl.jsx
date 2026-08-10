import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Sliders, Target, Calendar, Bell, Sparkles,
  Cpu, FileText, Settings, Plus, Trash2, Edit3, Key, Lock, Unlock,
  UserCheck, UserX, Save, Play, Check, Database, RefreshCw, Download, Info,
  Brain, Box, Clock, Thermometer, Folder, CheckCircle, FileSpreadsheet, FileJson,
  Network, Copy, Hash, CreditCard, BarChart2, LineChart, Mail,
  AlertCircle, Minus, TrendingUp
} from 'lucide-react';
import UserManagementTab from './components/UserManagementTab';
import RolesPermissionsTab from './components/RolesPermissionsTab';
import KPIManagementTab from './components/KPIManagementTab';
import TargetManagementTab from './components/TargetManagementTab';
import NotificationManagementTab from './components/NotificationManagementTab';
import IntegrationSettingsTab from './components/IntegrationSettingsTab';
import AuditLogsTab from './components/AuditLogsTab';
import SystemSettingsTab from './components/SystemSettingsTab';

const AdminControl = ({ initialTab = 'users' }) => {
  const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
  const user = JSON.parse(localStorage.getItem('astroved_user') || '{}');
  const isSuperUser = user && (user.role === 'Super Admin' || user.role === 'System Admin');

  const crud = isSuperUser ? { view: true, create: true, edit: true, delete: true, approve: true, publish: true } : (userPermissions?.crud || {});
  const management = isSuperUser ? { users: true, roles: true, kpis: true, targets: true, reports: true, ai: true, notifications: true, integrations: true, apis: true } : (userPermissions?.management || {});

  const managementMap = {
    users: 'users',
    roles: 'roles',
    kpis: 'kpis',
    targets: 'targets',
    notifications: 'notifications',
    ai: 'ai',
    integrations: 'integrations',
    audit: 'apis',
    system: 'apis'
  };

  const rawTabs = [
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'roles', name: 'Roles & Permissions', icon: Shield },
    { id: 'audit', name: 'Audit Logs', icon: FileText },
    { id: 'integrations', name: 'Integration Settings', icon: Cpu },
  ];

  const tabs = rawTabs.filter(t => {
    const user = JSON.parse(localStorage.getItem('astroved_user') || '{}');
    if (user && (user.role === 'Super Admin' || user.role === 'System Admin')) {
      return true;
    }
    if (!userPermissions || !userPermissions.management) return true;
    const permKey = managementMap[t.id];
    return userPermissions.management[permKey] !== false;
  });

  const allowedTabIds = tabs.map(t => t.id);
  const getInitialPermittedTab = () => allowedTabIds.includes(initialTab) ? initialTab : (allowedTabIds[0] || 'users');
  const [activeTab, setActiveTab] = useState(getInitialPermittedTab());

  useEffect(() => {
    if (allowedTabIds.length > 0 && !allowedTabIds.includes(activeTab)) {
      setActiveTab(allowedTabIds[0]);
    }
  }, [activeTab]);

  useEffect(() => {
    setActiveTab(getInitialPermittedTab());
  }, [initialTab]);

  if (userPermissions && userPermissions.crud && userPermissions.crud.view === false) {
    return (
      <div className="p-6 text-center bg-cosmic-card border border-cosmic-border rounded-2xl max-w-md mx-auto mt-10">
        <h3 className="text-sm font-extrabold text-cosmic-text mb-2 flex items-center justify-center space-x-1.5">
          <span>🔒 Access Restricted</span>
        </h3>
        <p className="text-xs text-cosmic-muted">Your role profile does not have View permission to access Admin Control settings.</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'users': return <UserManagementTab crud={crud} />;
      case 'roles': return <RolesPermissionsTab crud={crud} />;
      case 'kpis': return <KPIManagementTab crud={crud} />;
      case 'targets': return <TargetManagementTab crud={crud} />;
      case 'notifications': return <NotificationManagementTab crud={crud} />;
      case 'integrations': return <IntegrationSettingsTab crud={crud} />;
      case 'audit': return <AuditLogsTab crud={crud} />;
      case 'system': return <SystemSettingsTab crud={crud} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-180px)] select-none">
      <div className="w-full lg:w-[300px] shrink-0 flex flex-row lg:flex-col bg-white dark:bg-cosmic-card border border-slate-100 dark:border-cosmic-border lg:rounded-3xl lg:p-4 lg:shadow-sm overflow-x-auto lg:overflow-x-visible gap-0.5 scrollbar-none">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <React.Fragment key={tab.id}>
              {(index === 3 || index === 5 || index === 8) && (
                <div className="hidden lg:block w-full h-[1px] bg-slate-100 dark:bg-cosmic-border/50 my-1"></div>
              )}
              <div className="relative group">
                {isSelected && (
                  <div className="hidden lg:block absolute -left-4 top-1/2 -translate-y-1/2 w-[5px] h-6 bg-[#6868F9] rounded-r-md"></div>
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3.5 w-full p-1.5 pr-4 rounded-full text-[13px] whitespace-nowrap transition-all ${isSelected
                    ? 'bg-[#6868F9]/10 dark:bg-indigo-500/10 text-[#6868F9] dark:text-indigo-400 font-bold'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#6868F9] text-white shadow-sm shadow-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 group-hover:bg-slate-100 dark:group-hover:bg-slate-700'}`}>
                    <Icon size={18} strokeWidth={isSelected ? 2 : 1.75} />
                  </div>
                  <span>{tab.name}</span>
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex-1 min-w-0 pb-10 lg:pb-0">
        <div className="bg-cosmic-card border border-cosmic-border rounded-2xl p-5 shadow-sm min-h-[450px]">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminControl;
