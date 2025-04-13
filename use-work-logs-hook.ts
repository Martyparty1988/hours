// src/hooks/useWorkLogs.ts
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface WorkLog {
  _id: string;
  person: 'maru' | 'marty';
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  workedMinutes: number;
  hourlyRate: number;
  earnings: number;
  deduction: number;
  deductionRate: number;
  activity: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkLogFormData {
  person: 'maru' | 'marty';
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  activity: string;
  note?: string;
}

interface TotalEarnings {
  maru: {
    gross: number;
    net: number;
    deduction: number;
  };
  marty: {
    gross: number;
    net: number;
    deduction: number;
  };
}

interface TotalWorkTime {
  maru: number;
  marty: number;
  total: number;
}

interface UseWorkLogsReturn {
  workLogs: WorkLog[];
  filteredLogs: WorkLog[];
  totalEarnings: TotalEarnings;
  totalWorkTime: TotalWorkTime;
  currentMonthStats: {
    earnings: TotalEarnings;
    workTime: TotalWorkTime;
    activities: Record<string, number>;
  };
  addWorkLog: (data: WorkLogFormData) => Promise<WorkLog>;
  updateWorkLog: (id: string, data: Partial<WorkLog>) => Promise<void>;
  deleteWorkLog: (id: string) => Promise<void>;
  filterLogs: (filters: {
    person?: 'maru' | 'marty' | 'all';
    dateFrom?: string;
    dateTo?: string;
    activity?: string;
  }) => void;
}

export const useWorkLogs = (): UseWorkLogsReturn => {
  // Načtení pracovních záznamů z localStorage
  const [workLogs, setWorkLogs] = useLocalStorage<WorkLog[]>('work-logs', []);
  
  // Filtrované záznamy
  const [filteredLogs, setFilteredLogs] = useState<WorkLog[]>(workLogs);
  
  // Statistiky výdělků
  const [totalEarnings, setTotalEarnings] = useState<TotalEarnings>({
    maru: { gross: 0, net: 0, deduction: 0 },
    marty: { gross: 0, net: 0, deduction: 0 },
  });
  
  // Statistiky odpracovaného času
  const [totalWorkTime, setTotalWorkTime] = useState<TotalWorkTime>({
    maru: 0,
    marty: 0,
    total: 0,
  });
  
  // Statistiky pro aktuální měsíc
  const [currentMonthStats, setCurrentMonthStats] = useState({
    earnings: {
      maru: { gross: 0, net: 0, deduction: 0 },
      marty: { gross: 0, net: 0, deduction: 0 },
    },
    workTime: {
      maru: 0,
      marty: 0,
      total: 0,
    },
    activities: {} as Record<string, number>,
  });
  
  // Aktualizace filtrovaných záznamů při změně workLogs
  useEffect(() => {
    setFilteredLogs(workLogs);
  }, [workLogs]);
  
  // Výpočet statistik při změně filtrovaných záznamů
  useEffect(() => {
    calculateTotalEarnings();
    calculateTotalWorkTime();
    calculateCurrentMonthStats();
  }, [filteredLogs]);
  
  // Výpočet celkových výdělků
  const calculateTotalEarnings = () => {
    const earnings = {
      maru: { gross: 0, net: 0, deduction: 0 },
      marty: { gross: 0, net: 0, deduction: 0 },
    };
    
    filteredLogs.forEach(log => {
      earnings[log.person].gross += log.earnings;
      earnings[log.person].deduction += log.deduction;
      earnings[log.person].net += (log.earnings - log.deduction);
    });
    
    setTotalEarnings(earnings);
  };
  
  // Výpočet celkového odpracovaného času
  const calculateTotalWorkTime = () => {
    const workTime = {
      maru: 0,
      marty: 0,
      total: 0,
    };
    
    filteredLogs.forEach(log => {
      const hours = log.workedMinutes / 60;
      workTime[log.person] += hours;
      workTime.total += hours;
    });
    
    setTotalWorkTime(workTime);
  };
  
  // Výpočet statistik pro aktuální měsíc
  const calculateCurrentMonthStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrování záznamů pro aktuální měsíc
    const monthLogs = workLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });
    
    // Výpočet výdělků pro aktuální měsíc
    const earnings = {
      maru: { gross: 0, net: 0, deduction: 0 },
      marty: { gross: 0, net: 0, deduction: 0 },
    };
    
    monthLogs.forEach(log => {
      earnings[log.person].gross += log.earnings;
      earnings[log.person].deduction += log.deduction;
      earnings[log.person].net += (log.earnings - log.deduction);
    });
    
    // Výpočet odpracovaného času pro aktuální měsíc
    const workTime = {
      maru: 0,
      marty: 0,
      total: 0,
    };
    
    monthLogs.forEach(log => {
      const hours = log.workedMinutes / 60;
      workTime[log.person] += hours;
      workTime.total += hours;
    });
    
    // Výpočet aktivit pro aktuální měsíc
    const activities: Record<string, number> = {};
    
    monthLogs.forEach(log => {
      if (!activities[log.activity]) {
        activities[log.activity] = 0;
      }
      
      activities[log.activity] += log.workedMinutes;
    });
    
    setCurrentMonthStats({
      earnings,
      workTime,
      activities,
    });
  };
  
  // Přidání nového pracovního záznamu
  const addWorkLog = useCallback(async (data: WorkLogFormData): Promise<WorkLog> => {
    // Výpočet odpracovaného času
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);
    const totalMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    const workedMinutes = totalMinutes - data.breakMinutes;
    
    // Hodinové sazby a srážky
    const hourlyRates = {
      maru: 275,
      marty: 400,
    };
    
    const deductionRates = {
      maru: 1/3,
      marty: 0.5,
    };
    
    // Výpočet výdělku
    const hourlyRate = hourlyRates[data.person];
    const deductionRate = deductionRates[data.person];
    const hours = workedMinutes / 60;
    const earnings = Math.round(hourlyRate * hours);
    const deduction = Math.round(earnings * deductionRate);
    
    const now = new Date().toISOString();
    
    // Vytvoření nového záznamu
    const newWorkLog: WorkLog = {
      _id: Date.now().toString(),
      ...data,
      workedMinutes,
      hourlyRate,
      earnings,
      deduction,
      deductionRate,
      createdAt: now,
      updatedAt: now,
    };
    
    // Uložení záznamu
    setWorkLogs(prev => [...prev, newWorkLog]);
    
    return newWorkLog;
  }, [setWorkLogs]);
  
  // Aktualizace pracovního záznamu
  const updateWorkLog = useCallback(async (id: string, data: Partial<WorkLog>): Promise<void> => {
    setWorkLogs(prev => {
      return prev.map(log => {
        if (log._id === id) {
          // Přepočítání hodnot, pokud se změnily klíčové údaje
          let updatedLog = { ...log, ...data, updatedAt: new Date().toISOString() };
          
          // Pokud se změnila osoba, čas nebo přestávka, přepočítáme výdělek
          if (
            data.person !== undefined || 
            data.startTime !== undefined || 
            data.endTime !== undefined || 
            data.breakMinutes !== undefined
          ) {
            // Hodinové sazby a srážky
            const hourlyRates = {
              maru: 275,
              marty: 400,
            };
            
            const deductionRates = {
              maru: 1/3,
              marty: 0.5,
            };
            
            // Aktualizace hodinové sazby a srážky při změně osoby
            if (data.person !== undefined) {
              updatedLog.hourlyRate = hourlyRates[data.person];
              updatedLog.deductionRate = deductionRates[data.person];
            }
            
            // Přepočítání odpracovaného času, pokud se změnil začátek, konec nebo přestávka
            if (data.startTime !== undefined || data.endTime !== undefined || data.breakMinutes !== undefined) {
              const startDate = new Date(data.startTime || log.startTime);
              const endDate = new Date(data.endTime || log.endTime);
              const totalMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
              updatedLog.workedMinutes = totalMinutes - (data.breakMinutes || log.breakMinutes);
            }
            
            // Přepočítání výdělku
            const hours = updatedLog.workedMinutes / 60;
            updatedLog.earnings = Math.round(updatedLog.hourlyRate * hours);
            updatedLog.deduction = Math.round(updatedLog.earnings * updatedLog.deductionRate);
          }
          
          return updatedLog;
        }
        
        return log;
      });
    });
  }, [setWorkLogs]);
  
  // Odstranění pracovního záznamu
  const deleteWorkLog = useCallback(async (id: string): Promise<void> => {
    setWorkLogs(prev => prev.filter(log => log._id !== id));
  }, [setWorkLogs]);
  
  // Filtrování záznamů
  const filterLogs = useCallback((filters: {
    person?: 'maru' | 'marty' | 'all';
    dateFrom?: string;
    dateTo?: string;
    activity?: string;
  }) => {
    let filtered = [...workLogs];
    
    // Filtrování podle osoby
    if (filters.person && filters.person !== 'all') {
      filtered = filtered.filter(log => log.person === filters.person);
    }
    
    // Filtrování podle data od
    if (filters.dateFrom) {
      filtered = filtered.filter(log => log.date >= filters.dateFrom!);
    }
    
    // Filtrování podle data do
    if (filters.dateTo) {
      filtered = filtered.filter(log => log.date <= filters.dateTo!);
    }
    
    // Filtrování podle aktivity
    if (filters.activity) {
      filtered = filtered.filter(log => log.activity === filters.activity);
    }
    
    setFilteredLogs(filtered);
  }, [workLogs]);
  
  return {
    workLogs,
    filteredLogs,
    totalEarnings,
    totalWorkTime,
    currentMonthStats,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    filterLogs,
  };
};

export default useWorkLogs;