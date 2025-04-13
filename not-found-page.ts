// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="rounded-full bg-yellow-100 p-3 w-16 h-16 mx-auto flex items-center justify-center dark:bg-yellow-900/20">
          <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-medium">Stránka nenalezena</h2>
        
        <p className="text-muted-foreground">
          Omlouváme se, ale stránka, kterou hledáte, neexistuje nebo byla přesunuta.
        </p>
        
        <div className="pt-4">
          <Link to="/">
            <Button className="mx-auto">
              <Home className="mr-2 h-4 w-4" />
              Zpět na hlavní stránku
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;