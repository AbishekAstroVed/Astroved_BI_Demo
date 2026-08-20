import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Bell, Moon, Sun, Calendar, Menu, LogOut, X, TrendingUp, ChevronDown, BarChart3, Maximize, RefreshCw } from 'lucide-react';
import { useDateFilter } from '../contexts/DateFilterContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ title, currentModule, onToggleMobileMenu, onNavigate, onLogout, user, onToggleFullScreen, onRefresh }) => {
  const { startDate, endDate, selectPreset, datePreset, setStartDate, setEndDate, isCalendarHidden, dailyDate, setDailyDate } = useDateFilter();
  const { theme, toggleTheme } = useTheme();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [fullActivityOpen, setFullActivityOpen] = useState(false);

  const dateMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notificationsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target)) {
        setDateMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Temporary states (applied on clicking 'Apply')
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [tempPreset, setTempPreset] = useState(datePreset);
  const [tempDailyDate, setTempDailyDate] = useState(dailyDate);

  useEffect(() => {
    setTempDailyDate(dailyDate);
  }, [dailyDate]);

  // Start Date Calendar view states
  const [startMonth, setStartMonth] = useState(new Date(startDate || Date.now()).getMonth());
  const [startYear, setStartYear] = useState(new Date(startDate || Date.now()).getFullYear());

  // End Date Calendar view states
  const [endMonth, setEndMonth] = useState(new Date(endDate || Date.now()).getMonth());
  const [endYear, setEndYear] = useState(new Date(endDate || Date.now()).getFullYear());

  // Sync state when popup opens
  useEffect(() => {
    if (dateMenuOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setTempPreset(datePreset);

      const startD = new Date(startDate || Date.now());
      setStartMonth(startD.getMonth());
      setStartYear(startD.getFullYear());

      const endD = new Date(endDate || Date.now());
      // If start and end are in the same month, default end calendar to show the next month
      if (startD.getMonth() === endD.getMonth() && startD.getFullYear() === endD.getFullYear()) {
        const nextMonthDate = new Date(startD.getFullYear(), startD.getMonth() + 1, 1);
        setEndMonth(nextMonthDate.getMonth());
        setEndYear(nextMonthDate.getFullYear());
      } else {
        setEndMonth(endD.getMonth());
        setEndYear(endD.getFullYear());
      }
    }
  }, [dateMenuOpen, startDate, endDate, datePreset]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePresetChange = (preset) => {
    setTempPreset(preset);
    if (preset === 'custom') return;

    const end = new Date();
    let start = new Date();

    switch (preset) {
      case 'today':
        break;
      case 'yesterday':
        start.setDate(end.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case 'mtd':
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case 'ytd':
        start = new Date(end.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    const getLocalDateString = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startStr = getLocalDateString(start);
    const endStr = getLocalDateString(end);
    setTempStartDate(startStr);
    setTempEndDate(endStr);

    setStartMonth(start.getMonth());
    setStartYear(start.getFullYear());

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      const nextMonthDate = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      setEndMonth(nextMonthDate.getMonth());
      setEndYear(nextMonthDate.getFullYear());
    } else {
      setEndMonth(end.getMonth());
      setEndYear(end.getFullYear());
    }
  };

  const handleDaySelect = (dayNum, isStartCalendar) => {
    const month = isStartCalendar ? startMonth : endMonth;
    const year = isStartCalendar ? startYear : endYear;

    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const clickedDateStr = `${year}-${monthStr}-${dayStr}`;

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(clickedDateStr);
      setTempEndDate('');
      setTempPreset('custom');
    } else {
      if (clickedDateStr >= tempStartDate) {
        setTempEndDate(clickedDateStr);
        setTempPreset('custom');
      } else {
        setTempStartDate(clickedDateStr);
        setTempEndDate('');
        setTempPreset('custom');
      }
    }
  };

  const userName = user?.name || 'System Admin';
  const userRole = user?.role || 'Super Admin';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6868f9&color=fff&bold=true`;

  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatConciseDateString = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderCalendar = (isStartCalendar) => {
    const month = isStartCalendar ? startMonth : endMonth;
    const year = isStartCalendar ? startYear : endYear;
    const setMonth = isStartCalendar ? setStartMonth : setEndMonth;
    const setYear = isStartCalendar ? setStartYear : setEndYear;

    const handlePrev = () => {
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    };

    const handleNext = () => {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    };

    const daysInM = getDaysInMonth(year, month);
    const firstDayIdx = getFirstDayOfMonth(year, month);

    const daysArr = [];
    for (let i = 0; i < firstDayIdx; i++) {
      daysArr.push(null);
    }
    for (let d = 1; d <= daysInM; d++) {
      daysArr.push(d);
    }

    return (
      <div className="flex-1 space-y-2 select-none">
        <div className="text-center font-bold text-slate-400 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200/50 dark:border-white/5">
          {isStartCalendar ? 'Start Date' : 'End Date'}
        </div>

        {/* Month Selector Header */}
        <div className="flex items-center justify-between text-[11px] font-extrabold px-1 py-1">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 dark:text-slate-400 focus:outline-none transition-colors"
          >
            &lt;
          </button>
          <span className="text-slate-700 dark:text-slate-200">{monthNames[month].substring(0, 3)} {year}</span>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 dark:text-slate-400 focus:outline-none transition-colors"
          >
            &gt;
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400 uppercase">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="py-0.5">{d}</div>)}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysArr.map((dayNum, idx) => {
            if (dayNum === null) return <div key={`empty-${idx}`} />;

            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const cellDateStr = `${year}-${monthStr}-${dayStr}`;

            const isSelectedStart = cellDateStr === tempStartDate;
            const isSelectedEnd = cellDateStr === tempEndDate;
            const isSelected = isSelectedStart || isSelectedEnd;
            const isInRange = tempStartDate && tempEndDate && cellDateStr > tempStartDate && cellDateStr < tempEndDate;

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleDaySelect(dayNum, isStartCalendar)}
                className={`h-6 w-full text-[10px] font-bold font-mono rounded-md flex items-center justify-center cursor-pointer transition-all ${isSelected
                  ? 'bg-indigo-600 text-white font-extrabold shadow shadow-indigo-600/30'
                  : isInRange
                    ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-none'
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-cosmic-card border-b border-cosmic-border px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-between shrink-0 relative">

      {/* Background Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Background SVG Wave */}
        <div className="absolute inset-x-0 bottom-0 z-0 opacity-10 dark:opacity-5">
          {/* <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#6868f9" />
          </svg> */}
        </div>
      </div>

      <div className="flex items-center justify-between w-full relative z-10 gap-2">
        {/* Toggle + Title */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 sm:p-2 rounded-lg text-cosmic-muted hover:text-cosmic-text bg-cosmic-bg border border-cosmic-border lg:hidden transition-colors shrink-0"
          >
            <Menu size={16} />
          </button>

          <div className="flex flex-col min-w-0 flex-1 justify-center relative pb-1">
            <h1 className="text-[15px] sm:text-xl font-black text-slate-800 dark:text-white leading-tight truncate tracking-tight w-full">
              {title}
            </h1>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight hidden sm:block mt-0.5 truncate w-full">
              Astroved Enterprise BI Network
            </p>

            {/* Purple indicator line */}
            <div className="absolute -bottom-1 left-0 flex items-center space-x-1">
              <div className="h-[3px] w-8 bg-[#6868f9] rounded-full"></div>
              <div className="h-[3px] w-1 bg-[#6868f9]/50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Tools Row */}
        <div className="flex items-center space-x-1.5 sm:space-x-4 shrink-0 justify-end">
          
          {/* Daily Sales Calendar (Shown only when activeTab === daily) */}
          {isCalendarHidden && (currentModule === 'sales' || title?.toLowerCase().includes('sales')) && (
            <div className="relative shrink-0 flex items-center">
              <div className="flex items-center bg-white dark:bg-cosmic-bg border border-gray-200 dark:border-cosmic-border rounded-lg p-1 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <Calendar size={14} className="text-indigo-500 ml-2 mr-1" />
                <input
                  type="date"
                  className="bg-transparent border-none text-slate-700 dark:text-cosmic-text text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer px-1 sm:px-2 w-[105px] sm:w-auto"
                  value={tempDailyDate || ''}
                  onChange={(e) => setTempDailyDate(e.target.value)}
                  title="Select a specific date for Daily Insights"
                />
              </div>
              
              {tempDailyDate !== dailyDate && (
                <div className="absolute top-[calc(100%+8px)] right-0 md:left-0 md:right-auto flex items-center space-x-2 animate-fade-in bg-white dark:bg-slate-900 p-2 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 z-50">
                  <button
                    type="button"
                    onClick={() => setTempDailyDate(dailyDate)}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg border border-[#6868f9] text-[#6868f9] hover:bg-[#6868f9]/10 transition-all duration-200 shadow-sm whitespace-nowrap bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setDailyDate(tempDailyDate)}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg text-white bg-[#6868f9] hover:bg-[#5858e6] transition-all duration-200 shadow-md whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Global Calendar Selector Pill (Hidden on Executive Dashboard page) */}
          {!isCalendarHidden && currentModule !== 'executive' && currentModule !== 'operations' && !title?.toLowerCase().includes('executive') && (
            <div className="relative shrink-0" ref={dateMenuRef}>
              <button
                onClick={() => setDateMenuOpen(!dateMenuOpen)}
                className="flex items-center space-x-1 sm:space-x-2 bg-cosmic-bg hover:bg-cosmic-card-hover border border-cosmic-border px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-cosmic-text transition-colors focus:outline-none whitespace-nowrap cursor-pointer"
              >
                <Calendar size={13} className="text-cosmic-muted shrink-0" />
                <span className="hidden md:inline">{formatDateString(startDate)} - {formatDateString(endDate)}</span>
                <span className="hidden sm:inline md:hidden">{formatConciseDateString(startDate)} - {formatConciseDateString(endDate)}</span>
                <ChevronDown size={12} className="text-cosmic-muted ml-0.5 sm:ml-1 shrink-0" />
              </button>

              {dateMenuOpen && (
                <div className="fixed sm:absolute top-16 sm:top-auto right-2 sm:right-0 mt-2 w-[calc(100vw-16px)] sm:w-[540px] max-h-[calc(100vh-100px)] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 animate-slide-in-right">
                  {/* Header (AstroVed Colour banner style) */}
                  <div className="bg-[#6868F9] text-white p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="text-[11px] font-extrabold font-mono">
                      {formatDateString(tempStartDate) || 'Start Date'} - {formatDateString(tempEndDate) || 'End Date'}
                    </div>
                    <select
                      value={tempPreset}
                      onChange={(e) => handlePresetChange(e.target.value)}
                      className="bg-white/10 border border-white/20 text-white text-[11px] px-2 py-1 rounded-lg focus:outline-none cursor-pointer hover:bg-white/15 transition-colors w-full sm:w-auto"
                    >

                      <option value="30days" className="text-slate-800">Last 30 Days</option>
                      <option value="mtd" className="text-slate-800">This Month (MTD)</option>
                      <option value="ytd" className="text-slate-800">This Year (YTD)</option>
                      <option value="custom" className="text-slate-800">Custom Range</option>
                    </select>
                  </div>

                  {/* The bulky custom grids have been removed for a simpler native mobile experience */}

                  {/* Manual date inputs */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <div className="flex items-center justify-between sm:justify-start gap-1.5 w-full sm:w-auto">
                        <span className="text-[9px] text-slate-400 uppercase font-bold w-10 sm:w-auto">Start:</span>
                        <input
                          type="date"
                          value={tempStartDate || ''}
                          onChange={(e) => {
                            setTempStartDate(e.target.value);
                            setTempPreset('custom');
                          }}
                          className="flex-1 sm:flex-none px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-slate-800 dark:text-slate-100 focus:outline-none font-mono text-[10px]"
                        />
                      </div>
                      <div className="flex items-center justify-between sm:justify-start gap-1.5 w-full sm:w-auto">
                        <span className="text-[9px] text-slate-400 uppercase font-bold w-10 sm:w-auto">End:</span>
                        <input
                          type="date"
                          value={tempEndDate || ''}
                          onChange={(e) => {
                            setTempEndDate(e.target.value);
                            setTempPreset('custom');
                          }}
                          className="flex-1 sm:flex-none px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-slate-800 dark:text-slate-100 focus:outline-none font-mono text-[10px]"
                        />
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => setDateMenuOpen(false)}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10 bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate(tempStartDate);
                          setEndDate(tempEndDate);
                          selectPreset(tempPreset);
                          setDateMenuOpen(false);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg text-white bg-[#6868f9] hover:bg-[#6868f9] transition-all duration-200 cursor-pointer shadow-md"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">

            <button
              onClick={() => {
                if (onRefresh) onRefresh();
              }}
              title="Refresh Dashboard"
              className="p-1.5 sm:p-2 rounded-lg text-cosmic-muted hover:text-cosmic-text bg-cosmic-bg border border-cosmic-border transition-colors group"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>

            <button
              onClick={onToggleFullScreen}
              title="Full Screen Dashboard"
              className="p-1.5 sm:p-2 rounded-lg text-cosmic-muted hover:text-cosmic-text bg-cosmic-bg border border-cosmic-border transition-colors"
            >
              <Maximize size={14} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg text-cosmic-muted hover:text-cosmic-text bg-cosmic-bg border border-cosmic-border transition-colors"
            >
              {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>

          {/* Desktop Profile Info Card (Dropdown button) */}
          <div className="relative border-l border-cosmic-border pl-1.5 sm:pl-3 shrink-0" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-1.5 sm:space-x-2.5 hover:bg-cosmic-bg border border-transparent hover:border-cosmic-border p-1 sm:px-2 rounded-xl transition-all focus:outline-none"
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-cosmic-border shrink-0"
              />
              <div className="leading-tight hidden sm:block text-left max-w-[100px]">
                <span className="text-xs font-bold text-cosmic-text block truncate">{userName}</span>
                <span className="text-[9px] text-cosmic-muted block truncate">{userRole}</span>
              </div>
              <ChevronDown size={12} className="text-cosmic-muted ml-1 hidden sm:block shrink-0" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-1.5 z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 animate-slide-in-right">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-[calc(100%-12px)] mx-1.5 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold transition-all duration-200"
                >
                  <LogOut size={13} className="shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Activity Big Tab Modal */}
      {fullActivityOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-cosmic-card w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-cosmic-border animate-scale-in">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-cosmic-border flex items-center justify-between bg-slate-50 dark:bg-white/5 rounded-t-2xl">
              <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Bell size={20} className="text-[#6868F9]" />
                Full Activity Log
              </h2>
              <button
                onClick={() => setFullActivityOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-white dark:bg-cosmic-bg">
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map(notif => (
                    <div key={notif.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-white dark:bg-cosmic-card shadow-sm flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <Bell size={14} className="text-[#6868F9] dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-slate-500 text-sm">
                  No activity found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
