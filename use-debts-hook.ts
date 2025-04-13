// src/hooks/useDebts.ts
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface Payment {
  _id: string;
  amount: number;
  date: string;
  note?: string;
}

interface Debt {
  _id: string;
  creditor: string;
  amount: number;
  currency: 'CZK' | 'EUR' | 'USD';
  remainingAmount: number;
  description: string;
  dueDate?: string;
  isActive: boolean;
  priority: number;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

interface DebtFormData {
  creditor: string;
  amount: number;
  currency: 'CZK' | 'EUR' | 'USD';
  remainingAmount?: number;
  description: string;
  dueDate?: string;
  isActive: boolean;
  priority: number;
}

interface PaymentFormData {
  amount: number;
  date: string;
  note?: string;
}

interface UseDebtsReturn {
  debts: Debt[];
  totalDebt: number;
  activeDebts: Debt[];
  inactiveDebts: Debt[];
  overdueDebts: Debt[];
  addDebt: (data: DebtFormData & { payments: Payment[] }) => void;
  updateDebt: (id: string, data: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  addPayment: (debtId: string, payment: PaymentFormData) => void;
  updatePayment: (debtId: string, paymentId: string, payment: Partial<Payment>) => void;
  deletePayment: (debtId: string, paymentId: string) => void;
  handleAutomaticPayments: (availableAmount: number) => { 
    paymentsApplied: number;
    debtsUpdated: string[];
  };
}

export const useDebts = (): UseDebtsReturn => {
  // Načtení dluhů z localStorage
  const [debts, setDebts] = useLocalStorage<Debt[]>('debts', []);
  
  // Celková výše dluhu
  const [totalDebt, setTotalDebt] = useState(0);
  
  // Filtry dluhů
  const [activeDebts, setActiveDebts] = useState<Debt[]>([]);
  const [inactiveDebts, setInactiveDebts] = useState<Debt[]>([]);
  const [overdueDebts, setOverdueDebts] = useState<Debt[]>([]);
  
  // Aktualizace filtrů a celkové výše dluhu při změně debts
  useEffect(() => {
    const now = new Date();
    
    // Filtrování aktivních, neaktivních a po splatnosti dluhů
    const active = debts.filter(debt => debt.isActive);
    const inactive = debts.filter(debt => !debt.isActive);
    const overdue = debts.filter(debt => 
      debt.isActive && debt.dueDate && new Date(debt.dueDate) < now
    );
    
    setActiveDebts(active);
    setInactiveDebts(inactive);
    setOverdueDebts(overdue);
    
    // Výpočet celkové dlužné částky (pouze aktivní dluhy, převedeno na CZK)
    let total = 0;
    
    active.forEach(debt => {
      // Převod na CZK pro účely výpočtu (zjednodušené)
      let remainingAmount = debt.remainingAmount;
      
      if (debt.currency === 'EUR') {
        remainingAmount *= 25; // Přibližný kurz EUR/CZK
      } else if (debt.currency === 'USD') {
        remainingAmount *= 22; // Přibližný kurz USD/CZK
      }
      
      total += remainingAmount;
    });
    
    setTotalDebt(total);
  }, [debts]);
  
  // Přidání nového dluhu
  const addDebt = useCallback((data: DebtFormData & { payments: Payment[] }) => {
    const now = new Date().toISOString();
    
    // Vytvoření nového dluhu
    const newDebt: Debt = {
      _id: Date.now().toString(),
      ...data,
      remainingAmount: data.remainingAmount !== undefined ? data.remainingAmount : data.amount,
      payments: data.payments.map(payment => ({
        ...payment,
        _id: Date.now().toString() + Math.random().toString().slice(2, 8),
      })),
      createdAt: now,
      updatedAt: now,
    };
    
    // Uložení dluhu
    setDebts(prev => [...prev, newDebt]);
  }, [setDebts]);
  
  // Aktualizace dluhu
  const updateDebt = useCallback((id: string, data: Partial<Debt>) => {
    setDebts(prev => prev.map(debt => 
      debt._id === id 
        ? { ...debt, ...data, updatedAt: new Date().toISOString() } 
        : debt
    ));
  }, [setDebts]);
  
  // Odstranění dluhu
  const deleteDebt = useCallback((id: string) => {
    setDebts(prev => prev.filter(debt => debt._id !== id));
  }, [setDebts]);
  
  // Přidání splátky
  const addPayment = useCallback((debtId: string, payment: PaymentFormData) => {
    setDebts(prev => {
      return prev.map(debt => {
        if (debt._id === debtId) {
          // Vytvoření nové splátky
          const newPayment: Payment = {
            _id: Date.now().toString() + Math.random().toString().slice(2, 8),
            ...payment,
          };
          
          // Aktualizace zbývající částky
          const newRemainingAmount = Math.max(0, debt.remainingAmount - payment.amount);
          
          // Pokud je dluh zcela splacen, změníme isActive na false
          const isNowFullyPaid = newRemainingAmount === 0;
          
          return {
            ...debt,
            payments: [...debt.payments, newPayment],
            remainingAmount: newRemainingAmount,
            isActive: isNowFullyPaid ? false : debt.isActive,
            updatedAt: new Date().toISOString(),
          };
        }
        
        return debt;
      });
    });
  }, [setDebts]);
  
  // Aktualizace splátky
  const updatePayment = useCallback((debtId: string, paymentId: string, paymentData: Partial<Payment>) => {
    setDebts(prev => {
      return prev.map(debt => {
        if (debt._id === debtId) {
          // Zjištění původní částky splátky
          const originalPayment = debt.payments.find(p => p._id === paymentId);
          if (!originalPayment) return debt;
          
          // Výpočet rozdílu částky
          const amountDifference = (paymentData.amount !== undefined) 
            ? paymentData.amount - originalPayment.amount 
            : 0;
          
          // Aktualizace zbývající částky
          const newRemainingAmount = Math.max(0, debt.remainingAmount - amountDifference);
          
          // Aktualizace splátky
          const updatedPayments = debt.payments.map(payment => 
            payment._id === paymentId 
              ? { ...payment, ...paymentData } 
              : payment
          );
          
          // Pokud je dluh zcela splacen, změníme isActive na false
          const isNowFullyPaid = newRemainingAmount === 0;
          
          return {
            ...debt,
            payments: updatedPayments,
            remainingAmount: newRemainingAmount,
            isActive: isNowFullyPaid ? false : debt.isActive,
            updatedAt: new Date().toISOString(),
          };
        }
        
        return debt;
      });
    });
  }, [setDebts]);
  
  // Odstranění splátky
  const deletePayment = useCallback((debtId: string, paymentId: string) => {
    setDebts(prev => {
      return prev.map(debt => {
        if (debt._id === debtId) {
          // Zjištění částky splátky
          const payment = debt.payments.find(p => p._id === paymentId);
          if (!payment) return debt;
          
          // Aktualizace zbývající částky
          const newRemainingAmount = Math.min(debt.amount, debt.remainingAmount + payment.amount);
          
          // Odstranění splátky
          const updatedPayments = debt.payments.filter(payment => payment._id !== paymentId);
          
          return {
            ...debt,
            payments: updatedPayments,
            remainingAmount: newRemainingAmount,
            isActive: true, // Pokud odstraníme splátku, dluh je opět aktivní
            updatedAt: new Date().toISOString(),
          };
        }
        
        return debt;
      });
    });
  }, [setDebts]);
  
  // Automatické splácení dluhů
  const handleAutomaticPayments = useCallback((availableAmount: number) => {
    let remainingAmount = availableAmount;
    const debtsUpdated: string[] = [];
    let paymentsApplied = 0;
    
    // Pokud není k dispozici žádná částka, vrátíme prázdný výsledek
    if (availableAmount <= 0) {
      return { paymentsApplied: 0, debtsUpdated: [] };
    }
    
    // Seřazení aktivních dluhů podle priority
    const sortedDebts = [...activeDebts].sort((a, b) => a.priority - b.priority);
    
    // Procházení dluhů a aplikace splátek
    const updatedDebts = debts.map(debt => {
      // Pokud není dluh aktivní nebo nejsou prostředky, vrátíme dluh beze změny
      if (!debt.isActive || remainingAmount <= 0) {
        return debt;
      }
      
      // Najdeme dluh v seřazeném seznamu
      const sortedDebt = sortedDebts.find(sd => sd._id === debt._id);
      if (!sortedDebt) return debt;
      
      // Výpočet částky k zaplacení
      const paymentAmount = Math.min(remainingAmount, debt.remainingAmount);
      
      if (paymentAmount > 0) {
        // Vytvoření nové splátky
        const now = new Date().toISOString();
        const newPayment: Payment = {
          _id: Date.now().toString() + Math.random().toString().slice(2, 8),
          amount: paymentAmount,
          date: now,
          note: 'Automatická splátka',
        };
        
        // Aktualizace zbývající částky
        const newRemainingAmount = Math.max(0, debt.remainingAmount - paymentAmount);
        
        // Aktualizace dostupné částky
        remainingAmount -= paymentAmount;
        
        // Aktualizace počítadel
        debtsUpdated.push(debt._id);
        paymentsApplied += paymentAmount;
        
        // Pokud je dluh zcela splacen, změníme isActive na false
        const isNowFullyPaid = newRemainingAmount === 0;
        
        return {
          ...debt,
          payments: [...debt.payments, newPayment],
          remainingAmount: newRemainingAmount,
          isActive: isNowFullyPaid ? false : true,
          updatedAt: now,
        };
      }
      
      return debt;
    });
    
    // Aktualizace dluhů pouze pokud byly provedeny nějaké změny
    if (debtsUpdated.length > 0) {
      setDebts(updatedDebts);
    }
    
    return {
      paymentsApplied,
      debtsUpdated,
    };
  }, [debts, activeDebts, setDebts]);
  
  return {
    debts,
    totalDebt,
    activeDebts,
    inactiveDebts,
    overdueDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    addPayment,
    updatePayment,
    deletePayment,
    handleAutomaticPayments,
  };
};

export default useDebts;