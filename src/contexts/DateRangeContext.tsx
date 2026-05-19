import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  resetToDefault: () => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  
  return {
    startDate: oneMonthAgo.toISOString().split('T')[0], // 1 month ago
    endDate: today.toISOString().split('T')[0] // Today
  };
};

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  const resetToDefault = () => {
    setDateRange(getDefaultDateRange());
  };

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange, resetToDefault }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}