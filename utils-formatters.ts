// src/utils/formatters.ts

/**
 * Formátování času v milisekundách na formát HH:MM:SS
 */
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Formátování času v minutách na formát H h M min
 */
export const formatMinutesToHoursAndMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} min`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  
  return `${hours} h ${remainingMinutes} min`;
};

/**
 * Formátování částky jako měny
 */
export const formatCurrency = (amount: number, currency: string = 'CZK'): string => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formátování data na lokální formát
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('cs-CZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
};

/**
 * Formátování data a času na lokální formát
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('cs-CZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Získání názvu měsíce
 */
export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
  ];
  
  return months[monthIndex];
};

/**
 * Získání zkráceného názvu měsíce
 */
export const getShortMonthName = (monthIndex: number): string => {
  const months = [
    'Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn',
    'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'
  ];
  
  return months[monthIndex];
};

/**
 * Zkrácení textu s elipsou
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Přidání ordinálního sufixu k číslu (1. 2. 3. atd.)
 */
export const addOrdinalSuffix = (number: number): string => {
  return `${number}.`;
};

/**
 * Formátování procenta
 */
export const formatPercentage = (value: number, decimalPlaces: number = 0): string => {
  return `${value.toFixed(decimalPlaces)} %`;
};

/**
 * Generování náhodné barvy (pro grafy)
 */
export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Převod ISO datumu na lokální datum ve formátu YYYY-MM-DD
 */
export const isoToLocalDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Převod lokálního datumu ve formátu YYYY-MM-DD na ISO datum
 */
export const localDateToIso = (localDate: string): string => {
  return new Date(localDate).toISOString();
};

/**
 * Formátování částky pro zobrazení s oddělením tisíců
 */
export const formatNumberWithSeparator = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};