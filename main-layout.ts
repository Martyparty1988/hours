// src/components/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Home, 
  Clock, 
  WalletCards, 
  CreditCard, 
  Settings, 
  Menu, 
  LogOut, 
  User,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Navigační položky
  const navItems = [
    { label: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { label: 'Časovač', path: '/timer', icon: <Clock className="w-5 h-5" /> },
    { label: 'Finance', path: '/finances', icon: <WalletCards className="w-5 h-5" /> },
    { label: 'Dluhy', path: '/debts', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Nastavení', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];
  
  // Kontrola aktuální cesty pro zvýraznění aktivní položky
  const isActivePath = (path: string) => location.pathname === path;
  
  // Přepínání mezi světlým a tmavým režimem
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            {/* Mobilní menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <Link to="/" className="flex items-center space-x-2 font-bold text-xl" onClick={() => setIsMobileMenuOpen(false)}>
                      <WalletCards className="h-6 w-6" />
                      <span>Finance App</span>
                    </Link>
                  </div>
                  <nav className="flex-1 overflow-auto p-2">
                    {navItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center space-x-2 px-3 py-3 my-1 rounded-md transition-colors ${
                          isActivePath(item.path)
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    
                    <div className="mt-auto p-2">
                      <Button variant="ghost" className="w-full justify-start" onClick={toggleTheme}>
                        {theme === 'dark' ? (
                          <>
                            <Sun className="h-5 w-5 mr-2" />
                            <span>Světlý režim</span>
                          </>
                        ) : (
                          <>
                            <Moon className="h-5 w-5 mr-2" />
                            <span>Tmavý režim</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </nav>
                  <div className="p-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{user?.name || 'Uživatel'}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Logo a název aplikace */}
            <Link to="/" className="flex items-center space-x-2 md:ml-0 ml-2">
              <WalletCards className="h-6 w-6" />
              <span className="font-bold hidden sm:inline-block">Finance App</span>
            </Link>
            
            {/* Desktopová navigace */}
            <nav className="hidden md:flex items-center ml-8 space-x-2">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    isActivePath(item.path)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'hover:bg-muted hover:text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Pravá část headeru */}
          <div className="flex items-center space-x-2">
            {/* Přepínač světlý/tmavý režim */}
            <ThemeToggle />
            
            {/* Uživatelské menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name || 'Uživatel'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Nastavení</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Odhlásit se</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Hlavní obsah */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Patička */}
      <footer className="border-t bg-background p-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 Finance App. Všechna práva vyhrazena.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
              O aplikaci
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Ochrana soukromí
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Podmínky použití
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;