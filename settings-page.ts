// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  Save, 
  UserCog, 
  CreditCard, 
  Bell, 
  FileDown, 
  FileUp, 
  Plus, 
  Trash2,
  X,
  BanknoteIcon,
  TagIcon,
  PercentIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  
  // State pro uživatelské nastavení
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // State pro finanční nastavení
  const [financialSettings, setFinancialSettings] = useState({
    hourlyRates: {
      maru: 275,
      marty: 400,
    },
    deductionRates: {
      maru: 33.33,
      marty: 50,
    },
    rentAmount: 24500,
    rentDueDay: 1,
  });
  
  // State pro kategorie příjmů a výdajů
  const [categories, setCategories] = useState({
    income: ['Výplata', 'Faktura', 'Dar', 'Vratka', 'Jiný příjem'],
    expense: ['Bydlení', 'Jídlo', 'Doprava', 'Zábava', 'Zdraví', 'Oblečení', 'Elektronika', 'Dárky', 'Dluh', 'Jiný výdaj'],
    work: ['programování', 'design', 'administrativa', 'marketing', 'konzultace'],
  });
  
  // State pro novou kategorii
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense' | 'work'>('income');
  
  // State pro notifikace
  const [notifications, setNotifications] = useState({
    debtReminders: true,
    lowBalanceAlert: true,
    lowBalanceThreshold: 5000,
  });
  
  // State pro zprávy
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Handlery pro změnu hodnot
  const handleProfileChange = (field: string, value: string) => {
    setProfileSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleFinancialChange = (field: string, value: any) => {
    const fields = field.split('.');
    if (fields.length === 1) {
      setFinancialSettings(prev => ({
        ...prev,
        [field]: value,
      }));
    } else if (fields.length === 2) {
      const [parent, child] = fields;
      setFinancialSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    }
  };
  
  const handleNotificationChange = (field: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handler pro přidání nové kategorie
  const addCategory = () => {
    if (!newCategory.trim()) return;
    
    setCategories(prev => ({
      ...prev,
      [categoryType]: [...prev[categoryType], newCategory.trim()],
    }));
    
    setNewCategory('');
  };
  
  // Handler pro odstranění kategorie
  const removeCategory = (type: 'income' | 'expense' | 'work', index: number) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };
  
  // Handler pro změnu hesla
  const handlePasswordChange = () => {
    // Reset chybových zpráv
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validace
    if (profileSettings.newPassword !== profileSettings.confirmPassword) {
      setErrorMessage('Hesla se neshodují.');
      return;
    }
    
    if (profileSettings.newPassword && profileSettings.newPassword.length < 6) {
      setErrorMessage('Heslo musí mít alespoň 6 znaků.');
      return;
    }
    
    if (!profileSettings.currentPassword) {
      setErrorMessage('Zadejte současné heslo.');
      return;
    }
    
    // Simulace úspěšné změny hesla
    setTimeout(() => {
      setSuccessMessage('Heslo bylo úspěšně změněno.');
      
      // Reset formuláře
      setProfileSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    }, 500);
  };
  
  // Handler pro uložení profilu
  const saveProfile = async () => {
    try {
      // Validace
      if (!profileSettings.name || !profileSettings.email) {
        setErrorMessage('Vyplňte jméno a email.');
        return;
      }
      
      // Aktualizace uživatele
      const success = await updateUser({
        name: profileSettings.name,
        email: profileSettings.email,
      });
      
      if (success) {
        setSuccessMessage('Profil byl úspěšně aktualizován.');
      } else {
        setErrorMessage('Nepodařilo se aktualizovat profil.');
      }
    } catch (error) {
      setErrorMessage('Při aktualizaci profilu došlo k chybě.');
    }
  };
  
  // Handler pro uložení finančního nastavení
  const saveFinancialSettings = () => {
    // Reset zpráv
    setErrorMessage('');
    setSuccessMessage('');
    
    // Zde by byla logika pro uložení do databáze
    // Pro demo účely pouze zobrazíme úspěšné uložení
    
    setTimeout(() => {
      setSuccessMessage('Finanční nastavení bylo uloženo.');
    }, 500);
  };
  
  // Handler pro uložení nastavení notifikací
  const saveNotificationSettings = () => {
    // Reset zpráv
    setErrorMessage('');
    setSuccessMessage('');
    
    // Pro demo účely pouze zobrazíme úspěšné uložení
    setTimeout(() => {
      setSuccessMessage('Nastavení notifikací bylo uloženo.');
    }, 500);
  };
  
  // Funkce pro export dat
  const exportData = () => {
    // Získání všech dat z localStorage
    const data = {
      finances: JSON.parse(localStorage.getItem('finances') || '[]'),
      workLogs: JSON.parse(localStorage.getItem('work-logs') || '[]'),
      debts: JSON.parse(localStorage.getItem('debts') || '[]'),
      settings: {
        financial: financialSettings,
        categories,
        notifications,
      },
    };
    
    // Vytvoření stahování
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "finance-app-export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    setSuccessMessage('Data byla exportována.');
  };
  
  // Funkce pro import dat
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Uložení dat do localStorage
        if (data.finances) localStorage.setItem('finances', JSON.stringify(data.finances));
        if (data.workLogs) localStorage.setItem('work-logs', JSON.stringify(data.workLogs));
        if (data.debts) localStorage.setItem('debts', JSON.stringify(data.debts));
        
        // Aktualizace state
        if (data.settings?.financial) setFinancialSettings(data.settings.financial);
        if (data.settings?.categories) setCategories(data.settings.categories);
        if (data.settings?.notifications) setNotifications(data.settings.notifications);
        
        setSuccessMessage('Data byla úspěšně importována. Obnovte stránku pro aktualizaci všech sekcí.');
      } catch (error) {
        setErrorMessage('Nepodařilo se načíst data. Ujistěte se, že soubor je ve správném formátu.');
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Nastavení</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <UserCog className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Finanční nastavení
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center">
            <TagIcon className="mr-2 h-4 w-4" />
            Kategorie
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notifikace
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center">
            <FileDown className="mr-2 h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>
        
        {/* Profil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Upravte své osobní údaje a heslo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              {successMessage && (
                <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                  <Check className="h-4 w-4 mr-2" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Jméno</Label>
                  <Input 
                    id="name" 
                    value={profileSettings.name} 
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileSettings.email} 
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                  />
                </div>
                
                <Button onClick={saveProfile} className="mt-2">
                  <Save className="mr-2 h-4 w-4" />
                  Uložit profil
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Změna hesla</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Současné heslo</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={profileSettings.currentPassword} 
                    onChange={(e) => handleProfileChange('currentPassword', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nové heslo</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={profileSettings.newPassword} 
                    onChange={(e) => handleProfileChange('newPassword', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={profileSettings.confirmPassword} 
                    onChange={(e) => handleProfileChange('confirmPassword', e.target.value)}
                  />
                </div>
                
                <Button onClick={handlePasswordChange} variant="outline" className="mt-2">
                  Změnit heslo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Finanční nastavení */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Finanční nastavení</CardTitle>
              <CardDescription>
                Nastavte hodinové sazby, srážky a další finanční parametry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {successMessage && (
                <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                  <Check className="h-4 w-4 mr-2" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <BanknoteIcon className="mr-2 h-5 w-5" />
                    Hodinové sazby
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRateMaru">Maruška (Kč/h)</Label>
                    <Input 
                      id="hourlyRateMaru" 
                      type="number" 
                      min="0"
                      value={financialSettings.hourlyRates.maru} 
                      onChange={(e) => handleFinancialChange('hourlyRates.maru', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRateMarty">Marty (Kč/h)</Label>
                    <Input 
                      id="hourlyRateMarty" 
                      type="number" 
                      min="0"
                      value={financialSettings.hourlyRates.marty} 
                      onChange={(e) => handleFinancialChange('hourlyRates.marty', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <PercentIcon className="mr-2 h-5 w-5" />
                    Srážky do společného rozpočtu
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deductionRateMaru">Maruška (%)</Label>
                    <Input 
                      id="deductionRateMaru" 
                      type="number" 
                      min="0"
                      max="100"
                      value={financialSettings.deductionRates.maru} 
                      onChange={(e) => handleFinancialChange('deductionRates.maru', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {financialSettings.deductionRates.maru}% = 1/{(100 / financialSettings.deductionRates.maru).toFixed(2)} z výdělku
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deductionRateMarty">Marty (%)</Label>
                    <Input 
                      id="deductionRateMarty" 
                      type="number" 
                      min="0"
                      max="100"
                      value={financialSettings.deductionRates.marty} 
                      onChange={(e) => handleFinancialChange('deductionRates.marty', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {financialSettings.deductionRates.marty}% = 1/{(100 / financialSettings.deductionRates.marty).toFixed(2)} z výdělku
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Nájem</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rentAmount">Částka nájmu (Kč)</Label>
                    <Input 
                      id="rentAmount" 
                      type="number" 
                      min="0"
                      value={financialSettings.rentAmount} 
                      onChange={(e) => handleFinancialChange('rentAmount', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rentDueDay">Den splatnosti</Label>
                    <Input 
                      id="rentDueDay" 
                      type="number" 
                      min="1"
                      max="31"
                      value={financialSettings.rentDueDay} 
                      onChange={(e) => handleFinancialChange('rentDueDay', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={saveFinancialSettings} className="mt-4">
                <Save className="mr-2 h-4 w-4" />
                Uložit finanční nastavení
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Kategorie */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Kategorie</CardTitle>
              <CardDescription>
                Správa kategorií pro příjmy, výdaje a aktivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {successMessage && (
                <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                  <Check className="h-4 w-4 mr-2" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center mb-4">
                <Input 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nová kategorie" 
                  className="mr-2"
                />
                
                <Select 
                  value={categoryType}
                  onValueChange={(value) => setCategoryType(value as any)}
                >
                  <SelectTrigger className="w-[180px] mr-2">
                    <SelectValue placeholder="Typ kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Příjem</SelectItem>
                    <SelectItem value="expense">Výdaj</SelectItem>
                    <SelectItem value="work">Práce</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={addCategory} disabled={!newCategory.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Přidat
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium mb-2">Kategorie příjmů</h3>
                  <div className="border rounded-md p-4 h-96 overflow-y-auto">
                    {categories.income.length === 0 ? (
                      <p className="text-muted-foreground text-center">Žádné kategorie</p>
                    ) : (
                      <div className="space-y-2">
                        {categories.income.map((category, index) => (
                          <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                            <span className="truncate">{category}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeCategory('income', index)}
                              className="h-7 w-7"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium mb-2">Kategorie výdajů</h3>
                  <div className="border rounded-md p-4 h-96 overflow-y-auto">
                    {categories.expense.length === 0 ? (
                      <p className="text-muted-foreground text-center">Žádné kategorie</p>
                    ) : (
                      <div className="space-y-2">
                        {categories.expense.map((category, index) => (
                          <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                            <span className="truncate">{category}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeCategory('expense', index)}
                              className="h-7 w-7"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium mb-2">Kategorie práce</h3>
                  <div className="border rounded-md p-4 h-96 overflow-y-auto">
                    {categories.work.length === 0 ? (
                      <p className="text-muted-foreground text-center">Žádné kategorie</p>
                    ) : (
                      <div className="space-y-2">
                        {categories.work.map((category, index) => (
                          <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                            <span className="truncate">{category}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeCategory('work', index)}
                              className="h-7 w-7"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button onClick={() => setSuccessMessage('Kategorie byly uloženy.')} className="mt-4">
                <Save className="mr-2 h-4 w-4" />
                Uložit kategorie
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifikace */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifikace</CardTitle>
              <CardDescription>
                Nastavení upozornění a připomínek
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {successMessage && (
                <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                  <Check className="h-4 w-4 mr-2" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debtReminders">Upozornění na splátky dluhů</Label>
                    <p className="text-sm text-muted-foreground">
                      Obdržíte upozornění před termínem splatnosti dluhu
                    </p>
                  </div>
                  <Switch
                    id="debtReminders"
                    checked={notifications.debtReminders}
                    onCheckedChange={(checked) => handleNotificationChange('debtReminders', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lowBalanceAlert">Upozornění na nízký zůstatek</Label>
                    <p className="text-sm text-muted-foreground">
                      Obdržíte upozornění, když zůstatek společného účtu klesne pod stanovenou hranici
                    </p>
                  </div>
                  <Switch
                    id="lowBalanceAlert"
                    checked={notifications.lowBalanceAlert}
                    onCheckedChange={(checked) => handleNotificationChange('lowBalanceAlert', checked)}
                  />
                </div>
                
                {notifications.lowBalanceAlert && (
                  <div className="ml-6 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="lowBalanceThreshold">Hranice nízkého zůstatku (Kč)</Label>
                      <Input 
                        id="lowBalanceThreshold" 
                        type="number" 
                        min="0"
                        value={notifications.lowBalanceThreshold} 
                        onChange={(e) => handleNotificationChange('lowBalanceThreshold', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <Button onClick={saveNotificationSettings} className="mt-4">
                <Save className="mr-2 h-4 w-4" />
                Uložit nastavení notifikací
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Data */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Správa dat</CardTitle>
              <CardDescription>
                Export a import dat aplikace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {successMessage && (
                <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                  <Check className="h-4 w-4 mr-2" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Export dat</h3>
                  <p className="text-sm text-muted-foreground">
                    Stáhněte si zálohu všech vašich dat
                  </p>
                  <Button onClick={exportData} className="w-full mt-2">
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportovat data
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Import dat</h3>
                  <p className="text-sm text-muted-foreground">
                    Nahrajte dříve exportovaná data
                  </p>
                  <div className="mt-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h3 className="font-medium text-destructive">Nebezpečná zóna</h3>
                <p className="text-sm text-muted-foreground">
                  Tyto akce jsou nevratné a mohou způsobit ztrátu dat
                </p>
                
                <Button 
                  variant="destructive" 
                  className="mt-2"
                  onClick={() => {
                    if (confirm('Opravdu chcete smazat všechna data aplikace? Tato akce je nevratná.')) {
                      localStorage.clear();
                      setSuccessMessage('Všechna data byla smazána. Pro kompletní vyčištění obnovte stránku.');
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Smazat všechna data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;