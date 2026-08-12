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

const KPIManagementTab = ({ crud }) => {
  // 3. STATE - KPI MANAGEMENT
  // ----------------------------------------------------
  const [kpis, setKpis] = useState([]);
  const [showAddKPIModal, setShowAddKPIModal] = useState(false);
  const [newKpi, setNewKpi] = useState({ name: '', category: 'Executive', formula: '', order: 1, color: '#6366f1', target: '', warning: '', critical: '' });

  const loadKPIs = async () => {
    try {
      const data = await api.getKPIs();
      setKpis(data);
    } catch (err) {
      console.error('Failed to load KPIs:', err);
    }
  };

  const handleAddKPI = async (e) => {
    e.preventDefault();
    if (crud.create === false) {
      toast.error('Access Denied: Your role does not have Create permissions.');
      return;
    }
    if (!newKpi.name) return;
    try {
      await api.createKPI(newKpi);
      toast.success('KPI added successfully');
      loadKPIs();

      await api.createAuditLog({
        user: 'Super Admin',
        action: `Created KPI metric: ${newKpi.name}`,
        module: 'KPI Management',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });

      setNewKpi({ name: '', category: 'Executive', formula: '', order: 1, color: '#6366f1', target: '', warning: '', critical: '' });
      setShowAddKPIModal(false);
    } catch (err) {
      toast.error('Failed to add KPI');
    }
  };

  const handleDeleteKPI = async (id, name) => {
    if (crud.delete === false) {
      toast.error('Access Denied: Your role does not have Delete permissions.');
      return;
    }
    confirmToast(`Are you sure you want to permanently delete KPI metric "${name}"?`, {
      title: 'Delete KPI Confirmation',
      confirmText: 'Yes, Delete KPI',
      onConfirm: async () => {
        try {
          await api.deleteKPI(id);
          toast.success(`KPI "${name}" deleted successfully`);
          loadKPIs();

          await api.createAuditLog({
            user: 'Super Admin',
            action: `Permanently deleted KPI metric: ${name} (ID: ${id})`,
            module: 'KPI Management',
            ip: '127.0.0.1',
            browser: navigator.userAgent
          });
        } catch (err) {
          toast.error('Failed to delete KPI');
        }
      }
    });
  };

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
    <div className="space-y-6">

              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[#6868F9] shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                    <BarChart2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">KPI & Formula Library Management</h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Define core business metric formulas, display ordering configurations, and warning thresholds.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddKPIModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#6868F9] hover:bg-[#5858e8] text-white font-bold text-[13px] flex items-center space-x-2 transition-colors shadow-md shadow-indigo-500/20 shrink-0"
                >
                  <Plus size={16} />
                  <span>Add KPI</span>
                </button>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {kpis.map(k => (
                  <div key={k.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] p-6 shadow-sm flex flex-col hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all">

                    {/* Top Row: Category, Order, Trash */}
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-[#6868F9] border border-indigo-100 dark:border-indigo-500/20 tracking-wider">
                        {k.category}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Order: <strong className="text-slate-800 dark:text-slate-200 font-bold">{k.order}</strong></span>
                        <button
                          onClick={() => handleDeleteKPI(k.id, k.name)}
                          className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-100 dark:border-rose-500/20 transition-colors"
                          title="Delete KPI"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Middle Section: Title & Formula */}
                    <h4 className="text-[18px] font-bold text-slate-900 dark:text-white mb-3">{k.name}</h4>
                    <div className="w-full bg-[#f8f9fc] dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl px-4 py-3 font-mono text-[13px] text-[#6868F9] dark:text-indigo-400 break-all mb-6">
                      {k.formula}
                    </div>

                    {/* Bottom Metrics Section */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                      {/* Target */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">Target</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[14px] font-bold text-emerald-500">{k.target}</span>
                          <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <TrendingUp size={14} />
                          </div>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="flex flex-col items-center justify-center text-center border-l border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">Warning</span>
                        <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-[14px]">
                          {k.warning || <Minus size={14} />}
                        </div>
                      </div>

                      {/* Critical */}
                      <div className="flex flex-col items-center justify-center text-center border-l border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">Critical</span>
                        <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold text-[14px]">
                          {k.critical || <AlertCircle size={14} />}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {showAddKPIModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Add New KPI</h4>
                      <button
                        onClick={() => setShowAddKPIModal(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleAddKPI} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Name</label>
                        <input
                          type="text"
                          required
                          value={newKpi.name}
                          onChange={e => setNewKpi({...newKpi, name: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Category</label>
                        <select
                          value={newKpi.category}
                          onChange={e => setNewKpi({...newKpi, category: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Executive">Executive</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operations">Operations</option>
                          <option value="Newsletter">Newsletter</option>
                          <option value="SEO">SEO</option>
                          <option value="Customer">Customer</option>
                          <option value="Funnel">Funnel</option>
                          <option value="AI">AI</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Formula</label>
                        <input
                          type="text"
                          value={newKpi.formula}
                          onChange={e => setNewKpi({...newKpi, formula: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-[#6868F9] px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                          placeholder="e.g., SUM(Sales) / SUM(Target)"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Order</label>
                          <input
                            type="number"
                            value={newKpi.order}
                            onChange={e => setNewKpi({...newKpi, order: parseInt(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target</label>
                          <input
                            type="text"
                            value={newKpi.target}
                            onChange={e => setNewKpi({...newKpi, target: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                            placeholder="e.g., 50M, 90%"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowAddKPIModal(false)}
                          className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#6868F9] hover:bg-[#5858e8] text-white text-sm font-bold rounded-lg transition-colors shadow-md"
                        >
                          Save KPI
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
  );
};

export default KPIManagementTab;
