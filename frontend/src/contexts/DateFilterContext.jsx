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
  let initialDailyDate = new Date(today);

  const savedPeriod = localStorage.getItem('astroved_report_period');
  if (savedPeriod) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    switch(savedPeriod.toLowerCase()) {
      case 'daily':
        initialPreset = 'yesterday';
        initialStart = new Date(yesterday);
        initialEnd = new Date(yesterday);
        initialDailyDate = new Date(yesterday);
        break;
      case 'weekly':
        initialPreset = 'custom';
        initialEnd = new Date(yesterday);
        // Start of week (Sunday)
        initialStart = new Date(today);
        initialStart.setDate(today.getDate() - today.getDay());
        break;
      case 'monthly':
        initialPreset = 'custom';
        initialEnd = new Date(yesterday);
        // Start of month
        initialStart = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'yearly':
        initialPreset = 'custom';
        initialEnd = new Date(yesterday);
        // Start of year
        initialStart = new Date(today.getFullYear(), 0, 1);
        break;
    }
  }

  const [datePreset, setDatePreset] = useState(initialPreset); // 'today', 'yesterday', '7days', '30days', 'mtd', 'ytd', 'custom'
  
  const [startDate, setStartDate] = useState(getLocalDateString(initialStart));
  const [endDate, setEndDate] = useState(getLocalDateString(initialEnd));
  
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [comparePreset, setComparePreset] = useState('previous'); // 'previous', 'lastYear'
  const [isCalendarHidden, setCalendarHidden] = useState(false);
  const [dailyDate, setDailyDate] = useState(getLocalDateString(initialDailyDate));

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
