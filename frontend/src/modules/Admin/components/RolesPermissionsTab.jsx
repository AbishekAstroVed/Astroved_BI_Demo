import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Sliders, Target, Calendar, Bell, Sparkles,
  Cpu, FileText, Settings, Plus, Trash2, Edit3, Key, Lock, Unlock,
  UserCheck, UserX, Save, Play, Check, Database, RefreshCw, Download, Info,
  Brain, Box, Clock, Thermometer, Folder, CheckCircle, FileSpreadsheet, FileJson,
  Network, Copy, Hash, CreditCard, BarChart2, LineChart, Mail,
  AlertCircle, Minus, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { confirmToast, promptToast } from '../../../components/ConfirmToast';
import { api } from '../../../services/api';

const RolesPermissionsTab = ({ crud }) => {
  // 2. STATE - ROLES & PERMISSIONS
  // ----------------------------------------------------
  const availableRoles = ['System Admin', 'Super Admin', 'Admin', 'CEO', 'CFO', 'CTO', 'COO', 'Product Manager', 'Sales Manager', 'Marketing Manager', 'SEO Manager', 'Operations Manager', 'Finance Manager', 'Data Engineer', 'Developer', 'Support Lead', 'HR Manager', 'Analyst', 'Viewer', 'Guest'];
  const [selectedRole, setSelectedRole] = useState('Analyst');
  const [permissions, setPermissions] = useState({
    dashboard: { executive: false, sales: false, marketing: false, newsletter: false, seo: false, customer: false, funnel: false, operations: false, ai: false },
    data: { view: false, export: false, download: false, drillDown: false, viewCost: false, viewRevenue: false, viewProfit: false, viewCustomer: false },
    management: { users: false, roles: false, kpis: false, targets: false, reports: false, ai: false, notifications: false, integrations: false, apis: false },
    crud: { view: false, create: false, edit: false, delete: false, approve: false, publish: false }
  });

  const loadRolePermissions = async () => {
    try {
      const allRoles = await api.getRoles();
      const rolePerm = allRoles.find(r => r.role === selectedRole);
      
      const defaultPermissions = {
        dashboard: { executive: false, sales: false, marketing: false, newsletter: false, seo: false, customer: false, funnel: false, operations: false, ai: false },
        data: { view: false, export: false, download: false, drillDown: false, viewCost: false, viewRevenue: false, viewProfit: false, viewCustomer: false },
        management: { users: false, roles: false, kpis: false, targets: false, reports: false, ai: false, notifications: false, integrations: false, apis: false },
        crud: { view: false, create: false, edit: false, delete: false, approve: false, publish: false }
      };

      if (rolePerm && rolePerm.permissions) {
        setPermissions({
          dashboard: { ...defaultPermissions.dashboard, ...rolePerm.permissions.dashboard },
          data: { ...defaultPermissions.data, ...rolePerm.permissions.data },
          management: { ...defaultPermissions.management, ...rolePerm.permissions.management },
          crud: { ...defaultPermissions.crud, ...rolePerm.permissions.crud }
        });
      } else {
        setPermissions(defaultPermissions);
      }
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  };

  const togglePermission = (category, key) => {
    setPermissions({
      ...permissions,
      [category]: {
        ...permissions[category],
        [key]: !permissions[category][key]
      }
    });
  };

  const handleSavePermissions = async () => {
    if (crud.edit === false) {
      toast.error('Access Denied: Your role does not have Edit permissions.');
      return;
    }
    try {
      await api.updateRole(selectedRole, permissions);
      toast.success(`Saved permissions for ${selectedRole}!`);

      await api.createAuditLog({
        user: 'Super Admin',
        action: `Updated role permissions for ${selectedRole}`,
        module: 'Roles & Permissions',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });
    } catch (err) {
      toast.error('Failed to save permissions');
    }
  };
  // Reload permissions when role selection changes
  useEffect(() => {
    loadRolePermissions();
  }, [selectedRole]);

  // ----------------------------------------------------

  // Auto-load data on mount
  useEffect(() => {
    // Only call load functions if they exist in this component's scope
    const loadFuncs = ['loadUsers', 'loadRolePermissions', 'loadKPIs', 'loadTargets', 'loadNotifications', 'loadIntegrations', 'loadAuditLogs', 'loadSystemConfig'];
    loadFuncs.forEach(func => {
      try {
        if (typeof eval(func) === 'function') {
          eval(func)();
        }
      } catch (e) { /* Ignore ReferenceErrors */ }
    });
  }, []);

  return (
            <div className="space-y-3">

              {/* Header */}
              <div className="flex items-center space-x-4 pb-4 border-b border-cosmic-border/50">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-cosmic-text">Roles & Permissions Configurator</h3>
                  <p className="text-xs text-cosmic-muted mt-1">Map corporate authorization configurations to specific dashboard metrics and actions.</p>
                </div>
              </div>

              {/* Role selection dropdown */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-1">
                <div className="w-full sm:w-64">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cosmic-muted block mb-1.5">Select Role Profile</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                      <Users size={14} />
                    </div>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 appearance-none font-semibold cursor-pointer"
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-cosmic-muted">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-indigo-500 bg-indigo-500/5 border border-indigo-500/20 px-4 py-2.5 rounded-xl flex items-center space-x-2.5 sm:mt-5">
                  <Info size={16} className="shrink-0" />
                  <p>Changes apply globally to all users mapped as <strong className="font-bold">{selectedRole}</strong>.</p>
                </div>
              </div>

              {/* Permissions Checklist Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-0">

                {/* Panel A: Dashboard View Access */}
                <div className="p-4 bg-cosmic-bg border border-cosmic-border rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-cosmic-text uppercase tracking-wider">Dashboard View Access</h4>
                      <p className="text-[10px] text-cosmic-muted mt-0.5">Control which dashboards are visible</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2">
                    {Object.keys(permissions.dashboard).map(key => (
                      <label key={key} className="flex items-center space-x-2.5 cursor-pointer group relative">
                        <input
                          type="checkbox"
                          checked={permissions.dashboard[key]}
                          onChange={() => togglePermission('dashboard', key)}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${permissions.dashboard[key] ? 'bg-indigo-600 border-indigo-600' : 'border-cosmic-border bg-cosmic-card group-hover:border-indigo-400'}`}>
                          {permissions.dashboard[key] && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="capitalize text-xs text-cosmic-text group-hover:text-indigo-400 transition-colors select-none">{key} Dashboard</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Panel B: Management Scope Permissions */}
                <div className="p-4 bg-cosmic-bg border border-cosmic-border rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                      <Shield size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-cosmic-text uppercase tracking-wider">Management Scope Permissions</h4>
                      <p className="text-[10px] text-cosmic-muted mt-0.5">Define management access across modules</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2">
                    {Object.keys(permissions.management).map(key => (
                      <label key={key} className="flex items-center space-x-2.5 cursor-pointer group relative">
                        <input
                          type="checkbox"
                          checked={permissions.management[key]}
                          onChange={() => togglePermission('management', key)}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${permissions.management[key] ? 'bg-indigo-600 border-indigo-600' : 'border-cosmic-border bg-cosmic-card group-hover:border-indigo-400'}`}>
                          {permissions.management[key] && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="capitalize text-xs text-cosmic-text group-hover:text-indigo-400 transition-colors select-none">Manage {key}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Panel C: Data Actions Permissions */}
                <div className="p-4 bg-cosmic-bg border border-cosmic-border rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                      <Database size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-cosmic-text uppercase tracking-wider">Data Actions Permissions</h4>
                      <p className="text-[10px] text-cosmic-muted mt-0.5">Configure data-level actions</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2">
                    {Object.keys(permissions.data).map(key => (
                      <label key={key} className="flex items-center space-x-2.5 cursor-pointer group relative">
                        <input
                          type="checkbox"
                          checked={permissions.data[key]}
                          onChange={() => togglePermission('data', key)}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${permissions.data[key] ? 'bg-indigo-600 border-indigo-600' : 'border-cosmic-border bg-cosmic-card group-hover:border-indigo-400'}`}>
                          {permissions.data[key] && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="capitalize text-xs text-cosmic-text group-hover:text-indigo-400 transition-colors select-none">{key.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Panel D: General CRUD Settings */}
                <div className="p-4 bg-cosmic-bg border border-cosmic-border rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                      <Settings size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-cosmic-text uppercase tracking-wider">General CRUD Settings</h4>
                      <p className="text-[10px] text-cosmic-muted mt-0.5">Manage general system permissions</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2">
                    {Object.keys(permissions.crud).map(key => (
                      <label key={key} className="flex items-center space-x-2.5 cursor-pointer group relative">
                        <input
                          type="checkbox"
                          checked={permissions.crud[key]}
                          onChange={() => togglePermission('crud', key)}
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${permissions.crud[key] ? 'bg-indigo-600 border-indigo-600' : 'border-cosmic-border bg-cosmic-card group-hover:border-indigo-400'}`}>
                          {permissions.crud[key] && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="capitalize text-xs text-cosmic-text group-hover:text-indigo-400 transition-colors select-none">{key}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSavePermissions}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Save size={16} />
                  <span>Save Role Permissions</span>
                </button>
              </div>
            </div>
  );
};

export default RolesPermissionsTab;
