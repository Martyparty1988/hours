// src/pages/TimerPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, Clock, ListFilter, Plus, FileDown, FileUp } from 'lucide-react';
import Timer from '@/components/timer/Timer';
import useTimer from '@/hooks/useTimer';
import useWorkLogs from '@/hooks/useWorkLogs';

// Pracovní kategorie pro výběr
const workCategories = ['programování', 'design', 'administrativa', 'marketing', 'konzultace'];

const TimerPage: React.FC = () => {
  const { addWorkLog, workLogs, filteredLogs, filterLogs } = useWorkLogs();
  
  // State pro filtrování
  const [filters, setFilters] = useState({
    person: 'all',
    dateFrom: '',
    dateTo: '',
    activity: '',
  });
  
  // State pro manuální přidání záznamu
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    person: 'maru',
    date: new Date(),
    startTime: '',
    endTime: '',
    breakMinutes: 0,
    activity: workCategories[0],
    note: '',
  });
  
  // Resetování formuláře
  const resetManualForm = () => {
    setManualForm({
      person: 'maru',
      date: new Date(),
      startTime: '',
      endTime: '',
      breakMinutes: 0,
      activity: workCategories[0],
      note: '',
    });
  };
  
  // Handler pro změnu formuláře
  const handleManualFormChange = (field: string, value: any) => {
    setManualForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handler pro manuální přidání záznamu
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dateStr = format(manualForm.date, 'yyyy-MM-dd');
      
      // Vytvoření času z datumu a časových stringů
      const startDateTime = new Date(`${dateStr}T${manualForm.startTime}`);
      const endDateTime = new Date(`${dateStr}T${manualForm.endTime}`);
      
      // Přidání záznamu
      await addWorkLog({
        person: manualForm.person as 'maru' | 'marty',
        date: dateStr,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        breakMinutes: manualForm.breakMinutes,
        activity: manualForm.activity,
        note: manualForm.note,
      });
      
      // Reset formuláře
      resetManualForm();
      setShowManualForm(false);
    } catch (error) {
      console.error('Failed to add manual work log:', error);
    }
  };
  
  // Aplikace filtrů
  const applyFilters = () => {
    filterLogs({
      person: filters.person as any,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      activity: filters.activity,
    });
  };
  
  // Resetování filtrů
  const resetFilters = () => {
    setFilters({
      person: 'all',
      dateFrom: '',
      dateTo: '',
      activity: '',
    });
    
    filterLogs({});
  };
  
  // Export záznamů do CSV
  const exportToCsv = () => {
    // Vytvoření CSV obsahu
    const headers = ['Osoba', 'Datum', 'Začátek', 'Konec', 'Přestávka (min)', 'Aktivita', 'Hodinová sazba', 'Výdělek', 'Srážka', 'Poznámka'];
    
    const csvRows = [
      headers.join(','),
      ...filteredLogs.map(log => {
        const date = new Date(log.date);
        const startTime = new Date(log.startTime);
        const endTime = new Date(log.endTime);
        
        return [
          log.person === 'maru' ? 'Maruška' : 'Marty',
          format(date, 'dd.MM.yyyy'),
          format(startTime, 'HH:mm'),
          format(endTime, 'HH:mm'),
          log.breakMinutes,
          log.activity,
          log.hourlyRate,
          log.earnings,
          log.deduction,
          log.note || '',
        ].join(',');
      }),
    ].join('\n');
    
    // Vytvoření stažitelného odkazu
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `work-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4 md:mb-0">Časovač práce</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowManualForm(!showManualForm)}
          >
            {showManualForm ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Zobrazit časovač
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Manuální zadání
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={exportToCsv}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Časovač nebo manuální formulář */}
      {showManualForm ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Manuální zadání práce</CardTitle>
            <CardDescription>
              Umožňuje zpětně zadat odpracovaný čas bez použití časovače
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="person">Osoba</Label>
                  <Select
                    value={manualForm.person}
                    onValueChange={(value) => handleManualFormChange('person', value)}
                  >
                    <SelectTrigger id="person">
                      <SelectValue placeholder="Vyberte osobu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maru">Maruška (275 Kč/h)</SelectItem>
                      <SelectItem value="marty">Marty (400 Kč/h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="activity">Aktivita</Label>
                  <Select
                    value={manualForm.activity}
                    onValueChange={(value) => handleManualFormChange('activity', value)}
                  >
                    <SelectTrigger id="activity">
                      <SelectValue placeholder="Vyberte aktivitu" />
                    </SelectTrigger>
                    <SelectContent>
                      {workCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="date">Datum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {manualForm.date ? format(manualForm.date, 'dd.MM.yyyy') : 'Vyberte datum'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={manualForm.date}
                        onSelect={(date) => handleManualFormChange('date', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="breakMinutes">Přestávka (min)</Label>
                  <Input
                    id="breakMinutes"
                    type="number"
                    min="0"
                    step="5"
                    value={manualForm.breakMinutes}
                    onChange={(e) => handleManualFormChange('breakMinutes', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="startTime">Čas začátku</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={manualForm.startTime}
                    onChange={(e) => handleManualFormChange('startTime', e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="endTime">Čas konce</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={manualForm.endTime}
                    onChange={(e) => handleManualFormChange('endTime', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Poznámka (volitelné)</Label>
                <Input
                  id="note"
                  value={manualForm.note}
                  onChange={(e) => handleManualFormChange('note', e.target.value)}
                  placeholder="Volitelná poznámka k práci"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetManualForm}>
                  Resetovat
                </Button>
                <Button type="submit">
                  Přidat záznam
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Timer workCategories={workCategories} />
      )}
      
      {/* Historie záznamů */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Historie práce</CardTitle>
          <CardDescription>
            Přehled všech odpracovaných hodin a výdělku
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="filterPerson">Osoba</Label>
              <Select
                value={filters.person}
                onValueChange={(value) => setFilters(prev => ({ ...prev, person: value }))}
              >
                <SelectTrigger id="filterPerson">
                  <SelectValue placeholder="Všechny osoby" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny osoby</SelectItem>
                  <SelectItem value="maru">Maruška</SelectItem>
                  <SelectItem value="marty">Marty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterActivity">Aktivita</Label>
              <Select
                value={filters.activity}
                onValueChange={(value) => setFilters(prev => ({ ...prev, activity: value }))}
              >
                <SelectTrigger id="filterActivity">
                  <SelectValue placeholder="Všechny aktivity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Všechny aktivity</SelectItem>
                  {workCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterDateFrom">Od data</Label>
              <Input
                id="filterDateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterDateTo">Do data</Label>
              <Input
                id="filterDateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mb-6">
            <Button variant="outline" onClick={resetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Resetovat
            </Button>
            <Button onClick={applyFilters}>
              <ListFilter className="mr-2 h-4 w-4" />
              Filtrovat
            </Button>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-1">Žádné záznamy práce</h3>
              <p>Zatím nebyly zaznamenány žádné pracovní záznamy.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((log) => {
                  const date = new Date(log.date);
                  const startTime = new Date(log.startTime);
                  const endTime = new Date(log.endTime);
                  const hours = log.workedMinutes / 60;
                  
                  return (
                    <Card key={log._id} className="overflow-hidden">
                      <div className={`h-1 ${log.person === 'maru' ? 'bg-pink-500' : 'bg-blue-500'}`}></div>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h4 className="font-medium">
                              {log.person === 'maru' ? 'Maruška' : 'Marty'} - {log.activity}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {format(date, 'dd.MM.yyyy')} · {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                              {log.breakMinutes > 0 ? ` · Přestávka: ${log.breakMinutes} min` : ''}
                            </p>
                            {log.note && (
                              <p className="text-sm mt-2 italic">{log.note}</p>
                            )}
                          </div>
                          <div className="mt-2 md:mt-0 text-right">
                            <div className="font-medium">{log.earnings.toLocaleString()} Kč</div>
                            <div className="text-sm text-muted-foreground">
                              {hours.toFixed(1)} h × {log.hourlyRate} Kč/h
                            </div>
                            <div className="text-sm text-orange-500">
                              Srážka: {log.deduction.toLocaleString()} Kč ({(log.deductionRate * 100).toFixed(0)}%)
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimerPage;