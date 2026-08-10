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

const TargetManagementTab = ({ crud }) => {
  // 4. STATE - TARGET MANAGEMENT
  // ----------------------------------------------------
  const [targetMetrics, setTargetMetrics] = useState([]);
  const [newTarget, setNewTarget] = useState({ name: '', type: 'Monthly', value: '', dept: 'All', country: 'All', product: 'All' });
  const [editingTargetId, setEditingTargetId] = useState(null);
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);

  const loadTargets = async () => {
    try {
      const data = await api.getTargets();
      setTargetMetrics(data);
    } catch (err) {
      console.error('Failed to load targets:', err);
    }
  };

  const handleAddTarget = async (e) => {
    e.preventDefault();
    if (editingTargetId) {
      if (crud.edit === false) {
        toast.error('Access Denied: Your role does not have Edit permissions.');
        return;
      }
    } else {
      if (crud.create === false) {
        toast.error('Access Denied: Your role does not have Create permissions.');
        return;
      }
    }
    if (!newTarget.name || !newTarget.value) return;
    try {
      if (editingTargetId) {
        await api.updateTarget(editingTargetId, newTarget);
        toast.success('Target updated successfully');
        setEditingTargetId(null);
      } else {
        await api.createTarget(newTarget);
        toast.success('Target created successfully');
      }
      loadTargets();

      await api.createAuditLog({
        user: 'Super Admin',
        action: editingTargetId
          ? `Updated target: ${newTarget.name} (${newTarget.value})`
          : `Created target: ${newTarget.name} (${newTarget.value})`,
        module: 'Target Management',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });

      setNewTarget({ name: '', type: 'Monthly', value: '', dept: 'All', country: 'All', product: 'All' });
      setSpecificDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      toast.error(editingTargetId ? 'Failed to update target' : 'Failed to add target');
    }
  };

  const handleDeleteTarget = async (id, name) => {
    if (crud.delete === false) {
      toast.error('Access Denied: Your role does not have Delete permissions.');
      return;
    }
    confirmToast(`Are you sure you want to permanently delete target "${name}"?`, {
      title: 'Delete Target Confirmation',
      confirmText: 'Yes, Delete Target',
      onConfirm: async () => {
        try {
          await api.deleteTarget(id);
          toast.success(`Target "${name}" deleted successfully`);
          loadTargets();

          await api.createAuditLog({
            user: 'Super Admin',
            action: `Permanently deleted target: ${name} (ID: ${id})`,
            module: 'Target Management',
            ip: '127.0.0.1',
            browser: navigator.userAgent
          });
        } catch (err) {
          toast.error('Failed to delete target');
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
            <div className="space-y-4">
              <div className="pb-3 border-b border-cosmic-border/50">
                <h3 className="text-sm font-extrabold text-cosmic-text">Target Settings Matrix</h3>
                <p className="text-[10px] text-cosmic-muted mt-0.5">Configure targets for Revenue, Sales, Marketing, SEO, and Customers across custom segments.</p>
              </div>

              {/* Add target form */}
              <form onSubmit={handleAddTarget} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-3 bg-cosmic-bg border border-cosmic-border rounded-xl">
                <div>
                  <label className="text-[9px] font-bold text-cosmic-muted uppercase block mb-1">Target Name</label>
                  <input
                    type="text"
                    placeholder="Revenue Target"
                    value={newTarget.name}
                    onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                    className="w-full bg-cosmic-card border border-cosmic-border text-xs text-cosmic-text px-3 py-1.5 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-cosmic-muted uppercase block mb-1">Frequency</label>
                  <select
                    value={newTarget.type.startsWith('Specific Date') ? 'Specific Date' : newTarget.type}
                    onChange={(e) => {
                      if (e.target.value === 'Specific Date') {
                        setNewTarget({ ...newTarget, type: `Specific Date: ${specificDate}` });
                      } else {
                        setNewTarget({ ...newTarget, type: e.target.value });
                      }
                    }}
                    className="w-full bg-cosmic-card border border-cosmic-border text-xs text-cosmic-text px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Half-Yearly</option>
                    <option>Yearly</option>
                    <option>Specific Date</option>
                  </select>
                  {newTarget.type.startsWith('Specific Date') && (
                    <input
                      type="date"
                      value={specificDate}
                      onChange={(e) => {
                        setSpecificDate(e.target.value);
                        setNewTarget({ ...newTarget, type: `Specific Date: ${e.target.value}` });
                      }}
                      className="w-full mt-1.5 bg-cosmic-card border border-cosmic-border text-xs text-cosmic-text px-2 py-1 rounded-lg focus:outline-none font-mono"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[9px] font-bold text-cosmic-muted uppercase block mb-1">Target Value</label>
                  <input
                    type="text"
                    placeholder="₹5,00,00,000"
                    value={newTarget.value}
                    onChange={(e) => setNewTarget({ ...newTarget, value: e.target.value })}
                    className="w-full bg-cosmic-card border border-cosmic-border text-xs text-cosmic-text px-3 py-1.5 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-cosmic-muted uppercase block mb-1">Department</label>
                  <select
                    value={newTarget.dept}
                    onChange={(e) => setNewTarget({ ...newTarget, dept: e.target.value })}
                    className="w-full bg-cosmic-card border border-cosmic-border text-xs text-cosmic-text px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option>All</option>
                    <option>Sales</option>
                    <option>Marketing</option>
                    <option>SEO</option>
                    <option>Customer</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-cosmic-muted uppercase block mb-1">Country</label>
                  <select
                    value={newTarget.country}
                    onChange={(e) => setNewTarget({ ...newTarget, country: e.target.value })}
                    className="w-full bg-cosmic-card border border-cosmic-border text-xs text-cosmic-text px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option>All</option>
                    <option>India</option>
                    <option>USA</option>
                    <option>Global</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-cosmic-muted uppercase block mb-1">Product Target</label>
                  <select
                    value={newTarget.product}
                    onChange={(e) => setNewTarget({ ...newTarget, product: e.target.value })}
                    className="w-full bg-cosmic-card border border-cosmic-border text-xs text-cosmic-text px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option>All</option>
                    <option>Puja Services</option>
                    <option>Gemstones</option>
                    <option>Consultation</option>
                    <option>Products</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] block mb-1">&nbsp;</label>
                  <div className="flex space-x-1">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-transform active:scale-95 flex items-center justify-center space-x-1"
                    >
                      {editingTargetId ? <Save size={12} /> : <Plus size={12} />}
                      <span>{editingTargetId ? 'Save' : 'Add'}</span>
                    </button>
                    {editingTargetId && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewTarget({ name: '', type: 'Monthly', value: '', dept: 'All', country: 'All', product: 'All' });
                          setEditingTargetId(null);
                        }}
                        className="py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-transform active:scale-95"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Targets List */}
              <div className="overflow-x-auto">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-cosmic-border text-cosmic-muted font-bold text-[10px] uppercase">
                        <th className="py-2 px-2">Target Metric</th>
                        <th className="py-2 px-2">Frequency</th>
                        <th className="py-2 px-2 text-right">Target Value</th>
                        <th className="py-2 px-2">Department</th>
                        <th className="py-2 px-2">Country Scope</th>
                        <th className="py-2 px-2">Product Target</th>
                        <th className="py-2 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cosmic-border/30 text-[11px] text-cosmic-text font-medium">
                      {targetMetrics.map((t) => (
                        <tr key={t.id} className="hover:bg-cosmic-card-hover/40 transition-colors">
                          <td className="py-2.5 px-2 font-bold text-cosmic-text">{t.name}</td>
                          <td className="py-2.5 px-2">{t.type}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-emerald-500">{t.value}</td>
                          <td className="py-2.5 px-2 font-mono text-cosmic-muted">{t.dept}</td>
                          <td className="py-2.5 px-2 font-semibold text-indigo-400">{t.country}</td>
                          <td className="py-2.5 px-2 text-cosmic-muted">{t.product}</td>
                          <td className="py-2.5 px-2 text-right">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => {
                                  const isSpecific = t.type.startsWith('Specific Date:');
                                  if (isSpecific) {
                                    const dateVal = t.type.split(': ')[1] || new Date().toISOString().split('T')[0];
                                    setSpecificDate(dateVal);
                                  }
                                  setNewTarget({ name: t.name, type: t.type, value: t.value, dept: t.dept, country: t.country, product: t.product });
                                  setEditingTargetId(t.id);
                                }}
                                title="Edit Target"
                                className="p-1 rounded bg-cosmic-bg hover:bg-cosmic-card-hover border border-cosmic-border text-indigo-500"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteTarget(t.id, t.name)}
                                title="Delete Target"
                                className="p-1 rounded bg-cosmic-bg hover:bg-cosmic-card-hover border border-cosmic-border text-rose-500 hover:text-rose-400"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
  );
};

export default TargetManagementTab;
