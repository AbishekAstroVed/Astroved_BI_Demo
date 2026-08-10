import React, { createContext, useContext, useState } from 'react';

const DateFilterContext = createContext();

export const useDateFilter = () => useContext(DateFilterContext);

export const DateFilterProvider = ({ children }) => {
  const [datePreset, setDatePreset] = useState('mtd'); // 'today', 'yesterday', '7days', '30days', 'mtd', 'ytd', 'custom'
  
  // Calculate default dates (MTD)
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [comparePreset, setComparePreset] = useState('previous'); // 'previous', 'lastYear'
  const [isCalendarHidden, setCalendarHidden] = useState(false);
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);

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

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
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
      startDate: compStart.toISOString().split('T')[0],
      endDate: compEnd.toISOString().split('T')[0]
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
