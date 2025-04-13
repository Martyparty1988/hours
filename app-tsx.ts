// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layouts/MainLayout';
import Dashboard from '@/pages/Dashboard';
import FinancesPage from '@/pages/FinancesPage';
import DebtsPage from '@/pages/DebtsPage';
import TimerPage from '@/pages/TimerPage';
import SettingsPage from '@/pages/SettingsPage';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import NotFound from '@/pages/NotFound';
import '@/globals.css';

// Komponenta pro ochranu cest
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Pokud ještě probíhá kontrola autentizace, zobrazíme loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }
  
  // Pokud uživatel není přihlášen, přesměrujeme na přihlašovací stránku
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Wrapper kolem aplikace pro poskytnutí kontextů
const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Veřejné cesty */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Chráněné cesty */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/timer" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <TimerPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/finances" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <FinancesPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/debts" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DebtsPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Stránka nenalezena */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

// Hlavní komponenta aplikace
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;