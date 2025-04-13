// src/utils/calculations.ts

/**
 * Výpočet srážky z výdělku
 */
export const calculateDeduction = (earnings: number, person: 'maru' | 'marty'): number => {
  const rates = {
    maru: 1/3,
    marty: 0.5
  };
  
  return Math.round(earnings * rates[person]);
};

/**
 * Výpočet čistého výdělku po srážce
 */
export const calculateNetEarnings = (earnings: number, person: 'maru' | 'marty'): number => {
  const deduction = calculateDeduction(earnings, person);
  return earnings - deduction;
};

/**
 * Výpočet výdělku z odpracovaného času
 */
export const calculateEarningsFromTime = (
  minutes: number, 
  hourlyRate: number
): number => {
  const hours = minutes / 60;
  return Math.round(hours * hourlyRate);
};

/**
 * Výpočet odpracovaného času mezi dvěma datumy s přestávkou
 */
export const calculateWorkedMinutes = (
  startTime: Date | string,
  endTime: Date | string,
  breakMinutes: number = 0
): number => {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  const totalMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  return Math.max(0, totalMinutes - breakMinutes);
};

/**
 * Převod měny na CZK (zjednodušený pro ukázku)
 */
export const convertToCZK = (amount: number, currency: string): number => {
  const rates = {
    'CZK': 1,
    'EUR': 25,
    'USD': 22
  };
  
  const rate = rates[currency as keyof typeof rates] || 1;
  return amount * rate;
};

/**
 * Výpočet procenta splácení dluhu
 */
export const calculateDebtPaymentPercentage = (
  originalAmount: number,
  remainingAmount: number
): number => {
  if (originalAmount === 0) return 0;
  return ((originalAmount - remainingAmount) / originalAmount) * 100;
};

/**
 * Výpočet denního limitu pro výdaje
 */
export const calculateDailyBudget = (
  monthlyBudget: number,
  daysInMonth: number
): number => {
  return monthlyBudget / daysInMonth;
};

/**
 * Výpočet měsíčního nájmu na den
 */
export const calculateDailyRent = (
  monthlyRent: number,
  daysInMonth: number
): number => {
  return monthlyRent / daysInMonth;
};

/**
 * Výpočet úroku
 */
export const calculateInterest = (
  principal: number,
  rate: number,
  years: number
): number => {
  // Jednoduchý úrok: principal * rate * years
  return principal * (rate / 100) * years;
};

/**
 * Výpočet splátek půjčky (anuita)
 */
export const calculateLoanPayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 100 / 12;
  const payments = years * 12;
  
  return (
    (principal * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -payments))
  );
};

/**
 * Výpočet zůstatku po splátce
 */
export const calculateRemainingAmount = (
  currentAmount: number,
  paymentAmount: number
): number => {
  return Math.max(0, currentAmount - paymentAmount);
};

/**
 * Výpočet rozdílu mezi příjmy a výdaji
 */
export const calculateNetCashFlow = (
  incomes: number[],
  expenses: number[]
): number => {
  const totalIncome = incomes.reduce((sum, income) => sum + income, 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense, 0);
  
  return totalIncome - totalExpense;
};

/**
 * Výpočet procentuálního rozdělení kategorií
 */
export const calculateCategoryPercentages = (
  categories: { [key: string]: number }
): { [key: string]: number } => {
  const total = Object.values(categories).reduce((sum, value) => sum + value, 0);
  
  if (total === 0) return {};
  
  const percentages: { [key: string]: number } = {};
  
  for (const [category, value] of Object.entries(categories)) {
    percentages[category] = (value / total) * 100;
  }
  
  return percentages;
};

/**
 * Výpočet průměrných denních výdajů
 */
export const calculateAverageDailyExpense = (
  expenses: { date: string; amount: number }[]
): number => {
  if (expenses.length === 0) return 0;
  
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Získání rozsahu dnů
  const dates = expenses.map(expense => new Date(expense.date).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  const days = Math.max(1, Math.round((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  return totalExpense / days;
};

/**
 * Projekce zůstatku za určité období
 */
export const projectBalance = (
  currentBalance: number,
  monthlyIncome: number,
  monthlyExpense: number,
  months: number
): number => {
  return currentBalance + (monthlyIncome - monthlyExpense) * months;
};

/**
 * Výpočet času potřebného ke splacení dluhu
 */
export const calculateMonthsToPayOffDebt = (
  debtAmount: number,
  monthlyPayment: number
): number => {
  if (monthlyPayment <= 0) return Infinity;
  return Math.ceil(debtAmount / monthlyPayment);
};