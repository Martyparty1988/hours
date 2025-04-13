// src/components/timer/Timer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { formatTime } from '@/utils/formatters';

// Typy pro časovač
interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedTime: number;
  person: 'maru' | 'marty';
  activity: string;
}

interface TimerProps {
  onSave?: (log: {
    person: string;
    startTime: Date;
    endTime: Date;
    elapsedTime: number;
    activity: string;
  }) => void;
  workCategories: string[];
}

export const Timer: React.FC<TimerProps> = ({ onSave, workCategories = [] }) => {
  // Výchozí stav časovače
  const initialState: TimerState = {
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    person: 'maru',
    activity: workCategories[0] || 'programování',
  };

  // Použití localStorage pro perzistenci dat
  const [timerState, setTimerState] = useLocalStorage<TimerState>('timer-state', initialState);
  
  // Reference pro interval
  const intervalRef = useRef<number | null>(null);
  
  // Hodinové sazby a srážky
  const hourlyRates = {
    maru: 275,
    marty: 400,
  };
  
  const deductionRates = {
    maru: 1/3,
    marty: 0.5,
  };

  // Vypočítaná hodnota aktuálního času
  const [displayTime, setDisplayTime] = useState(formatTime(timerState.elapsedTime));

  // Vypočítaná hodnota aktuálního výdělku
  const [earnings, setEarnings] = useState({
    gross: 0,
    deduction: 0,
    net: 0,
  });

  // Efekt pro aktualizaci časovače
  useEffect(() => {
    // Při spuštění aplikace kontrola, zda byl časovač aktivní
    if (timerState.isRunning && timerState.startTime) {
      startTimer();
    }

    // Cleanup funkce
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Efekt pro aktualizaci displeje a výdělku
  useEffect(() => {
    setDisplayTime(formatTime(timerState.elapsedTime));
    
    // Výpočet výdělku
    const hourlyRate = hourlyRates[timerState.person];
    const hours = timerState.elapsedTime / (1000 * 60 * 60);
    const grossEarnings = hourlyRate * hours;
    const deductionRate = deductionRates[timerState.person];
    const deduction = grossEarnings * deductionRate;
    
    setEarnings({
      gross: Math.round(grossEarnings),
      deduction: Math.round(deduction),
      net: Math.round(grossEarnings - deduction),
    });
  }, [timerState.elapsedTime, timerState.person]);

  // Spuštění časovače
  const startTimer = () => {
    // Aktuální čas
    const now = Date.now();
    
    // Nastavení startTime, pokud ještě není
    if (!timerState.startTime) {
      setTimerState(prev => ({
        ...prev,
        startTime: now,
        isRunning: true,
      }));
    } else {
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
      }));
    }
    
    // Spuštění intervalu pro aktualizaci času
    intervalRef.current = window.setInterval(() => {
      setTimerState(prev => {
        if (prev.startTime && prev.isRunning) {
          const newElapsedTime = prev.elapsedTime + (Date.now() - (prev.startTime || Date.now()));
          return {
            ...prev,
            startTime: Date.now(),
            elapsedTime: newElapsedTime,
          };
        }
        return prev;
      });
    }, 1000);
  };

  // Pauza časovače
  const pauseTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }));
  };

  // Zastavení a uložení časovače
  const stopTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Pokud je definována funkce pro uložení, použijeme ji
    if (onSave && timerState.startTime) {
      const now = new Date();
      const startTime = new Date(now.getTime() - timerState.elapsedTime);
      
      onSave({
        person: timerState.person,
        startTime,
        endTime: now,
        elapsedTime: timerState.elapsedTime,
        activity: timerState.activity,
      });
    }
    
    // Reset časovače
    setTimerState({
      ...initialState,
      person: timerState.person, // Zachováme vybranou osobu
    });
  };

  // Změna osoby
  const handlePersonChange = (value: string) => {
    setTimerState(prev => ({
      ...prev,
      person: value as 'maru' | 'marty',
    }));
  };

  // Změna aktivity
  const handleActivityChange = (value: string) => {
    setTimerState(prev => ({
      ...prev,
      activity: value,
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-2xl font-bold">
          Časovač práce
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <Select 
              value={timerState.person} 
              onValueChange={handlePersonChange}
              disabled={timerState.isRunning}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Vyberte osobu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maru">Maruška (275 Kč/h)</SelectItem>
                <SelectItem value="marty">Marty (400 Kč/h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-6">
            <Select 
              value={timerState.activity} 
              onValueChange={handleActivityChange}
              disabled={timerState.isRunning}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Vyberte aktivitu" />
              </SelectTrigger>
              <SelectContent>
                {workCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-center my-6">
            <div className={`text-5xl font-bold font-mono ${timerState.isRunning ? 'text-primary animate-pulse' : ''}`}>
              {displayTime}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Hrubý výdělek</div>
              <div className="text-xl font-semibold">{earnings.gross} Kč</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Čistý výdělek</div>
              <div className="text-xl font-semibold">{earnings.net} Kč</div>
            </div>
          </div>
          
          <div className="text-center mb-2">
            <div className="text-sm text-muted-foreground">Srážka do společného rozpočtu</div>
            <div className="text-lg font-medium">{earnings.deduction} Kč</div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-6">
            {timerState.isRunning ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={pauseTimer}
                className="w-1/3"
              >
                <Pause className="mr-2 h-4 w-4" /> Pauza
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="lg"
                onClick={startTimer}
                className="w-1/3"
              >
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              size="lg"
              onClick={stopTimer}
              disabled={timerState.elapsedTime === 0}
              className="w-1/3"
            >
              <StopCircle className="mr-2 h-4 w-4" /> Stop
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Timer;