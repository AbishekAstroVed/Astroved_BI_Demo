import React, { useState, useEffect } from 'react';
import { Download, Calendar, Mail, CheckCircle2, Loader2, File, Trash2, Send, Clock, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import MultiSelectDropdown from '../../components/MultiSelectDropdown';

const DASHBOARD_OPTIONS = [
  { label: 'Executive Dashboard', value: 'Executive Dashboard' },
  { label: 'Customer Dashboard', value: 'Customer Dashboard' },
  { label: 'Sales Dashboard', value: 'Sales Dashboard' },
  { label: 'Newsletter Performance', value: 'Newsletter Performance' },
  { label: 'Operations Dashboard', value: 'Operations Dashboard' }
];

const ReportsBuilder = () => {
  const [reportType, setReportType] = useState('daily');
  const [exportData, setExportData] = useState('audit');
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // Scheduler state
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleType, setScheduleType] = useState('weekly');
  const [recipientEmails, setRecipientEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleFormat, setScheduleFormat] = useState(['PDF']);
  const [schedulePeriod, setSchedulePeriod] = useState('Daily');
  const [selectedDashboards, setSelectedDashboards] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const loadSchedules = async () => {
    try {
      const data = await api.getSchedules();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleExport = () => {
    const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
    if (userPermissions && userPermissions.data) {
      if (userPermissions.data.export === false) {
        toast.error('Access Denied: Your role profile does not have permission to Export data.');
        return;
      }
      if (userPermissions.data.download === false) {
        toast.error('Access Denied: Your role profile does not have permission to Download files.');
        return;
      }
    }

    const collection = exportData;

    setIsExporting(true);
    setExportStatus('Compiling dataset metrics...');

    setTimeout(() => {
      setExportStatus('Formatting into final schemas...');
      setTimeout(async () => {
        setIsExporting(false);
        setExportStatus('');

        try {
          // Trigger actual file download from the backend
          const url = `${api.exportCollectionUrl(collection, exportFormat === 'excel' ? 'csv' : exportFormat)}&duration=${reportType}`;
          const link = document.createElement('a');
          link.href = url;
          link.download = `astroved_${collection}_${reportType}_report_${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'csv' : exportFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success(`Exported ${reportType} ${collection} report successfully!`);

          // Log audit log
          await api.createAuditLog({
            user: 'Super Admin',
            action: `Generated and exported ${reportType} ${collection} report`,
            module: 'Data Exporter',
            ip: '127.0.0.1',
            browser: navigator.userAgent
          });
        } catch (err) {
          toast.error('Export failed');
        }
      }, 1000);
    }, 1000);
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
    if (userPermissions && userPermissions.crud && userPermissions.crud.create === false) {
      toast.error('Access Denied: Your role does not have Create permissions.');
      return;
    }
    if (!scheduleName || recipientEmails.length === 0 || !scheduleTime) {
      toast.error('Please provide a schedule name, recipient email, and select a time.');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('astroved_user') || '{}');
      const senderEmail = user.email || 'no-reply@astroved.com';
      const recipientsString = recipientEmails.join(', ');

      const newSch = {
        name: scheduleName,
        frequency: scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1),
        recipients: recipientEmails,
        format: scheduleFormat.join(','),
        time: scheduleTime,
        period: schedulePeriod,
        senderEmail: senderEmail,
        dashboards: selectedDashboards.length > 0 
          ? selectedDashboards.map(d => typeof d === 'string' ? d : d.value)
          : DASHBOARD_OPTIONS.map(d => d.value),
        status: 'Active'
      };

      await api.createSchedule(newSch);
      toast.success(`Successfully registered automated schedule for ${scheduleTime}!`);
      loadSchedules();

      // Log audit log
      await api.createAuditLog({
        user: user.name || user.email || 'System User',
        action: `Created new automated schedule: ${scheduleName}`,
        module: 'Reports Scheduler',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });

      // reset form
      setScheduleName('');
      setRecipientEmails([]);
      setEmailInput('');
      setScheduleTime('');
      setSelectedDashboards([]);
      setScheduleFormat(['PDF']);
    } catch (err) {
      toast.error('Failed to register schedule: ' + err.message);
    }
  };

  const handleDeleteSchedule = (id, name) => {
    const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
    if (userPermissions && userPermissions.crud && userPermissions.crud.delete === false) {
      toast.error('Access Denied: Your role does not have Delete permissions.');
      return;
    }
    toast((t) => (
      <div className="flex flex-col space-y-3 p-1">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-red-50 text-red-500 rounded-full border border-red-100">
            <Trash2 size={16} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-cosmic-text">Delete Schedule</h4>
            <p className="text-xs text-cosmic-muted mt-1 leading-relaxed">
              Are you sure you want to delete <strong>"{name}"</strong>? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.deleteSchedule(id);
                toast.success(`Successfully deleted schedule "${name}"!`);
                loadSchedules();

                // Log audit log
                const currentUser = JSON.parse(localStorage.getItem('astroved_user') || '{}');
                await api.createAuditLog({
                  user: currentUser.name || currentUser.email || 'System User',
                  action: `Deleted schedule: ${name}`,
                  module: 'Reports Scheduler',
                  ip: '127.0.0.1',
                  browser: navigator.userAgent
                });
              } catch (error) {
                console.error('Failed to delete schedule:', error);
                toast.error('Failed to delete schedule');
              }
            }}
            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg shadow-md shadow-red-500/20 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      style: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        padding: '16px',
        maxWidth: '400px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }
    });
  };

  const handleTriggerTest = async (sch) => {
    const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
    if (userPermissions && userPermissions.crud && userPermissions.crud.publish === false) {
      toast.error('Access Denied: Your role does not have Publish permissions.');
      return;
    }
    const loadingToast = toast.loading(`Triggering report dispatch for "${sch.name}"...`);
    try {
      const user = JSON.parse(localStorage.getItem('astroved_user') || '{}');
      const senderEmail = user.email || 'no-reply@astroved.com';

      await api.triggerTestReport({
        name: sch.name,
        recipients: sch.recipients,
        format: sch.format,
        senderEmail: senderEmail,
        period: sch.period,
        dashboards: sch.dashboards && sch.dashboards.length > 0 ? sch.dashboards : DASHBOARD_OPTIONS.map(d => d.value)
      });
      toast.dismiss(loadingToast);
      toast.success(`Successfully dispatched report to: ${sch.recipients}`);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(`Dispatch failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Export & Scheduler Grid */}
      <div className="grid grid-cols-1 gap-6 items-start">


        {/* Schedule Creator */}
        <div className="bg-cosmic-card border border-cosmic-border shadow-sm p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h4 className="text-cosmic-text font-extrabold text-base flex items-center">
                <Calendar size={18} className="text-indigo-400 mr-2" />
                Automated Report Scheduler
              </h4>
              <p className="text-xs text-cosmic-muted mt-1">
                Schedule recurring exports directly to email addresses.
              </p>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* 1. Schedule Name */}
                <div className="space-y-1.5 md:col-span-2 lg:col-span-1 xl:col-span-1">
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">Schedule Name</label>
                  <input
                    type="text"
                    placeholder="Weekly KPI Summary..."
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    className="w-full bg-cosmic-bg border border-cosmic-border px-4 py-2.5 rounded-xl text-sm text-cosmic-text placeholder-cosmic-muted focus:outline-none focus:border-indigo-500/50 transition-colors"
                    required
                  />
                </div>

                {/* 2. Recurrence */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">Recurrence</label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    className="w-full bg-cosmic-bg border border-cosmic-border px-4 py-2.5 rounded-xl text-sm text-cosmic-text focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
                  >
                    <option value="daily">Every Day</option>
                    <option value="weekly">Every Week</option>
                    <option value="monthly">Every Month</option>
                    <option value="yearly">Every Year</option>
                  </select>
                </div>

                {/* 3. Data Period */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">Data Period</label>
                  <select
                    value={schedulePeriod}
                    onChange={(e) => setSchedulePeriod(e.target.value)}
                    className="w-full bg-cosmic-bg border border-cosmic-border px-4 py-2.5 rounded-xl text-sm text-cosmic-text focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
                  >
                    <option value="Daily">Daily Report</option>
                    <option value="Weekly">Weekly Report</option>
                    <option value="Monthly">Monthly Report</option>
                    <option value="Yearly">Yearly Report</option>
                  </select>
                </div>

                {/* 4. Select Dashboards */}
                <div className="space-y-1.5 md:col-span-2 lg:col-span-1 xl:col-span-1">
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">Select Dashboards</label>
                  <div className="border border-cosmic-border rounded-xl transition-colors focus-within:border-indigo-500/50">
                    <MultiSelectDropdown 
                      options={DASHBOARD_OPTIONS}
                      selected={selectedDashboards}
                      onChange={setSelectedDashboards}
                      placeholder="All Dashboards"
                    />
                  </div>
                </div>

                {/* 5. Format */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">Format</label>
                  <div className="flex gap-4 p-2.5 bg-cosmic-bg border border-cosmic-border rounded-xl">
                    {['PDF', 'Excel', 'CSV'].map((fmt) => (
                      <label key={fmt} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={fmt.toUpperCase()}
                          checked={scheduleFormat.includes(fmt.toUpperCase())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setScheduleFormat([...scheduleFormat, e.target.value]);
                            } else {
                              setScheduleFormat(scheduleFormat.filter(f => f !== e.target.value));
                            }
                          }}
                          className="w-4 h-4 text-indigo-600 rounded border-cosmic-border bg-transparent focus:ring-indigo-500 focus:ring-offset-cosmic-bg"
                        />
                        <span className="text-sm text-cosmic-text font-medium">{fmt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 6. Send Hour (UTC) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">Send Hour (UTC)</label>
                  <div className="flex items-center space-x-2 w-full">
                    <select
                      value={scheduleTime ? (() => { let h = parseInt(scheduleTime.split(':')[0], 10); return String(h % 12 || 12).padStart(2, '0'); })() : ''}
                      onChange={(e) => {
                        const m = scheduleTime ? scheduleTime.split(':')[1] : '00';
                        const p = scheduleTime && parseInt(scheduleTime.split(':')[0], 10) >= 12 ? 'PM' : 'AM';
                        let hr = parseInt(e.target.value, 10);
                        if (p === 'PM' && hr !== 12) hr += 12;
                        if (p === 'AM' && hr === 12) hr = 0;
                        setScheduleTime(`${String(hr).padStart(2, '0')}:${m}`);
                      }}
                      className="flex-1 bg-cosmic-bg border border-cosmic-border px-3 py-2.5 rounded-xl text-sm text-cosmic-text focus:outline-none focus:border-indigo-500/50 text-center transition-colors cursor-pointer"
                      required
                    >
                      <option value="" disabled>HH</option>
                      {Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-cosmic-text font-extrabold">:</span>
                    <select
                      value={scheduleTime ? scheduleTime.split(':')[1] : ''}
                      onChange={(e) => {
                        let hr = scheduleTime ? parseInt(scheduleTime.split(':')[0], 10) : 12;
                        setScheduleTime(`${String(hr).padStart(2, '0')}:${e.target.value}`);
                      }}
                      className="flex-1 bg-cosmic-bg border border-cosmic-border px-3 py-2.5 rounded-xl text-sm text-cosmic-text focus:outline-none focus:border-indigo-500/50 text-center transition-colors cursor-pointer"
                      required
                    >
                      <option value="" disabled>MM</option>
                      {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      value={scheduleTime && parseInt(scheduleTime.split(':')[0], 10) >= 12 ? 'PM' : 'AM'}
                      onChange={(e) => {
                        if (!scheduleTime) return;
                        const m = scheduleTime.split(':')[1];
                        let hr = parseInt(scheduleTime.split(':')[0], 10);
                        const p = e.target.value;
                        if (p === 'PM' && hr < 12) hr += 12;
                        if (p === 'AM' && hr >= 12) hr -= 12;
                        setScheduleTime(`${String(hr).padStart(2, '0')}:${m}`);
                      }}
                      className="flex-1 bg-cosmic-bg border border-cosmic-border px-3 py-2.5 rounded-xl text-sm text-cosmic-text focus:outline-none focus:border-indigo-500/50 text-center font-bold transition-colors cursor-pointer"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                {/* 7. Recipients Email (Full Width) */}
                <div className="space-y-1.5 md:col-span-2 lg:col-span-3 xl:col-span-2">
                  <label className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">Recipients Email (Press Enter)</label>
                  <div className="w-full bg-cosmic-bg border border-cosmic-border rounded-xl flex flex-wrap gap-2 p-2 min-h-[46px] items-center focus-within:border-indigo-500/50 transition-colors">
                    {recipientEmails.map((email, index) => (
                      <div key={index} className="flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-indigo-100/50">
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => setRecipientEmails(recipientEmails.filter((_, i) => i !== index))}
                          className="text-indigo-400 hover:text-red-500 focus:outline-none ml-1 transition-colors cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <input
                      type="email"
                      placeholder={recipientEmails.length === 0 ? "name@company.com" : ""}
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = emailInput.trim().replace(',', '');
                          if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) && !recipientEmails.includes(val)) {
                            setRecipientEmails([...recipientEmails, val]);
                            setEmailInput('');
                          } else if (val) {
                            toast.error('Please enter a valid email address.');
                          }
                        } else if (e.key === 'Backspace' && emailInput === '' && recipientEmails.length > 0) {
                          setRecipientEmails(recipientEmails.slice(0, -1));
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-cosmic-text placeholder-cosmic-muted min-w-[150px] py-1 px-2"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end pt-6 mt-4 border-t border-cosmic-border/30">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
                >
                  <Calendar size={16} className="text-white" />
                  <span>Register Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Schedules List */}
      <div className="bg-cosmic-card border border-cosmic-border shadow-sm p-6 rounded-2xl">
        <h4 className="text-cosmic-text font-extrabold text-sm mb-4 flex items-center">
          <Mail size={16} className="text-indigo-400 mr-1.5" />
          Active Report Deliveries
        </h4>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-cosmic-border/40 text-cosmic-muted font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3 pl-4 whitespace-nowrap">Schedule Description</th>
                <th className="py-3 whitespace-nowrap">Interval</th>
                <th className="py-3 whitespace-nowrap">Time</th>
                <th className="py-3 whitespace-nowrap">Period</th>
                <th className="py-3 whitespace-nowrap">Format</th>
                <th className="py-3 whitespace-nowrap">Dashboards</th>
                <th className="py-3 whitespace-nowrap">Recipients List</th>
                <th className="py-3 text-center whitespace-nowrap">Status</th>
                <th className="py-3 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-cosmic-border/20 text-cosmic-text">
                {schedules.map((sch, idx) => (
                  <tr key={idx} className="hover:bg-cosmic-card-hover/30 transition-colors">
                    <td className="py-3.5 pl-4 font-semibold text-cosmic-text">{sch.name}</td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                        <Clock size={10} className="mr-1" />
                        {sch.frequency || sch.type}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-cosmic-muted">{sch.time || '09:00'}</td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 capitalize">
                        {sch.period || 'Daily'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${sch.format?.toLowerCase() === 'pdf'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : sch.format?.toLowerCase() === 'excel'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                        {sch.format}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-cosmic-muted text-[10px] max-w-[150px] truncate" title={sch.dashboards && sch.dashboards.length > 0 ? sch.dashboards.join(', ') : 'All'}>
                      {sch.dashboards && sch.dashboards.length > 0 ? sch.dashboards.join(', ') : 'All'}
                    </td>
                    <td className="py-3.5 font-mono text-cosmic-muted max-w-[120px] truncate" title={sch.recipients}>{sch.recipients}</td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                        {sch.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleTriggerTest(sch)}
                          title="Trigger Test Dispatch"
                          className="p-1.5 rounded-lg bg-cosmic-bg hover:bg-cosmic-card-hover border border-cosmic-border text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          <Send size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sch.id, sch.name)}
                          title="Delete Schedule"
                          className="p-1.5 rounded-lg bg-cosmic-bg hover:bg-cosmic-card-hover border border-cosmic-border text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-cosmic-muted text-xs">
                      No active report deliveries configured. Use the form above to add one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default ReportsBuilder;
