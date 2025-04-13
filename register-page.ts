// src/pages/auth/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletCards, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  // State pro formulář
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Validace formuláře
  const validateForm = () => {
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Vyplňte prosím všechna pole.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Hesla se neshodují.');
      return false;
    }
    
    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků.');
      return false;
    }
    
    // Validace emailu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Zadejte prosím platnou emailovou adresu.');
      return false;
    }
    
    return true;
  };
  
  // Handler pro odeslání formuláře
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const success = await register(email, password, name);
      
      if (success) {
        setSuccess('Registrace proběhla úspěšně! Přesměrování...');
        
        // Přesměrování na dashboard po úspěšné registraci
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError('Registrace se nezdařila. Zkuste to prosím znovu.');
      }
    } catch (err) {
      setError('Při registraci došlo k chybě. Zkuste to prosím znovu.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <WalletCards className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Registrace</h1>
          <p className="text-muted-foreground">
            Vytvořte si účet pro správu rodinných financí
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Vytvořit účet</CardTitle>
            <CardDescription>
              Zadejte své údaje pro vytvoření nového účtu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                <Check className="h-4 w-4 mr-2" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Jméno</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Zadejte své jméno"
                  required
                />
              </div>
              
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
                <Label htmlFor="password">Heslo</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Alespoň 6 znaků"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Zadejte heslo znovu"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading || !!success}>
                {isLoading ? 'Registrace...' : 'Registrovat se'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-muted-foreground mt-2">
              Již máte účet?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Přihlaste se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;