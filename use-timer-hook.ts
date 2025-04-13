// src/hooks/useTimer.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { addWorkLog } from '@/services/worklog.service';

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedTime: number;
  person: 'maru' | 'marty';
  activity: string;
  hourlyRate: number;
  deductionRate: number;
}

// Hook pro správu časovače
export const useTimer = (workCategories: string[] = []) => {
  // Hodinové sazby a srážky
  const hourlyRates = {
    maru: 275,
    marty: 400,
  };
  
  const deductionRates = {
    maru: 1/3,
    marty: 0.5,
  };

  // Výchozí stav časovače
  const initialState: TimerState = {
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    person: 'maru',
    activity: workCategories[0] || 'programování',
    hourlyRate: hourlyRates.maru,
    deductionRate: deductionRates.maru,
  };

  // Používáme localStorage pro uložení stavu časovače
  const [timerState, setTimerState] = useLocalStorage<TimerState>('timer-state', initialState);
  
  // Referenci na interval pro aktualizaci časovače
  const intervalRef = useRef<number | null>(null);

  // Vypočítané hodnoty
  const [earnings, setEarnings] = useState({
    gross: 0,
    deduction: 0,
    net: 0,
  });

  // Efekt pro obnovu stavu časovače po načtení
  useEffect(() => {
    // Kontrola, zda byl časovač před obnovením stránky aktivní
    if (timerState.isRunning && timerState.startTime) {
      startTimer();
    }

    // Cleanup funkce
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Efekt pro výpočet výdělku
  useEffect(() => {
    // Výpočet výdělku
    const hours = timerState.elapsedTime / (1000 * 60 * 60);
    const grossEarnings = timerState.hourlyRate * hours;
    const deduction = grossEarnings * timerState.deductionRate;
    
    setEarnings({
      gross: Math.round(grossEarnings),
      deduction: Math.round(deduction),
      net: Math.round(grossEarnings - deduction),
    });
  }, [timerState.elapsedTime, timerState.hourlyRate, timerState.deductionRate]);

  // Spuštění časovače
  const startTimer = useCallback(() => {
    // Aktuální čas
    const now = Date.now();
    
    // Nastavení startTime, pokud ještě není
    if (!timerState.startTime) {
      setTimerState(prev => ({
        ...prev,
        startTime: now,
        isRunning: true,
      }));
    } else {
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
      }));
    }
    
    // Spuštění intervalu pro aktualizaci času
    intervalRef.current = window.setInterval(() => {
      setTimerState(prev => {
        if (prev.startTime && prev.isRunning) {
          const newElapsedTime = prev.elapsedTime + (Date.now() - (prev.startTime || Date.now()));
          return {
            ...prev,
            startTime: Date.now(),
            elapsedTime: newElapsedTime,
          };
        }
        return prev;
      });
    }, 1000);
  }, [timerState.startTime, setTimerState]);

  // Pauza časovače
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, [setTimerState]);

  // Zastavení a uložení časovače
  const stopTimer = useCallback(async () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Pokud je spuštěný časovač, uložíme záznam
    if (timerState.startTime && timerState.elapsedTime > 0) {
      try {
        const now = new Date();
        const startTime = new Date(now.getTime() - timerState.elapsedTime);
        
        // Výpočet hodnot pro uložení
        const workedMinutes = Math.round(timerState.elapsedTime / (1000 * 60));
        const hours = timerState.elapsedTime / (1000 * 60 * 60);
        const earnings = Math.round(timerState.hourlyRate * hours);
        const deduction = Math.round(earnings * timerState.deductionRate);
        
        // Vytvoření objektu záznamu
        const workLog = {
          person: timerState.person,
          date: new Date().toISOString().split('T')[0],
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
          breakMinutes: 0,
          workedMinutes,
          hourlyRate: timerState.hourlyRate,
          earnings,
          deduction,
          deductionRate: timerState.deductionRate,
          activity: timerState.activity,
        };
        
        // Uložení záznamu přes API
        // Odkomentujte pro připojení k API
        // await addWorkLog(workLog);
        
        // Pro offline testování ukládáme do localStorage
        const existingLogs = JSON.parse(localStorage.getItem('work-logs') || '[]');
        existingLogs.push({ ...workLog, _id: Date.now().toString() });
        localStorage.setItem('work-logs', JSON.stringify(existingLogs));
        
        console.log('Saved work log:', workLog);
      } catch (error) {
        console.error('Failed to save work log:', error);
      }
    }
    
    // Reset časovače
    setTimerState({
      ...initialState,
      person: timerState.person, // Zachováme vybranou osobu
      activity: timerState.activity, // Zachováme vybranou aktivitu
    });
  }, [timerState, setTimerState, initialState]);

  // Změna osoby
  const changePerson = useCallback((person: 'maru' | 'marty') => {
    if (timerState.isRunning) {
      return; // Nelze měnit osobu při běžícím časovači
    }
    
    setTimerState(prev => ({
      ...prev,
      person,
      hourlyRate: hourlyRates[person],
      deductionRate: deductionRates[person],
    }));
  }, [timerState.isRunning, setTimerState, hourlyRates, deductionRates]);

  // Změna aktivity
  const changeActivity = useCallback((activity: string) => {
    if (timerState.isRunning) {
      return; // Nelze měnit aktivitu při běžícím časovači
    }
    
    setTimerState(prev => ({
      ...prev,
      activity,
    }));
  }, [timerState.isRunning, setTimerState]);

  // Manuální přidání záznamu
  const addManualWorkLog = useCallback(async (manualLog: {
    person: 'maru' | 'marty';
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    activity: string;
    note?: string;
  }) => {
    try {
      const startDate = new Date(manualLog.startTime);
      const endDate = new Date(manualLog.endTime);
      
      // Výpočet odpracovaného času v minutách
      const totalMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
      const workedMinutes = totalMinutes - manualLog.breakMinutes;
      
      // Hodinová sazba a srážka podle osoby
      const hourlyRate = hourlyRates[manualLog.person];
      const deductionRate = deductionRates[manualLog.person];
      
      // Výpočet výdělku
      const hours = workedMinutes / 60;
      const earnings = Math.round(hourlyRate * hours);
      const deduction = Math.round(earnings * deductionRate);
      
      // Vytvoření objektu záznamu
      const workLog = {
        person: manualLog.person,
        date: manualLog.date,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        breakMinutes: manualLog.breakMinutes,
        workedMinutes,
        hourlyRate,
        earnings,
        deduction,
        deductionRate,
        activity: manualLog.activity,
        note: manualLog.note,
      };
      
      // Uložení záznamu přes API
      // await addWorkLog(workLog);
      
      // Pro offline testování ukládáme do localStorage
      const existingLogs = JSON.parse(localStorage.getItem('work-logs') || '[]');
      existingLogs.push({ ...workLog, _id: Date.now().toString() });
      localStorage.setItem('work-logs', JSON.stringify(existingLogs));
      
      console.log('Saved manual work log:', workLog);
      return true;
    } catch (error) {
      console.error('Failed to save manual work log:', error);
      return false;
    }
  }, [hourlyRates, deductionRates]);

  // Formátování času pro zobrazení
  const formatElapsedTime = () => {
    const totalSeconds = Math.floor(timerState.elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    // Stav časovače
    isRunning: timerState.isRunning,
    person: timerState.person,
    activity: timerState.activity,
    elapsedTime: timerState.elapsedTime,
    formattedTime: formatElapsedTime(),
    earnings,
    
    // Akce
    startTimer,
    pauseTimer,
    stopTimer,
    changePerson,
    changeActivity,
    addManualWorkLog,
  };
};

export default useTimer;