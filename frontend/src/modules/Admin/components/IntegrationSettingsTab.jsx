import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Sliders, Target, Calendar, Bell, Sparkles,
  Cpu, FileText, Settings, Plus, Trash2, Edit3, Key, Lock, Unlock,
  UserCheck, UserX, Save, Play, Check, Database, RefreshCw, Download, Info,
  Brain, Box, Clock, Thermometer, Folder, CheckCircle, FileSpreadsheet, FileJson,
  Network, Copy, Hash, CreditCard, BarChart2, LineChart, Mail,
  AlertCircle, Minus, TrendingUp, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { confirmToast, promptToast } from '../../../components/ConfirmToast';
import { api } from '../../../services/api';

const IntegrationSettingsTab = ({ crud }) => {
  // 8. STATE - INTEGRATIONS
  // ----------------------------------------------------
  const [integrations, setIntegrations] = useState([]);
  const [configuringIntegration, setConfiguringIntegration] = useState(null);
  const [configFields, setConfigFields] = useState({});
  const [showSecrets, setShowSecrets] = useState({});

  const toggleShowSecret = (key) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadIntegrations = async () => {
    try {
      const data = await api.getIntegrations();
      setIntegrations(data);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    }
  };

  const toggleIntegration = async (id) => {
    if (crud.edit === false) {
      toast.error('Access Denied: Your role does not have Edit permissions.');
      return;
    }
    try {
      await api.toggleIntegration(id);
      loadIntegrations();

      await api.createAuditLog({
        user: 'Super Admin',
        action: `Toggled status of integration: ${id}`,
        module: 'Integrations Settings',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });
    } catch (err) {
      toast.error('Failed to update integration');
    }
  };

  const handleOpenConfig = (int) => {
    setConfiguringIntegration(int);
    setConfigFields(int.config || {});
    setShowSecrets({});
  };

  const handleSaveIntegrationConfig = async (e) => {
    e.preventDefault();
    if (crud.edit === false) {
      toast.error('Access Denied: Your role does not have Edit permissions.');
      return;
    }
    if (!configuringIntegration) return;
    try {
      await api.updateIntegrationConfig(configuringIntegration.id, configFields);
      toast.success(`Successfully configured ${configuringIntegration.name}!`);
      setConfiguringIntegration(null);
      loadIntegrations();

      await api.createAuditLog({
        user: 'Super Admin',
        action: `Configured parameters for integration: ${configuringIntegration.name}`,
        module: 'Integrations Settings',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });
    } catch (err) {
      toast.error('Failed to save integration settings');
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
              <div className="flex items-center space-x-4 pb-4 border-b border-cosmic-border/50">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-cosmic-text">Integration Connectors</h3>
                  <p className="text-xs text-cosmic-muted mt-1">Toggle and configure integration keys for external advertisement managers, databases, and CRMs.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.isArray(integrations) && integrations.map(int => (
                  <div key={int.id} className={`p-4 bg-white dark:bg-cosmic-bg border border-cosmic-border rounded-2xl shadow-sm flex flex-col justify-center border-l-4 ${int.id === 'payment-gateway' ? 'border-l-[#5433FF]' :
                    int.id === 'meta-ads' ? 'border-l-[#0668E1]' :
                      int.id === 'sql-database' ? 'border-l-blue-400' :
                        int.id === 'google-analytics' ? 'border-l-orange-400' :
                          int.id === 'google-search-console' ? 'border-l-green-400' :
                            int.id === 'google-ads' ? 'border-l-blue-500' :
                              int.id === 'zoho-crm' ? 'border-l-rose-300' : 'border-l-cosmic-border'
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {int.id === 'payment-gateway' && (
                          <div className="w-12 h-12 rounded-xl bg-[#5433FF] flex items-center justify-center font-bold text-white tracking-tighter text-sm shadow-sm shrink-0">
                            stripe
                          </div>
                        )}
                        {int.id === 'meta-ads' && (
                          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shadow-sm shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 12C12 15.3137 9.31371 18 6 18C2.68629 18 0 15.3137 0 12C0 8.68629 2.68629 6 6 6C9.31371 6 12 8.68629 12 12ZM12 12C12 15.3137 14.6863 18 18 18C21.3137 18 24 15.3137 24 12C24 8.68629 21.3137 6 18 6C14.6863 6 12 8.68629 12 12Z" stroke="#0668E1" strokeWidth="2.5" />
                            </svg>
                          </div>
                        )}
                        {int.id === 'sql-database' && (
                          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-500/10 border border-slate-100 dark:border-slate-500/20 flex items-center justify-center shadow-sm shrink-0">
                            <Database size={24} className="text-slate-700 dark:text-slate-300" />
                          </div>
                        )}
                        {int.id === 'google-analytics' && (
                          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center shadow-sm shrink-0">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="2" y="14" width="5" height="8" rx="1" fill="#F9AB00" />
                              <rect x="9" y="8" width="5" height="14" rx="1" fill="#E37400" />
                              <rect x="16" y="2" width="5" height="20" rx="1" fill="#F9AB00" />
                            </svg>
                          </div>
                        )}
                        {int.id === 'google-search-console' && (
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-cosmic-card border border-gray-100 dark:border-cosmic-border flex items-center justify-center shadow-sm shrink-0">
                            <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                          </div>
                        )}
                        {int.id === 'google-ads' && (
                          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shadow-sm shrink-0">
                            <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 25.5L24 4L42 14L27 38.5L11 25.5Z" fill="#FABB05" />
                              <path d="M30 40L14 31L7 16L19 5L41 18L30 40Z" fill="#4285F4" />
                              <path d="M14 31L11 25.5L27 38.5L30 40L14 31Z" fill="#34A853" />
                            </svg>
                          </div>
                        )}
                        {int.id === 'zoho-crm' && (
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-cosmic-card border border-gray-100 dark:border-cosmic-border flex flex-col items-center justify-center shadow-sm text-[9px] font-black tracking-wider text-black dark:text-white shrink-0">
                            <div className="flex gap-0.5 mb-1 mt-0.5">
                              <div className="w-2.5 h-2.5 bg-[#E64C3B] rounded-sm"></div>
                              <div className="w-2.5 h-2.5 bg-[#4CAF50] rounded-sm"></div>
                              <div className="w-2.5 h-2.5 bg-[#00A3DF] rounded-sm"></div>
                              <div className="w-2.5 h-2.5 bg-[#FBC02D] rounded-sm"></div>
                            </div>
                            ZOHO
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h4 className="text-[13px] font-bold text-cosmic-text truncate leading-tight">{int.name}</h4>
                          <div className="flex items-center space-x-1.5 mt-0.5 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-cosmic-muted/40 shrink-0"></div>
                            <span className="text-[10px] font-semibold text-cosmic-muted uppercase tracking-wider truncate block">Last Sync: {int.lastSync}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0 ml-2">
                        <button
                          onClick={() => handleOpenConfig(int)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-cosmic-card border border-cosmic-border hover:bg-cosmic-card-hover text-cosmic-muted hover:text-cosmic-text transition-colors shadow-sm"
                          title="Configure Settings"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          onClick={() => toggleIntegration(int.id)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold border-transparent shadow-md transition-all active:scale-95 text-white ${int.connected
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                            }`}
                        >
                          {int.connected ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {configuringIntegration && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-cosmic-card border border-cosmic-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center pb-2 border-b border-cosmic-border/50">
                      <h4 className="text-sm font-extrabold text-cosmic-text">Configure {configuringIntegration.name}</h4>
                      <button
                        onClick={() => setConfiguringIntegration(null)}
                        className="text-cosmic-muted hover:text-cosmic-text text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveIntegrationConfig} className="space-y-4">
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {configuringIntegration.id === 'meta-ads' ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                App ID
                              </label>
                              <input
                                type="text"
                                value={configFields.appId || ''}
                                onChange={(e) => setConfigFields({ ...configFields, appId: e.target.value })}
                                className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. 123456789012345"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                App Secret
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecrets['appSecret'] ? 'text' : 'password'}
                                  value={configFields.appSecret || ''}
                                  onChange={(e) => setConfigFields({ ...configFields, appSecret: e.target.value })}
                                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 pr-9 rounded-lg focus:outline-none focus:border-indigo-500"
                                  placeholder="Enter Meta App Secret"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleShowSecret('appSecret')}
                                  className="absolute right-2.5 top-2.5 text-cosmic-muted hover:text-cosmic-text transition-colors"
                                >
                                  {showSecrets['appSecret'] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Access Token
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecrets['accessToken'] ? 'text' : 'password'}
                                  value={configFields.accessToken || ''}
                                  onChange={(e) => setConfigFields({ ...configFields, accessToken: e.target.value })}
                                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 pr-9 rounded-lg focus:outline-none focus:border-indigo-500"
                                  placeholder="Enter System User / Long-lived Access Token"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleShowSecret('accessToken')}
                                  className="absolute right-2.5 top-2.5 text-cosmic-muted hover:text-cosmic-text transition-colors"
                                >
                                  {showSecrets['accessToken'] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Ad Account ID
                              </label>
                              <input
                                type="text"
                                value={configFields.adAccountId || ''}
                                onChange={(e) => setConfigFields({ ...configFields, adAccountId: e.target.value })}
                                className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. act_123456789"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Business Manager ID
                              </label>
                              <input
                                type="text"
                                value={configFields.businessManagerId || ''}
                                onChange={(e) => setConfigFields({ ...configFields, businessManagerId: e.target.value })}
                                className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. 9876543210"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Pixel ID
                              </label>
                              <input
                                type="text"
                                value={configFields.pixelId || ''}
                                onChange={(e) => setConfigFields({ ...configFields, pixelId: e.target.value })}
                                className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. 123456789012345"
                              />
                            </div>
                          </div>
                        ) : configuringIntegration.id === 'google-ads' ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Developer Token
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecrets['developerToken'] ? 'text' : 'password'}
                                  value={configFields.developerToken || ''}
                                  onChange={(e) => setConfigFields({ ...configFields, developerToken: e.target.value })}
                                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 pr-9 rounded-lg focus:outline-none focus:border-indigo-500"
                                  placeholder="Enter Developer Token"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleShowSecret('developerToken')}
                                  className="absolute right-2.5 top-2.5 text-cosmic-muted hover:text-cosmic-text transition-colors"
                                >
                                  {showSecrets['developerToken'] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Client ID
                              </label>
                              <input
                                type="text"
                                value={configFields.clientId || ''}
                                onChange={(e) => setConfigFields({ ...configFields, clientId: e.target.value })}
                                className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="xxxxxx.apps.googleusercontent.com"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Client Secret
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecrets['clientSecret'] ? 'text' : 'password'}
                                  value={configFields.clientSecret || ''}
                                  onChange={(e) => setConfigFields({ ...configFields, clientSecret: e.target.value })}
                                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 pr-9 rounded-lg focus:outline-none focus:border-indigo-500"
                                  placeholder="Enter OAuth Client Secret"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleShowSecret('clientSecret')}
                                  className="absolute right-2.5 top-2.5 text-cosmic-muted hover:text-cosmic-text transition-colors"
                                >
                                  {showSecrets['clientSecret'] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Refresh Token
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecrets['refreshToken'] ? 'text' : 'password'}
                                  value={configFields.refreshToken || ''}
                                  onChange={(e) => setConfigFields({ ...configFields, refreshToken: e.target.value })}
                                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 pr-9 rounded-lg focus:outline-none focus:border-indigo-500"
                                  placeholder="Enter OAuth Refresh Token"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleShowSecret('refreshToken')}
                                  className="absolute right-2.5 top-2.5 text-cosmic-muted hover:text-cosmic-text transition-colors"
                                >
                                  {showSecrets['refreshToken'] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Customer ID
                              </label>
                              <input
                                type="text"
                                value={configFields.customerId || ''}
                                onChange={(e) => setConfigFields({ ...configFields, customerId: e.target.value })}
                                className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. 123-456-7890"
                              />
                            </div>
                          </div>
                        ) : configuringIntegration.id === 'google-analytics' ? (
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                Measurement ID
                              </label>
                              <input
                                type="text"
                                value={configFields.measurementId || ''}
                                onChange={(e) => setConfigFields({ ...configFields, measurementId: e.target.value })}
                                className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="G-XXXXXXXXXX"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                API Secret
                              </label>
                              <input
                                type="password"
                                value={configFields.apiSecret || ''}
                                onChange={(e) => setConfigFields({ ...configFields, apiSecret: e.target.value })}
                                className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="Enter API Secret"
                              />
                            </div>

                            {/* Google OAuth Connector */}
                            <div className="p-3 bg-cosmic-bg/40 border border-cosmic-border/60 rounded-xl space-y-2">
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block">
                                Connect with Google (OAuth)
                              </label>
                              {configFields.oauthConnected === 'true' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Connected with OAuth Token</span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const token = window.prompt("Enter Google OAuth Access Token (from Google OAuth Playground):");
                                        if (token !== null) {
                                          setConfigFields({ ...configFields, accessToken: token });
                                          toast.success('Access Token updated!');
                                        }
                                      }}
                                      className="flex-1 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg transition-colors text-center"
                                    >
                                      Update Token
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfigFields({ ...configFields, oauthConnected: 'false', propertyId: '', accessToken: '' })}
                                      className="flex-1 py-1.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-[10px] font-bold rounded-lg transition-colors text-center"
                                    >
                                      Disconnect
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const token = window.prompt(
                                      "To pull real live reporting data from your GA4 property, paste a Google OAuth Access Token.\n\nClick OK without pasting to connect with simulated live reporting:"
                                    );
                                    if (token !== null) {
                                      toast.success('Connected to Google Analytics via OAuth!');
                                      setConfigFields({
                                        ...configFields,
                                        oauthConnected: 'true',
                                        accessToken: token || 'mock_token',
                                        propertyId: '312948256'
                                      });
                                    }
                                  }}
                                  className="flex items-center justify-center space-x-2 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                                >
                                  <svg className="w-4 h-4 fill-current animate-pulse" viewBox="0 0 24 24">
                                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.483 0-6.312-2.829-6.312-6.312 0-3.483 2.829-6.312 6.312-6.312 1.638 0 3.129.621 4.27 1.639l3.222-3.222C19.16 2.37 15.932 1.1 12.24 1.1 6.117 1.1 1.1 6.117 1.1 12.24s5.017 11.14 11.14 11.14c6.398 0 10.669-4.503 10.669-10.854 0-.73-.064-1.425-.195-2.09-.009-.074-20.474-.151-20.474-.151z" />
                                  </svg>
                                  <span>Connect Google Account</span>
                                </button>
                              )}
                            </div>

                            {/* GA4 Property ID selection */}
                            <div>
                              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                GA4 Property ID
                              </label>
                              <input
                                type="text"
                                value={configFields.propertyId || ''}
                                onChange={(e) => setConfigFields({ ...configFields, propertyId: e.target.value })}
                                className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                                placeholder="Enter your GA4 Property ID (e.g. 312948256)"
                              />
                            </div>
                          </div>
                        ) : (
                          Object.keys(configuringIntegration.config || {}).map((key) => {
                            const isSecret = key.toLowerCase().includes('secret') ||
                              key.toLowerCase().includes('key') ||
                              key.toLowerCase().includes('password') ||
                              key.toLowerCase().includes('token');
                            return (
                              <div key={key}>
                                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </label>
                                <div className="relative">
                                  <input
                                    type={isSecret && !showSecrets[key] ? 'password' : 'text'}
                                    value={configFields[key] || ''}
                                    onChange={(e) => setConfigFields({ ...configFields, [key]: e.target.value })}
                                    className={`w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 ${isSecret ? 'pr-9' : ''} rounded-lg focus:outline-none focus:border-indigo-500`}
                                    placeholder={`Enter ${key}`}
                                  />
                                  {isSecret && (
                                    <button
                                      type="button"
                                      onClick={() => toggleShowSecret(key)}
                                      className="absolute right-2.5 top-2.5 text-cosmic-muted hover:text-cosmic-text transition-colors"
                                    >
                                      {showSecrets[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                        {Object.keys(configuringIntegration.config || {}).length === 0 && (
                          <p className="text-xs text-cosmic-muted">No configurable options for this integration connector.</p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2 pt-3 border-t border-cosmic-border/50">
                        <button
                          type="button"
                          onClick={() => setConfiguringIntegration(null)}
                          className="px-3.5 py-1.5 bg-cosmic-bg hover:bg-cosmic-card-hover border border-cosmic-border rounded-lg text-[10px] font-bold text-cosmic-text"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold"
                        >
                          Save Config
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
  );
};

export default IntegrationSettingsTab;
