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

const AuditLogsTab = ({ crud }) => {
  // 9. STATE - AUDIT LOGS
  // ----------------------------------------------------
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditModuleFilter, setAuditModuleFilter] = useState('All');
  const [auditUserFilter, setAuditUserFilter] = useState('All');
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const auditLogsPerPage = 15;
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await api.getAuditLogs();
      setAuditLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const handleExportAuditLogs = () => {
    if (userPermissions?.data?.export === false) {
      toast.error('Access Denied: Your role does not have Export permissions.');
      return;
    }
    try {
      const url = api.exportCollectionUrl('audit', 'csv');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'astroved_audit_logs.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Exporting audit logs as CSV...');
    } catch (err) {
      console.error('Failed to export audit logs:', err);
      toast.error('Failed to export audit logs');
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cosmic-border/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 10h6"></path><path d="M9 18h6"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-cosmic-text">Global Audit Log Trail</h3>
                    <p className="text-xs text-cosmic-muted mt-1">Immutable audit trails tracking settings actions, login events, and report triggers.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="date"
                        value={auditStartDate}
                        onChange={(e) => setAuditStartDate(e.target.value)}
                        className="bg-white dark:bg-cosmic-bg border border-gray-200 dark:border-cosmic-border text-cosmic-text text-xs px-2 sm:px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50 w-[110px] sm:w-auto"
                        title="Start Date"
                      />
                    </div>
                    <span className="text-xs text-cosmic-muted font-bold">-</span>
                    <div className="relative">
                      <input
                        type="date"
                        value={auditEndDate}
                        onChange={(e) => setAuditEndDate(e.target.value)}
                        className="bg-white dark:bg-cosmic-bg border border-gray-200 dark:border-cosmic-border text-cosmic-text text-xs px-2 sm:px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50 w-[110px] sm:w-auto"
                        title="End Date"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleExportAuditLogs}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
                  >
                    <Download size={14} />
                    <span>Download Logs</span>
                  </button>
                </div>
              </div>

              {/* Stats & Search Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-3 px-4 py-2.5 bg-white dark:bg-cosmic-bg border border-gray-200 dark:border-cosmic-border rounded-xl shadow-sm shrink-0">
                    <div className="text-indigo-500">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-cosmic-muted uppercase font-bold leading-tight">Total Events</p>
                      <p className="text-base font-black text-cosmic-text leading-tight">{auditLogs.length.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row bg-white dark:bg-cosmic-bg border border-gray-200 dark:border-cosmic-border rounded-xl p-1 shadow-sm gap-1 w-full sm:w-auto">
                    <div className="relative flex items-center px-3 py-1.5 bg-gray-50 dark:bg-cosmic-card-hover rounded-lg transition-colors group flex-1">
                      <Box size={14} className="text-indigo-500 mr-2 shrink-0" />
                      <select
                        value={auditModuleFilter}
                        onChange={(e) => {
                          setAuditModuleFilter(e.target.value);
                          setAuditCurrentPage(1);
                        }}
                        className="bg-transparent text-cosmic-text text-xs font-bold focus:outline-none cursor-pointer appearance-none pr-5 w-full"
                      >
                        {['All', ...new Set(auditLogs.map(l => l.module))].map(mod => (
                          <option key={mod} value={mod} className="bg-white dark:bg-cosmic-card text-slate-800 dark:text-slate-200">{mod === 'All' ? 'All Modules' : mod}</option>
                        ))}
                      </select>
                      <svg className="w-3 h-3 text-cosmic-muted absolute right-2 pointer-events-none group-hover:text-cosmic-text transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>

                    <div className="relative flex items-center px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-cosmic-card-hover rounded-lg transition-colors group flex-1">
                      <UserCheck size={14} className="text-blue-500 mr-2 shrink-0" />
                      <select
                        value={auditUserFilter}
                        onChange={(e) => {
                          setAuditUserFilter(e.target.value);
                          setAuditCurrentPage(1);
                        }}
                        className="bg-transparent text-cosmic-muted hover:text-cosmic-text text-xs font-bold focus:outline-none cursor-pointer appearance-none pr-5 w-full"
                      >
                        {['All', ...new Set([...users.map(u => u.name || u.email), ...auditLogs.map(l => l.user)].filter(u => u && !u.includes('@') && !['System', 'Automated Cron', 'Super Admin'].includes(u)))].map(user => (
                          <option key={user} value={user} className="bg-white dark:bg-cosmic-card text-slate-800 dark:text-slate-200">{user === 'All' ? 'All Users' : user}</option>
                        ))}
                      </select>
                      <svg className="w-3 h-3 text-cosmic-muted absolute right-2 pointer-events-none group-hover:text-cosmic-text transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs table */}
              <div className="bg-white dark:bg-cosmic-bg border border-gray-200 dark:border-cosmic-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                    <thead className="bg-gray-50/50 dark:bg-cosmic-card">
                      <tr className="border-b border-gray-200 dark:border-cosmic-border text-cosmic-text font-bold text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4">
                          <div className="flex items-center space-x-1 cursor-pointer hover:text-indigo-500 transition-colors">
                            <span>User</span>
                            <svg className="w-3 h-3 text-cosmic-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                          </div>
                        </th>
                        <th className="py-3 px-4">
                          <div className="flex items-center space-x-1 cursor-pointer hover:text-indigo-500 transition-colors">
                            <span>Action Event</span>
                            <svg className="w-3 h-3 text-cosmic-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                          </div>
                        </th>
                        <th className="py-3 px-4">
                          <div className="flex items-center space-x-1 cursor-pointer hover:text-indigo-500 transition-colors">
                            <span>Module</span>
                            <svg className="w-3 h-3 text-cosmic-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                          </div>
                        </th>
                        <th className="py-3 px-4">
                          <div className="flex items-center space-x-1 cursor-pointer hover:text-indigo-500 transition-colors">
                            <span>IP Address</span>
                            <svg className="w-3 h-3 text-cosmic-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                          </div>
                        </th>
                        <th className="py-3 px-4">
                          <div className="flex items-center space-x-1 cursor-pointer hover:text-indigo-500 transition-colors">
                            <span>Browser / OS</span>
                            <svg className="w-3 h-3 text-cosmic-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                          </div>
                        </th>
                        <th className="py-3 px-4">
                          <div className="flex items-center justify-end space-x-1 cursor-pointer hover:text-indigo-500 transition-colors">
                            <span>Date &amp; Time</span>
                            <svg className="w-3 h-3 text-cosmic-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-cosmic-border/50 text-[11px] text-cosmic-text font-medium">
                      {(() => {
                        const filtered = auditLogs
                          .filter(l => auditModuleFilter === 'All' || l.module === auditModuleFilter)
                          .filter(l => auditUserFilter === 'All' || l.user === auditUserFilter)
                          .filter(l => {
                            if (!auditStartDate && !auditEndDate) return true;
                            if (!l.date) return true;
                            const logDate = l.date;
                            const start = auditStartDate || '0000-00-00';
                            const end = auditEndDate || '9999-99-99';
                            return logDate >= start && logDate <= end;
                          })
                          .filter(l => {
                            if (!auditSearchTerm) return true;
                            const term = auditSearchTerm.toLowerCase();
                            return (
                              (l.user || '').toLowerCase().includes(term) ||
                              (l.action || '').toLowerCase().includes(term) ||
                              (l.module || '').toLowerCase().includes(term) ||
                              (l.ip || '').toLowerCase().includes(term)
                            );
                          });

                        const indexOfLastLog = auditCurrentPage * auditLogsPerPage;
                        const indexOfFirstLog = indexOfLastLog - auditLogsPerPage;
                        const currentLogs = filtered.slice(indexOfFirstLog, indexOfLastLog);
                        const totalPages = Math.ceil(filtered.length / auditLogsPerPage);

                        return (
                          <>
                            {currentLogs.map((l, idx) => {
                              let formattedTime = l.time;
                              if (l.time) {
                                const [hourStr, minuteStr] = l.time.split(':');
                                const hour = parseInt(hourStr, 10);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const hour12 = hour % 12 || 12;
                                formattedTime = `${hour12}:${minuteStr} ${ampm}`;
                              }

                              // Deduce icons and colors
                              let actionIcon = <Settings size={14} className="text-orange-500" />;
                              let actionColor = "text-orange-600 dark:text-orange-400";
                              let actionBg = "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20";
                              if (l.action.toLowerCase().includes('toggled status')) {
                                actionIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="16" cy="12" r="3"></circle></svg>;
                                actionColor = "text-emerald-700 dark:text-emerald-400";
                                actionBg = "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20";
                              } else if (l.action.toLowerCase().includes('added user') || l.action.toLowerCase().includes('created')) {
                                actionIcon = <UserCheck size={14} className="text-emerald-500" />;
                                actionColor = "text-emerald-700 dark:text-emerald-400";
                                actionBg = "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20";
                              } else if (l.action.toLowerCase().includes('deleted')) {
                                actionIcon = <Trash2 size={14} className="text-rose-500" />;
                                actionColor = "text-rose-700 dark:text-rose-400";
                                actionBg = "bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20";
                              }

                              let moduleIcon = <Settings size={14} className="text-blue-500" />;
                              if (l.module.toLowerCase().includes('user')) moduleIcon = <Users size={14} className="text-purple-500" />;
                              else if (l.module.toLowerCase().includes('ai')) moduleIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;

                              const initials = l.user ? l.user.substring(0, 2).toUpperCase() : 'U';

                              return (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-cosmic-card-hover transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                                        {initials}
                                      </div>
                                      <div>
                                        <p className="font-bold text-cosmic-text text-xs">{l.user}</p>
                                        <p className="text-[10px] text-cosmic-muted">admin@astroved.com</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${actionBg}`}>
                                        {actionIcon}
                                      </div>
                                      <span className={`font-semibold ${actionColor}`}>{l.action}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-5 h-5 flex items-center justify-center">
                                        {moduleIcon}
                                      </div>
                                      <span className="text-cosmic-text">{l.module}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-cosmic-muted font-mono text-[10px]">{l.ip}</td>
                                  <td className="py-3 px-4 text-cosmic-muted truncate max-w-[150px]">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-red-400 via-yellow-400 to-green-500 p-[2px]">
                                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        </div>
                                      </div>
                                      <span className="truncate" title={l.browser}>{l.browser}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <p className="text-cosmic-text font-semibold">{l.date}</p>
                                    <p className="text-[10px] text-cosmic-muted">{formattedTime}</p>
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Pagination Bottom Bar inside table */}
                            {filtered.length > 0 && (
                              <tr className="bg-gray-50/50 dark:bg-cosmic-card/50 border-t border-gray-200 dark:border-cosmic-border">
                                <td colSpan="6" className="py-3 px-4">
                                  <div className="flex items-center justify-between w-full text-[11px]">
                                    <div className="text-cosmic-muted">
                                      Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filtered.length)} of <span className="font-bold text-cosmic-text">{filtered.length.toLocaleString()}</span> events
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <div className="flex items-center space-x-2 text-cosmic-muted">
                                        <span>{auditLogsPerPage} per page</span>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={() => setAuditCurrentPage(1)}
                                          disabled={auditCurrentPage === 1}
                                          className={`w-7 h-7 flex items-center justify-center rounded border border-gray-200 dark:border-cosmic-border bg-white dark:bg-cosmic-bg ${auditCurrentPage === 1 ? 'opacity-50 cursor-not-allowed text-cosmic-muted' : 'text-cosmic-text hover:bg-gray-50 dark:hover:bg-cosmic-card-hover transition-colors'}`}
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"></path></svg>
                                        </button>
                                        <button
                                          onClick={() => setAuditCurrentPage(prev => Math.max(prev - 1, 1))}
                                          disabled={auditCurrentPage === 1}
                                          className={`w-7 h-7 flex items-center justify-center rounded border border-gray-200 dark:border-cosmic-border bg-white dark:bg-cosmic-bg ${auditCurrentPage === 1 ? 'opacity-50 cursor-not-allowed text-cosmic-muted' : 'text-cosmic-text hover:bg-gray-50 dark:hover:bg-cosmic-card-hover transition-colors'}`}
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"></path></svg>
                                        </button>

                                        <button className="w-7 h-7 flex items-center justify-center rounded bg-indigo-600 text-white font-bold">{auditCurrentPage}</button>

                                        {auditCurrentPage < totalPages && (
                                          <button onClick={() => setAuditCurrentPage(auditCurrentPage + 1)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 dark:border-cosmic-border bg-white dark:bg-cosmic-bg hover:bg-gray-50 dark:hover:bg-cosmic-card-hover text-cosmic-text font-bold transition-colors">{auditCurrentPage + 1}</button>
                                        )}

                                        {auditCurrentPage < totalPages - 1 && (
                                          <span className="px-1 text-cosmic-muted">...</span>
                                        )}

                                        {auditCurrentPage < totalPages - 1 && (
                                          <button onClick={() => setAuditCurrentPage(totalPages)} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 dark:border-cosmic-border bg-white dark:bg-cosmic-bg hover:bg-gray-50 dark:hover:bg-cosmic-card-hover text-cosmic-text font-bold transition-colors">{totalPages}</button>
                                        )}

                                        <button
                                          onClick={() => setAuditCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                          disabled={auditCurrentPage === totalPages || totalPages === 0}
                                          className={`w-7 h-7 flex items-center justify-center rounded border border-gray-200 dark:border-cosmic-border bg-white dark:bg-cosmic-bg ${auditCurrentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed text-cosmic-muted' : 'text-cosmic-text hover:bg-gray-50 dark:hover:bg-cosmic-card-hover transition-colors'}`}
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"></path></svg>
                                        </button>
                                        <button
                                          onClick={() => setAuditCurrentPage(totalPages)}
                                          disabled={auditCurrentPage === totalPages || totalPages === 0}
                                          className={`w-7 h-7 flex items-center justify-center rounded border border-gray-200 dark:border-cosmic-border bg-white dark:bg-cosmic-bg ${auditCurrentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed text-cosmic-muted' : 'text-cosmic-text hover:bg-gray-50 dark:hover:bg-cosmic-card-hover transition-colors'}`}
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"></path></svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
  );
};

export default AuditLogsTab;
