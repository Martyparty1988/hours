// src/utils/dateUtils.ts

/**
 * Získá aktuální datum ve formátu YYYY-MM-DD
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  return formatDateToYYYYMMDD(now);
};

/**
 * Formátuje datum na YYYY-MM-DD string
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formátuje datum na DD.MM.YYYY string
 */
export const formatDateToDDMMYYYY = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${day}.${month}.${year}`;
};

/**
 * Parsuje datum z YYYY-MM-DD stringu
 */
export const parseYYYYMMDDDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(part => parseInt(part, 10));
  return new Date(year, month - 1, day);
};

/**
 * Získá první den v měsíci
 */
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

/**
 * Získá poslední den v měsíci
 */
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

/**
 * Přidá dny k datu
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Přidá měsíce k datu
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Přidá roky k datu
 */
export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

/**
 * Získá rozdíl v dnech mezi dvěma daty
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Zkontroluje, zda je datum v minulosti
 */
export const isDateInPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Zkontroluje, zda je datum v budoucnosti
 */
export const isDateInFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > today;
};

/**
 * Zkontroluje, zda je datum dnešní
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Získá věk z data narození
 */
export const getAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Převede čas v milisekundách na formát objektu s hodinami, minutami a sekundami
 */
export const millisecondsToTimeObject = (milliseconds: number): { hours: number; minutes: number; seconds: number } => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { hours, minutes, seconds };
};

/**
 * Převede objekt s hodinami, minutami a sekundami na milisekundy
 */
export const timeObjectToMilliseconds = ({ hours, minutes, seconds }: { hours: number; minutes: number; seconds: number }): number => {
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

/**
 * Získá dny v měsíci
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Získá pole všech dnů v měsíci
 */
export const getAllDaysInMonth = (year: number, month: number): Date[] => {
  const days = [];
  const daysInMonth = getDaysInMonth(year, month);
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
};

/**
 * Získá pole pracovních dnů v měsíci (pondělí až pátek)
 */
export const getWeekdaysInMonth = (year: number, month: number): Date[] => {
  const allDays = getAllDaysInMonth(year, month);
  return allDays.filter(date => date.getDay() !== 0 && date.getDay() !== 6);
};

/**
 * Získá pole víkendových dnů v měsíci (sobota a neděle)
 */
export const getWeekendsInMonth = (year: number, month: number): Date[] => {
  const allDays = getAllDaysInMonth(year, month);
  return allDays.filter(date => date.getDay() === 0 || date.getDay() === 6);
};