// src/hooks/useFinances.ts
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface Finance {
  _id: string;
  type: 'income' | 'expense';
  account: 'maru' | 'marty' | 'shared';
  amount: number;
  currency: 'CZK' | 'EUR' | 'USD';
  offsetAmount?: number;
  finalAmount?: number;
  category: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringInterval?: 'monthly' | 'weekly' | 'daily';
  recurringDay?: number;
  createdAt: string;
  updatedAt: string;
}

interface WorkLog {
  _id: string;
  person: 'maru' | 'marty';
  date: string;
  earnings: number;
  deduction: number;
}

interface UseFinancesReturn {
  finances: Finance[];
  sharedBalance: number;
  personalBalances: {
    maru: number;
    marty: number;
  };
  expenses: Finance[];
  incomes: Finance[];
  addFinance: (finance: Omit<Finance, '_id' | 'createdAt' | 'updatedAt'>) => void;
  updateFinance: (id: string, finance: Partial<Finance>) => void;
  deleteFinance: (id: string) => void;
  processIncome: (income: Finance, workLogs: WorkLog[]) => Finance;
}

export const useFinances = (): UseFinancesReturn => {
  // Načtení financí z localStorage
  const [finances, setFinances] = useLocalStorage<Finance[]>('finances', []);
  
  // Stav pro bilance účtů
  const [sharedBalance, setSharedBalance] = useState(0);
  const [personalBalances, setPersonalBalances] = useState({
    maru: 0,
    marty: 0,
  });
  
  // Filtrování podle typu
  const expenses = finances.filter(f => f.type === 'expense');
  const incomes = finances.filter(f => f.type === 'income');

  // Výpočet zůstatků na účtech
  useEffect(() => {
    let shared = 0;
    let maru = 0;
    let marty = 0;
    
    finances.forEach(finance => {
      // Převod na CZK pro účely výpočtu (zjednodušené)
      let amount = finance.amount;
      if (finance.currency === 'EUR') {
        amount *= 25; // Přibližný kurz EUR/CZK
      } else if (finance.currency === 'USD') {
        amount *= 22; // Přibližný kurz USD/CZK
      }
      
      // Finální částka pro příjmy (po odečtení od výdělků)
      const finalAmount = finance.finalAmount !== undefined ? finance.finalAmount : amount;
      
      if (finance.type === 'income') {
        // Příjem - přičítáme
        if (finance.account === 'shared') {
          shared += finalAmount;
        } else if (finance.account === 'maru') {
          maru += finalAmount;
        } else if (finance.account === 'marty') {
          marty += finalAmount;
        }
      } else {
        // Výdaj - odečítáme
        if (finance.account === 'shared') {
          shared -= amount;
        } else if (finance.account === 'maru') {
          maru -= amount;
        } else if (finance.account === 'marty') {
          marty -= amount;
        }
      }
    });
    
    setSharedBalance(shared);
    setPersonalBalances({
      maru,
      marty,
    });
  }, [finances]);

  // Přidání nové transakce
  const addFinance = useCallback((financeData: Omit<Finance, '_id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    // Pro příjmy v CZK je potřeba zpracovat automatické odečítání od výdělků
    let processedFinance = {
      ...financeData,
      _id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    } as Finance;
    
    // Automatické odečítání příjmů v CZK od výdělků
    if (financeData.type === 'income' && financeData.currency === 'CZK') {
      const workLogs = JSON.parse(localStorage.getItem('work-logs') || '[]');
      processedFinance = processIncome(processedFinance, workLogs);
    }
    
    setFinances(prev => [...prev, processedFinance]);
    
    return processedFinance;
  }, [setFinances]);

  // Aktualizace transakce
  const updateFinance = useCallback((id: string, financeData: Partial<Finance>) => {
    setFinances(prev => prev.map(finance => 
      finance._id === id 
        ? { ...finance, ...financeData, updatedAt: new Date().toISOString() } 
        : finance
    ));
  }, [setFinances]);

  // Odstranění transakce
  const deleteFinance = useCallback((id: string) => {
    setFinances(prev => prev.filter(finance => finance._id !== id));
  }, [setFinances]);

  // Zpracování příjmu a automatické odečtení od výdělků
  const processIncome = useCallback((income: Finance, workLogs: WorkLog[]): Finance => {
    // Pro jiné měny než CZK se nic nemění
    if (income.currency !== 'CZK') {
      return { ...income, offsetAmount: 0, finalAmount: income.amount };
    }
    
    // Získání výdělků z daného dne
    const todayWorkLogs = workLogs.filter(log => log.date === income.date && log.person === income.account);
    const todayEarnings = todayWorkLogs.reduce((sum, log) => sum + log.earnings, 0);
    
    // Výpočet kolik se odečte
    const offsetAmount = Math.min(income.amount, todayEarnings);
    
    // Výsledná částka
    const finalAmount = income.amount - offsetAmount;
    
    return {
      ...income,
      offsetAmount,
      finalAmount
    };
  }, []);

  return {
    finances,
    sharedBalance,
    personalBalances,
    expenses,
    incomes,
    addFinance,
    updateFinance,
    deleteFinance,
    processIncome,
  };
};

export default useFinances;