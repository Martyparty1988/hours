// src/pages/auth/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletCards, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  // State pro formulář
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Handler pro odeslání formuláře
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Vyplňte prosím email a heslo.');
      return;
    }
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Přesměrování na domovskou stránku po úspěšném přihlášení
        navigate('/');
      } else {
        setError('Nesprávné přihlašovací údaje. Zkuste to prosím znovu.');
      }
    } catch (err) {
      setError('Při přihlašování došlo k chybě. Zkuste to prosím znovu.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <WalletCards className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Přihlášení</h1>
          <p className="text-muted-foreground">
            Zadejte své přihlašovací údaje pro přístup k aplikaci
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Přihlásit se</CardTitle>
            <CardDescription>
              Pro testovací účely použijte:
              <br />
              Email: maru@example.com nebo marty@example.com
              <br />
              Heslo: password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vas@email.cz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Heslo</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Zapomenuté heslo?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-muted-foreground mt-2">
              Nemáte účet?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Zaregistrujte se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;