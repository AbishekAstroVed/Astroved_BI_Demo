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

const NotificationManagementTab = ({ crud }) => {
  // 6. STATE - NOTIFICATIONS
  // ----------------------------------------------------
  const [notifSettings, setNotifSettings] = useState({
    emailNotif: true,
    dashboardAlerts: true,
    slackWebhook: '',
    teamsWebhook: '',
    rules: { revenueAlerts: true, kpiAlerts: true, failedPaymentAlerts: true, aiInsightAlerts: false }
  });

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (data) setNotifSettings(data);
    } catch (err) {
      console.error('Failed to load notifications settings:', err);
    }
  };

  const handleSaveNotifications = async () => {
    if (crud.edit === false) {
      toast.error('Access Denied: Your role does not have Edit permissions.');
      return;
    }
    try {
      await api.updateNotifications(notifSettings);
      toast.success('Saved Notification Settings!');

      await api.createAuditLog({
        user: 'Super Admin',
        action: 'Updated Webhooks and Alerts Rules',
        module: 'Notification Management',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });
    } catch (err) {
      toast.error('Failed to save notification settings');
    }
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
              <div className="flex flex-col md:flex-row items-start space-y-3 md:space-y-0 md:space-x-4 pb-4 border-b border-cosmic-border/50">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                  <Bell size={24} strokeWidth={2} className="text-[#6868F9]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Notification Channels & Webhooks</h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Toggle notification rules for revenue milestones, KPI alerts, and payment gateways failures.</p>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Card: Chat Ops Integrations */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] p-5 lg:p-6 shadow-sm flex flex-col space-y-6">
                  {/* Card Header */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-[#6868F9]">
                      <Network size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white">Chat Ops Integrations</h4>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">Configure webhook endpoints for team communication tools.</p>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-5 flex-1">
                    {/* Slack Webhook */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-2">Slack Webhook URL</label>
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all bg-white dark:bg-slate-900">
                        <div className="pl-3 py-2.5 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
                          <Hash size={18} className="text-green-500 dark:text-green-400" />
                          <div className="w-[3px] h-[3px] rounded-full bg-red-500 -ml-[1px] mt-2"></div>
                          <div className="w-[3px] h-[3px] rounded-full bg-blue-500 ml-[1px] -mt-2"></div>
                        </div>
                        <input
                          type="text"
                          value={notifSettings.slackWebhook || ''}
                          onChange={(e) => setNotifSettings({ ...notifSettings, slackWebhook: e.target.value })}
                          placeholder="https://hooks.slack.com/services/..."
                          className="flex-1 min-w-0 bg-transparent text-[13px] font-medium text-slate-700 dark:text-slate-300 px-3 py-2.5 focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            const text = notifSettings.slackWebhook;
                            if(text) {
                              if (navigator.clipboard && window.isSecureContext) {
                                navigator.clipboard.writeText(text);
                                toast.success('Slack webhook URL copied!');
                              } else {
                                const textArea = document.createElement("textarea");
                                textArea.value = text;
                                document.body.appendChild(textArea);
                                textArea.select();
                                try {
                                  document.execCommand('copy');
                                  toast.success('Slack webhook URL copied!');
                                } catch (err) {
                                  toast.error('Failed to copy');
                                }
                                document.body.removeChild(textArea);
                              }
                            }
                          }}
                          className="pr-3 pl-2 py-2.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors shrink-0 cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Teams Webhook */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-2">Microsoft Teams Webhook URL</label>
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all bg-white dark:bg-slate-900">
                        <div className="pl-3 py-2.5 flex items-center justify-center text-[#6868F9] shrink-0">
                          <Users size={18} />
                        </div>
                        <input
                          type="text"
                          value={notifSettings.teamsWebhook || ''}
                          onChange={(e) => setNotifSettings({ ...notifSettings, teamsWebhook: e.target.value })}
                          placeholder="https://outlook.office.com/webhook/..."
                          className="flex-1 min-w-0 bg-transparent text-[13px] font-medium text-slate-700 dark:text-slate-300 px-3 py-2.5 focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            const text = notifSettings.teamsWebhook;
                            if(text) {
                              if (navigator.clipboard && window.isSecureContext) {
                                navigator.clipboard.writeText(text);
                                toast.success('Teams webhook URL copied!');
                              } else {
                                const textArea = document.createElement("textarea");
                                textArea.value = text;
                                document.body.appendChild(textArea);
                                textArea.select();
                                try {
                                  document.execCommand('copy');
                                  toast.success('Teams webhook URL copied!');
                                } catch (err) {
                                  toast.error('Failed to copy');
                                }
                                document.body.removeChild(textArea);
                              }
                            }
                          }}
                          className="pr-3 pl-2 py-2.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors shrink-0 cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Alert Triggering Rules */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] p-5 lg:p-6 shadow-sm flex flex-col space-y-6">
                  {/* Card Header */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-[#6868F9]">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white">Alert Triggering Rules</h4>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">Select the types of alerts you want to receive.</p>
                    </div>
                  </div>

                  {/* Rules List */}
                  <div className="flex-1 space-y-3">
                    {[
                      { key: 'revenueAlerts', label: 'Revenue Alerts', icon: BarChart2 },
                      { key: 'kpiAlerts', label: 'KPI Alerts', icon: LineChart },
                      { key: 'failedPaymentAlerts', label: 'Failed Payment Alerts', icon: CreditCard },
                      { key: 'aiInsightAlerts', label: 'AI Insight Alerts', icon: Sparkles },
                    ].map((rule) => {
                      const isChecked = notifSettings.rules[rule.key] ?? true;
                      const RuleIcon = rule.icon;
                      return (
                        <div key={rule.key} className="flex items-center space-x-4 border border-slate-200 dark:border-slate-700 rounded-[14px] p-3.5 hover:border-[#6868F9]/50 transition-colors cursor-pointer"
                          onClick={() => setNotifSettings({ ...notifSettings, rules: { ...notifSettings.rules, [rule.key]: !isChecked } })}
                        >
                          <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 transition-all ${isChecked ? 'bg-[#6868F9] border-[#6868F9]' : 'border-2 border-slate-300 dark:border-slate-600 bg-transparent'}`}>
                            {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>

                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[#6868F9] shrink-0">
                            <RuleIcon size={16} />
                          </div>

                          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 flex-1">{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveNotifications}
                    className="w-full py-3.5 bg-[#6868F9] hover:bg-indigo-600 text-white rounded-[14px] text-[14px] font-bold transition-colors flex items-center justify-center space-x-2 shadow-md shadow-indigo-500/20"
                  >
                    <Save size={18} />
                    <span>Save Rules</span>
                  </button>
                </div>

              </div>
            </div>
  );
};

export default NotificationManagementTab;
