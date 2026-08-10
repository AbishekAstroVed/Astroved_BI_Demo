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

const SystemSettingsTab = ({ crud }) => {
  // 10. STATE - SYSTEM SETTINGS
  // ----------------------------------------------------
  const [systemConfig, setSystemConfig] = useState({
    companyName: '',
    logoUrl: '',
    themeMode: 'light',
    currency: '₹ (INR)',
    timeZone: 'GMT+5:30 (IST)',
    fiscalYear: 'April - March',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '12-hour',
    language: 'English (US)',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    autoBackup: true,
    backupInterval: 'Daily',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: ''
  });

  const loadSystemConfig = async () => {
    try {
      const data = await api.getSystemConfig();
      if (data) setSystemConfig(data);
    } catch (err) {
      console.error('Failed to load system config:', err);
    }
  };

  const handleSaveSystemConfig = async () => {
    if (crud.edit === false) {
      toast.error('Access Denied: Your role does not have Edit permissions.');
      return;
    }
    try {
      await api.updateSystemConfig(systemConfig);
      toast.success('Saved System Configurations!');

      await api.createAuditLog({
        user: 'Super Admin',
        action: 'Updated global system locale, backup & configurations',
        module: 'System Settings',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });
    } catch (err) {
      toast.error('Failed to save system configurations');
    }
  };

  const handleLogoUpload = (e) => {
    if (crud.edit === false) {
      toast.error('Access Denied: Your role does not have Edit permissions.');
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSystemConfig({ ...systemConfig, logoUrl: event.target.result });
      toast.success('Logo uploaded and ready to save!');
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerBackup = async () => {
    if (crud.approve === false) {
      toast.error('Access Denied: Your role does not have Approve permissions required to trigger backups.');
      return;
    }
    if (userPermissions?.data?.download === false) {
      toast.error('Access Denied: Your role does not have Download permissions.');
      return;
    }
    toast.success('Database backup snapshot generating...');

    // Dynamically download full JSON backup of the system collections
    const link = document.createElement('a');
    link.href = '/api/admin/system/backup';
    link.download = `astroved_bi_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      await api.createAuditLog({
        user: 'Super Admin',
        action: 'Triggered immediate MongoDB database backup archive',
        module: 'System Settings',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });
    } catch (logErr) {
      console.error('Failed to create audit log for backup:', logErr);
    }
  };

  // ----------------------------------------------------
  // 11. BULK DATA IMPORT & EXPORT
  // ----------------------------------------------------
  const [selectedImportExportCollection, setSelectedImportExportCollection] = useState('users');
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExportCollection = (format) => {
    if (userPermissions?.data?.export === false) {
      toast.error('Access Denied: Your role does not have Export permissions.');
      return;
    }
    if (selectedImportExportCollection === 'all') {
      if (format === 'csv') {
        toast.error('Full database backup is only supported in JSON format.');
        return;
      }
      handleTriggerBackup();
      return;
    }

    const url = api.exportCollectionUrl(selectedImportExportCollection, format);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astroved_${selectedImportExportCollection}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exporting ${selectedImportExportCollection} as ${format.toUpperCase()}...`);
  };

  const handleImportFile = async (e) => {
    if (crud.approve === false) {
      toast.error('Access Denied: Your role does not have Approve permissions required to import datasets.');
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    const format = file.name.endsWith('.json') ? 'json' : 'csv';
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileContent = event.target.result;
        let dataToImport = fileContent;
        if (format === 'json') {
          dataToImport = JSON.parse(fileContent);
        }

        if (selectedImportExportCollection === 'all') {
          if (format !== 'json') {
            toast.error('Full database restore requires a JSON backup file.');
            return;
          }
          toast.success('Restoring full database snapshot...');
          await api.restoreDatabaseBackup(dataToImport);
          toast.success('Successfully restored full database backup snapshot!');
        } else {
          await api.importCollection(selectedImportExportCollection, format, dataToImport);
          toast.success(`Successfully imported data into ${selectedImportExportCollection}!`);
        }

        // Reload all
        loadAllData();
      } catch (err) {
        toast.error(`Import/Restore failed: ${err.message || 'Check file format'}`);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    loadSystemConfig();
  }, []);

  return (
            <div className="space-y-6">

              {/* Header */}
              <div className="flex items-start pb-4 border-b border-cosmic-border/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <Settings size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-cosmic-text">BI System Configuration</h3>
                    <p className="text-xs text-cosmic-muted mt-1">Control company profile, currency units, formats, backups options, and locale rules.</p>
                  </div>
                </div>
              </div>

              {/* Grid Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Card: Backup Settings */}
                <div className="border border-cosmic-border rounded-xl p-5 space-y-5 bg-cosmic-card flex flex-col justify-between">

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <Database size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-cosmic-text uppercase tracking-wider">Backup Settings</h4>
                        <p className="text-[10px] text-cosmic-muted mt-0.5">Configure automatic database backups</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div>
                      <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-2">Backup Frequency</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={14} className="text-cosmic-muted" />
                        </div>
                        <select
                          value={systemConfig.backupInterval}
                          onChange={(e) => setSystemConfig({ ...systemConfig, backupInterval: e.target.value })}
                          className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text pl-9 pr-3 py-2.5 rounded-lg focus:outline-none appearance-none"
                        >
                          <option>Hourly</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                          <option>Yearly</option>
                          <option>Entire Database</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-cosmic-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveSystemConfig}
                      className="w-full sm:flex-1 py-2.5 bg-cosmic-bg border border-cosmic-border hover:border-indigo-500 text-cosmic-text rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-95"
                    >
                      <Save size={14} />
                      <span>Save Settings</span>
                    </button>
                    <button
                      onClick={handleTriggerBackup}
                      className="w-full sm:flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                    >
                      <RefreshCw size={14} />
                      <span>Backup Now</span>
                    </button>
                  </div>
                </div>

                {/* Right Card: Bulk Data Export */}
                <div className="border border-cosmic-border rounded-xl p-5 space-y-5 bg-cosmic-card flex flex-col justify-between">

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-cosmic-text uppercase tracking-wider">Bulk Data Export</h4>
                      <p className="text-[10px] text-cosmic-muted mt-0.5">Export database collections as files</p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div>
                      <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-2">Select Collection</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Folder size={14} className="text-cosmic-muted" />
                        </div>
                        <select
                          value={selectedImportExportCollection}
                          onChange={(e) => setSelectedImportExportCollection(e.target.value)}
                          className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text pl-9 pr-3 py-2.5 rounded-lg focus:outline-none appearance-none"
                        >
                          <option value="users">Users Directory</option>
                          <option value="kpis">KPI Metrics Library</option>
                          <option value="targets">Target Metrics Matrix</option>
                          <option value="schedules">Report Schedules</option>
                          <option value="integrations">System Connectors</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-cosmic-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-2">Export Format</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* CSV Radio */}
                        <label className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${exportFormat === 'csv' ? 'border-indigo-500 bg-indigo-500/10' : 'border-cosmic-border hover:border-indigo-500/50'}`}>
                          <div className="flex items-center gap-2">
                            <FileText size={16} className={exportFormat === 'csv' ? 'text-indigo-400' : 'text-cosmic-muted'} />
                            <span className={`text-xs font-bold ${exportFormat === 'csv' ? 'text-indigo-400' : 'text-cosmic-text'}`}>CSV</span>
                          </div>
                          <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${exportFormat === 'csv' ? 'border-indigo-500' : 'border-cosmic-border'}`}>
                            {exportFormat === 'csv' && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                          </div>
                          <input type="radio" name="format" value="csv" checked={exportFormat === 'csv'} onChange={(e) => setExportFormat(e.target.value)} className="hidden" />
                        </label>

                        {/* Excel Radio */}
                        <label className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${exportFormat === 'xlsx' ? 'border-indigo-500 bg-indigo-500/10' : 'border-cosmic-border hover:border-indigo-500/50'}`}>
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet size={16} className={exportFormat === 'xlsx' ? 'text-indigo-400' : 'text-cosmic-muted'} />
                            <span className={`text-xs font-bold ${exportFormat === 'xlsx' ? 'text-indigo-400' : 'text-cosmic-text'}`}>Excel</span>
                          </div>
                          <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${exportFormat === 'xlsx' ? 'border-indigo-500' : 'border-cosmic-border'}`}>
                            {exportFormat === 'xlsx' && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                          </div>
                          <input type="radio" name="format" value="xlsx" checked={exportFormat === 'xlsx'} onChange={(e) => setExportFormat(e.target.value)} className="hidden" />
                        </label>

                        {/* JSON Radio */}
                        <label className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${exportFormat === 'json' ? 'border-indigo-500 bg-indigo-500/10' : 'border-cosmic-border hover:border-indigo-500/50'}`}>
                          <div className="flex items-center gap-2">
                            <FileJson size={16} className={exportFormat === 'json' ? 'text-indigo-400' : 'text-cosmic-muted'} />
                            <span className={`text-xs font-bold ${exportFormat === 'json' ? 'text-indigo-400' : 'text-cosmic-text'}`}>JSON</span>
                          </div>
                          <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${exportFormat === 'json' ? 'border-indigo-500' : 'border-cosmic-border'}`}>
                            {exportFormat === 'json' && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                          </div>
                          <input type="radio" name="format" value="json" checked={exportFormat === 'json'} onChange={(e) => setExportFormat(e.target.value)} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleExportCollection(exportFormat)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                    >
                      <Download size={14} />
                      <span>Export Data</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
  );
};
export default SystemSettingsTab;
