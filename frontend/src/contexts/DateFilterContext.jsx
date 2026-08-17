import React, { createContext, useContext, useState } from 'react';

const DateFilterContext = createContext();

export const useDateFilter = () => useContext(DateFilterContext);

export const DateFilterProvider = ({ children }) => {
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate default dates
  const today = new Date();
  
  let initialPreset = 'mtd';
  let initialStart = new Date(today.getFullYear(), today.getMonth(), 1);
  let initialEnd = new Date(today);

  const savedPeriod = localStorage.getItem('astroved_report_period');
  if (savedPeriod) {
    switch(savedPeriod.toLowerCase()) {
      case 'daily':
        initialPreset = 'yesterday';
        initialStart = new Date(today);
        initialStart.setDate(initialStart.getDate() - 1);
        initialEnd = new Date(initialStart);
        break;
      case 'weekly':
        initialPreset = '7days';
        initialEnd = new Date(today);
        initialEnd.setDate(initialEnd.getDate() - 1);
        initialStart = new Date(initialEnd);
        initialStart.setDate(initialEnd.getDate() - 6);
        break;
      case 'monthly':
        initialPreset = '30days';
        initialEnd = new Date(today);
        initialEnd.setDate(initialEnd.getDate() - 1);
        initialStart = new Date(initialEnd);
        initialStart.setMonth(initialEnd.getMonth() - 1);
        break;
      case 'yearly':
        initialPreset = 'ytd';
        initialEnd = new Date(today);
        initialEnd.setDate(initialEnd.getDate() - 1);
        initialStart = new Date(initialEnd.getFullYear(), 0, 1);
        break;
    }
  }

  const [datePreset, setDatePreset] = useState(initialPreset); // 'today', 'yesterday', '7days', '30days', 'mtd', 'ytd', 'custom'
  
  const [startDate, setStartDate] = useState(getLocalDateString(initialStart));
  const [endDate, setEndDate] = useState(getLocalDateString(initialEnd));
  
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [comparePreset, setComparePreset] = useState('previous'); // 'previous', 'lastYear'
  const [isCalendarHidden, setCalendarHidden] = useState(false);
  const [dailyDate, setDailyDate] = useState(getLocalDateString(new Date()));

  const selectPreset = (preset) => {
    setDatePreset(preset);
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
        return; // Custom does not change dates automatically
    }

    setStartDate(getLocalDateString(start));
    setEndDate(getLocalDateString(end));
  };

  // Helper to calculate comparison dates
  const getCompareDates = () => {
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    const durationMs = currentEnd - currentStart;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    let compStart = new Date();
    let compEnd = new Date();

    if (comparePreset === 'previous') {
      compStart.setDate(currentStart.getDate() - durationDays);
      compEnd.setDate(currentStart.getDate() - 1);
    } else {
      // Last year
      compStart.setFullYear(currentStart.getFullYear() - 1);
      compEnd.setFullYear(currentEnd.getFullYear() - 1);
    }

    return {
      startDate: getLocalDateString(compStart),
      endDate: getLocalDateString(compEnd)
    };
  };

  return (
    <DateFilterContext.Provider value={{
      datePreset,
      startDate,
      endDate,
      compareEnabled,
      comparePreset,
      setStartDate,
      setEndDate,
      setCompareEnabled,
      setComparePreset,
      selectPreset,
      getCompareDates,
      isCalendarHidden,
      setCalendarHidden,
      dailyDate,
      setDailyDate
    }}>
      {children}
    </DateFilterContext.Provider>
  );
};
