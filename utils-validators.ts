// src/utils/validators.ts

/**
 * Validace emailu
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validace hesla (alespoň 6 znaků)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Validace silného hesla (alespoň 8 znaků, velké a malé písmeno, číslo)
 */
export const isStrongPassword = (password: string): boolean => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Validace shody hesel
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Validace jména (neprázdné)
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length > 0;
};

/**
 * Validace čísla (kladné)
 */
export const isPositiveNumber = (value: number): boolean => {
  return value > 0;
};

/**
 * Validace celého čísla
 */
export const isInteger = (value: number): boolean => {
  return Number.isInteger(value);
};

/**
 * Validace rozsahu čísla
 */
export const isNumberInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validace telefonního čísla (jednoduchá)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const regex = /^\+?[0-9]{9,15}$/;
  return regex.test(phone);
};

/**
 * Validace URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validace prazdého pole
 */
export const isNotEmpty = (value: string | any[]): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value.length > 0;
};

/**
 * Validace maximální délky textu
 */
export const isValidMaxLength = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength;
};

/**
 * Validace minimální délky textu
 */
export const isValidMinLength = (text: string, minLength: number): boolean => {
  return text.length >= minLength;
};

/**
 * Validace PSČ (česká)
 */
export const isValidCzechPostalCode = (postalCode: string): boolean => {
  const regex = /^[0-9]{3}\s?[0-9]{2}$/;
  return regex.test(postalCode);
};

/**
 * Validace IČO (české)
 */
export const isValidCzechCompanyId = (companyId: string): boolean => {
  const regex = /^[0-9]{8}$/;
  return regex.test(companyId);
};

/**
 * Validace DIČ (české)
 */
export const isValidCzechVatId = (vatId: string): boolean => {
  const regex = /^CZ[0-9]{8,10}$/;
  return regex.test(vatId);
};

/**
 * Validace data - zda je validní Date objekt
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validace rozsahu data
 */
export const isDateInRange = (date: Date, minDate: Date, maxDate: Date): boolean => {
  return date >= minDate && date <= maxDate;
};

/**
 * Validace věku (nad minimální věk)
 */
export const isOverAge = (birthDate: Date, minAge: number): boolean => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= minAge;
};