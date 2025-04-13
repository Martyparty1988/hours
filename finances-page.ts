// src/pages/FinancesPage.tsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, RefreshCw, FileDown, ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import useFinances from '@/hooks/useFinances';

const categories = {
  income: ['Výplata', 'Faktura', 'Dar', 'Vratka', 'Jiný příjem'],
  expense: ['Bydlení', 'Jídlo', 'Doprava', 'Zábava', 'Zdraví', 'Oblečení', 'Elektronika', 'Dárky', 'Dluh', 'Jiný výdaj']
};

interface FinanceFormData {
  type: 'income' | 'expense';
  account: 'maru' | 'marty' | 'shared';
  amount: number;
  currency: 'CZK' | 'EUR' | 'USD';
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringInterval?: 'monthly' | 'weekly' | 'daily';
  recurringDay?: number;
}

const FinancesPage: React.FC = () => {
  // Hooks pro finance
  const { 
    finances, 
    sharedBalance, 
    personalBalances, 
    addFinance, 
    deleteFinance, 
    updateFinance 
  } = useFinances();
  
  // State pro formulář
  const [formData, setFormData] = useState<FinanceFormData>({
    type: 'income',
    account: 'maru',
    amount: 0,
    currency: 'CZK',
    category: categories.income[0],
    description: '',
    date: new Date(),
    isRecurring: false
  });
  
  // State pro filtrování
  const [financeFilter, setFinanceFilter] = useState({
    type: 'all',
    account: 'all',
    dateRange: null as DateRange | null,
    searchTerm: '',
  });
  
  // State pro dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Filtrované transakce
  const [filteredFinances, setFilteredFinances] = useState(finances);
  
  // Efekt pro filtrování financí
  useEffect(() => {
    let filtered = [...finances];
    
    // Filtrování podle typu (příjem/výdaj)
    if (financeFilter.type !== 'all') {
      filtered = filtered.filter(item => item.type === financeFilter.type);
    }
    
    // Filtrování podle účtu
    if (financeFilter.account !== 'all') {
      filtered = filtered.filter(item => item.account === financeFilter.account);
    }
    
    // Filtrování podle data
    if (financeFilter.dateRange && financeFilter.dateRange.from) {
      const from = new Date(financeFilter.dateRange.from);
      from.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= from;
      });
      
      if (financeFilter.dateRange.to) {
        const to = new Date(financeFilter.dateRange.to);
        to.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate <= to;
        });
      }
    }
    
    // Filtrování podle vyhledávacího výrazu
    if (financeFilter.searchTerm) {
      const term = financeFilter.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(term) || 
        item.category.toLowerCase().includes(term)
      );
    }
    
    // Seřazení podle data (nejnovější první)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredFinances(filtered);
  }, [finances, financeFilter]);
  
  // Handler pro změnu formuláře
  const handleFormChange = (field: keyof FinanceFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Aktualizace kategorií podle typu transakce
      if (field === 'type') {
        newData.category = value === 'income' ? categories.income[0] : categories.expense[0];
      }
      
      return newData;
    });
  };
  
  // Handler pro odeslání formuláře
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vytvoření objektu transakce
    const financeItem = {
      ...formData,
      date: formData.date.toISOString().split('T')[0],
      amount: Number(formData.amount)
    };
    
    // Přidání transakce
    addFinance(financeItem);
    
    // Reset formuláře a zavření dialogu
    setFormData({
      type: 'income',
      account: 'maru',
      amount: 0,
      currency: 'CZK',
      category: categories.income[0],
      description: '',
      date: new Date(),
      isRecurring: false
    });
    
    setIsDialogOpen(false);
  };
  
  // Funkce pro export dat
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finances));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `finance-export-${format(new Date(), 'yyyy-MM-dd')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4 sm:mb-0">Finance</h1>
        
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Přidat transakci
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Přidat novou transakci</DialogTitle>
                  <DialogDescription>
                    Vyplňte detaily transakce a klikněte na tlačítko uložit.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="transactionType">Typ transakce</Label>
                    <RadioGroup 
                      id="transactionType" 
                      value={formData.type}
                      onValueChange={(value) => handleFormChange('type', value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="income" id="income" />
                        <Label htmlFor="income" className="font-normal cursor-pointer">Příjem</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expense" id="expense" />
                        <Label htmlFor="expense" className="font-normal cursor-pointer">Výdaj</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="account">Účet</Label>
                    <Select 
                      value={formData.account}
                      onValueChange={(value) => handleFormChange('account', value)}
                    >
                      <SelectTrigger id="account">
                        <SelectValue placeholder="Vyberte účet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maru">Maruška</SelectItem>
                        <SelectItem value="marty">Marty</SelectItem>
                        <SelectItem value="shared">Společný</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="amount">Částka</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount || ''}
                        onChange={(e) => handleFormChange('amount', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="currency">Měna</Label>
                      <Select 
                        value={formData.currency}
                        onValueChange={(value) => handleFormChange('currency', value)}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Vyberte měnu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CZK">CZK</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="category">Kategorie</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(value) => handleFormChange('category', value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Vyberte kategorii" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.type === 'income'
                          ? categories.income.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))
                          : categories.expense.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="description">Popis</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Zadejte popis transakce"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="date">Datum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, 'PP') : "Vyberte datum"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => handleFormChange('date', date || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) => handleFormChange('isRecurring', checked)}
                    />
                    <Label htmlFor="recurring">Opakovaná platba</Label>
                  </div>
                  
                  {formData.isRecurring && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="recurringInterval">Interval opakování</Label>
                        <Select 
                          value={formData.recurringInterval || 'monthly'}
                          onValueChange={(value) => handleFormChange('recurringInterval', value)}
                        >
                          <SelectTrigger id="recurringInterval">
                            <SelectValue placeholder="Vyberte interval" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Denně</SelectItem>
                            <SelectItem value="weekly">Týdně</SelectItem>
                            <SelectItem value="monthly">Měsíčně</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {formData.recurringInterval === 'monthly' && (
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="recurringDay">Den v měsíci</Label>
                          <Input
                            id="recurringDay"
                            type="number"
                            min="1"
                            max="31"
                            value={formData.recurringDay || ''}
                            onChange={(e) => handleFormChange('recurringDay', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button type="submit">Uložit transakci</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={exportData}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PiggyBank className="mr-2 h-5 w-5 text-primary" />
              Společný rozpočet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sharedBalance.toLocaleString()} Kč</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-primary" />
              Účet Marušky
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{personalBalances.maru.toLocaleString()} Kč</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-primary" />
              Účet Martyho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{personalBalances.marty.toLocaleString()} Kč</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Historie transakcí</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="filterType">Typ</Label>
              <Select 
                value={financeFilter.type}
                onValueChange={(value) => setFinanceFilter(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="filterType">
                  <SelectValue placeholder="Všechny typy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny typy</SelectItem>
                  <SelectItem value="income">Příjmy</SelectItem>
                  <SelectItem value="expense">Výdaje</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filterAccount">Účet</Label>
              <Select 
                value={financeFilter.account}
                onValueChange={(value) => setFinanceFilter(prev => ({ ...prev, account: value }))}
              >
                <SelectTrigger id="filterAccount">
                  <SelectValue placeholder="Všechny účty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny účty</SelectItem>
                  <SelectItem value="maru">Maruška</SelectItem>
                  <SelectItem value="marty">Marty</SelectItem>
                  <SelectItem value="shared">Společný</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Období</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {financeFilter.dateRange?.from ? (
                      financeFilter.dateRange.to ? (
                        <>
                          {format(financeFilter.dateRange.from, 'P')} - {format(financeFilter.dateRange.to, 'P')}
                        </>
                      ) : (
                        format(financeFilter.dateRange.from, 'P')
                      )
                    ) : (
                      "Vyberte období"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={financeFilter.dateRange || undefined}
                    onSelect={(range) => setFinanceFilter(prev => ({ ...prev, dateRange: range }))}
                    initialFocus
                  />
                  <div className="p-2 border-t border-border">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setFinanceFilter(prev => ({ ...prev, dateRange: null }))}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resetovat
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="searchTerm">Hledat</Label>
              <Input
                id="searchTerm"
                value={financeFilter.searchTerm}
                onChange={(e) => setFinanceFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Hledat v popisu nebo kategorii"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredFinances.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Nenalezeny žádné transakce
              </div>
            ) : (
              filteredFinances.map((finance, index) => (
                <div 
                  key={finance._id || index} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center">
                    {finance.type === 'income' ? (
                      <ArrowUpCircle className="mr-4 h-10 w-10 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="mr-4 h-10 w-10 text-red-500" />
                    )}
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{finance.description || finance.category}</span>
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">
                          {finance.account === 'maru' ? 'Maruška' : 
                           finance.account === 'marty' ? 'Marty' : 'Společný'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <span>{format(new Date(finance.date), 'P')}</span>
                        <span className="mx-2">•</span>
                        <span>{finance.category}</span>
                        {finance.isRecurring && (
                          <>
                            <span className="mx-2">•</span>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            <span>Opakovaná</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${finance.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {finance.type === 'income' ? '+' : '-'} {finance.amount.toLocaleString()} {finance.currency}
                    </div>
                    
                    {finance.type === 'income' && finance.currency === 'CZK' && finance.offsetAmount ? (
                      <div className="text-xs text-muted-foreground">
                        {finance.offsetAmount > 0 ? 'Odečteno od výdělků: ' + finance.offsetAmount.toLocaleString() + ' Kč' : ''}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setFinanceFilter({
            type: 'all',
            account: 'all',
            dateRange: null,
            searchTerm: '',
          })}>
            Resetovat filtry
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Zobrazeno {filteredFinances.length} z {finances.length} transakcí
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FinancesPage;