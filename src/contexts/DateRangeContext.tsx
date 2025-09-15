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

const getDefaultDateRange = (): DateRange => ({
  startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
  endDate: new Date().toISOString().split('T')[0] // Today
});

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