// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState } from 'react';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  familyId: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<boolean>;
}

// Vytvoření kontextu
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider komponenta
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ověření stavu autentizace při načtení aplikace
  useEffect(() => {
    // Zkontrolujeme localStorage, jestli existuje token a uživatel
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        // Parsujeme uložená data
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        // V případě chyby odstraníme data z localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    // Nastavíme isLoading na false, protože jsme dokončili kontrolu
    setIsLoading(false);
  }, []);

  // Funkce pro přihlášení
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Toto by mělo být nahrazeno skutečným API voláním
      // Pro demo účely simulujeme úspěšné přihlášení
      
      // Simulace API volání
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kontrola, zda se jedná o testovací účty
      if ((email === 'maru@example.com' && password === 'password') || 
          (email === 'marty@example.com' && password === 'password')) {
        
        // Vytvoření uživatelských dat
        const userData: User = {
          _id: email === 'maru@example.com' ? '1' : '2',
          email,
          name: email === 'maru@example.com' ? 'Maruška' : 'Marty',
          role: 'user',
          familyId: 'family1',
        };
        
        // Uložení do state
        setUser(userData);
        
        // Uložení do localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'demo-token');
        
        setIsLoading(false);
        return true;
      } else {
        // Nesprávné přihlašovací údaje
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Funkce pro registraci
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Toto by mělo být nahrazeno skutečným API voláním
      // Pro demo účely simulujeme úspěšnou registraci
      
      // Simulace API volání
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vytvoření nového uživatele
      const userData: User = {
        _id: Date.now().toString(),
        email,
        name,
        role: 'user',
        familyId: 'family1',
      };
      
      // Uložení do state
      setUser(userData);
      
      // Uložení do localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'demo-token');
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Funkce pro odhlášení
  const logout = () => {
    // Odstranění dat z localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Odstranění uživatele ze state
    setUser(null);
  };

  // Funkce pro aktualizaci uživatelských dat
  const updateUser = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Toto by mělo být nahrazeno skutečným API voláním
      // Pro demo účely simulujeme úspěšnou aktualizaci
      
      // Simulace API volání
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Aktualizace dat uživatele
      const updatedUser = { ...user, ...data };
      
      // Uložení do state
      setUser(updatedUser);
      
      // Uložení do localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  // Hodnoty kontextu
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;