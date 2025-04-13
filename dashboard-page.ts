// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CalendarClock, Wallet, BanknoteIcon, CreditCard, PiggyBank, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import Timer from '@/components/timer/Timer';
import useTimer from '@/hooks/useTimer';
import useWorkLogs from '@/hooks/useWorkLogs';
import useFinances from '@/hooks/useFinances';
import useDebts from '@/hooks/useDebts';

const workCategories = ['programování', 'design', 'administrativa', 'marketing', 'konzultace'];

const Dashboard: React.FC = () => {
  // Hooks pro získání dat
  const { formattedTime, earnings, isRunning } = useTimer(workCategories);
  const { workLogs, totalEarnings, totalWorkTime } = useWorkLogs();
  const { finances, sharedBalance, personalBalances, expenses, incomes } = useFinances();
  const { debts, totalDebt } = useDebts();
  
  // State pro aktuální měsíc
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Data pro grafy
  const [financeChartData, setFinanceChartData] = useState<any[]>([]);
  const [workChartData, setWorkChartData] = useState<any[]>([]);
  
  // Efekt pro generování dat grafu
  useEffect(() => {
    // Data pro finanční graf
    const expensesByCategory = [
      { name: 'Bydlení', value: 24500 },
      { name: 'Jídlo', value: 8000 },
      { name: 'Doprava', value: 2500 },
      { name: 'Zábava', value: 3000 },
      { name: 'Ostatní', value: 5000 },
    ];
    
    // Data pro pracovní graf - rozdělení podle aktivit
    const workByCategory = [
      { name: 'Programování', value: 45 },
      { name: 'Design', value: 25 },
      { name: 'Administrativa', value: 15 },
      { name: 'Marketing', value: 10 },
      { name: 'Konzultace', value: 5 },
    ];
    
    setFinanceChartData(expensesByCategory);
    setWorkChartData(workByCategory);
  }, []);
  
  // Barvy pro grafy
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];
  
  // Data pro graf příjmů a výdajů v průběhu času
  const incomeExpenseData = [
    { name: 'Led', income: 55000, expense: 40000 },
    { name: 'Úno', income: 58000, expense: 42000 },
    { name: 'Bře', income: 60000, expense: 45000 },
    { name: 'Dub', income: 62000, expense: 46000 },
    { name: 'Kvě', income: 65000, expense: 48000 },
    { name: 'Čvn', income: 70000, expense: 50000 },
  ];
  
  // Výpočet procenta naplnění nájmu
  const rentProgress = Math.min(100, (sharedBalance / 24500) * 100);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1">Přehled</TabsTrigger>
              <TabsTrigger value="finances" className="flex-1">Finance</TabsTrigger>
              <TabsTrigger value="work" className="flex-1">Práce</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <PiggyBank className="mr-2 h-5 w-5 text-primary" />
                      Společný rozpočet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{sharedBalance.toLocaleString()} Kč</div>
                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Nájem ({rentProgress.toFixed(0)}%)</span>
                        <span className="text-sm">{Math.min(sharedBalance, 24500).toLocaleString()} / 24 500 Kč</span>
                      </div>
                      <Progress value={rentProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-primary" />
                      Osobní zůstatky
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <span>Maruška:</span>
                      <span className="font-semibold">{personalBalances.maru.toLocaleString()} Kč</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marty:</span>
                      <span className="font-semibold">{personalBalances.marty.toLocaleString()} Kč</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CalendarClock className="mr-2 h-5 w-5 text-primary" />
                      Odpracovaný čas (tento měsíc)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <span>Maruška:</span>
                      <span className="font-semibold">{totalWorkTime.maru.toFixed(1)} h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marty:</span>
                      <span className="font-semibold">{totalWorkTime.marty.toFixed(1)} h</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BanknoteIcon className="mr-2 h-5 w-5 text-primary" />
                      Dluhy celkem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-destructive">{totalDebt.toLocaleString()} Kč</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {debts.length} aktivních dluhů
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="finances">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Výdaje podle kategorií</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={financeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {financeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} Kč`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Příjmy a výdaje</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={incomeExpenseData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} Kč`} />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#00C49F" name="Příjmy" />
                        <Line type="monotone" dataKey="expense" stroke="#FF8042" name="Výdaje" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Poslední transakce</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            {i % 2 === 0 ? (
                              <ArrowUpCircle className="mr-2 h-5 w-5 text-green-500" />
                            ) : (
                              <ArrowDownCircle className="mr-2 h-5 w-5 text-red-500" />
                            )}
                            <div>
                              <div className="font-medium">{i % 2 === 0 ? 'Příjem' : 'Výdaj'} - {['Jídlo', 'Bydlení', 'Programování'][i - 1]}</div>
                              <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className={`font-semibold ${i % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {i % 2 === 0 ? '+' : '-'} {(i * 1000).toLocaleString()} Kč
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="work">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Rozdělení práce</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={workChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {workChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Výdělky tento měsíc</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Maruška (hrubý výdělek):</span>
                          <span className="font-semibold">{totalEarnings.maru.gross.toLocaleString()} Kč</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Srážka (1/3):</span>
                          <span className="font-semibold text-orange-500">-{totalEarnings.maru.deduction.toLocaleString()} Kč</span>
                        </div>
                        <div className="flex justify-between mb-4">
                          <span>Čistý výdělek:</span>
                          <span className="font-semibold text-green-600">{totalEarnings.maru.net.toLocaleString()} Kč</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Marty (hrubý výdělek):</span>
                          <span className="font-semibold">{totalEarnings.marty.gross.toLocaleString()} Kč</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Srážka (1/2):</span>
                          <span className="font-semibold text-orange-500">-{totalEarnings.marty.deduction.toLocaleString()} Kč</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Čistý výdělek:</span>
                          <span className="font-semibold text-green-600">{totalEarnings.marty.net.toLocaleString()} Kč</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Poslední záznamy práce</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <div className="font-medium">{i % 2 === 0 ? 'Maruška' : 'Marty'} - {['Programování', 'Design', 'Administrativa'][i - 1]}</div>
                            <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()} · {i + 2} hodin</div>
                          </div>
                          <div className="font-semibold">
                            {((i % 2 === 0 ? 275 : 400) * (i + 2)).toLocaleString()} Kč
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Timer workCategories={workCategories} />
          
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Aktivní dluhy</CardTitle>
            </CardHeader>
            <CardContent>
              {debts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Žádné aktivní dluhy
                </div>
              ) : (
                <div className="space-y-4">
                  {debts.slice(0, 3).map((debt, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{debt.creditor}</span>
                        <span className="font-semibold">{debt.remainingAmount.toLocaleString()} Kč</span>
                      </div>
                      <Progress value={(1 - debt.remainingAmount / debt.amount) * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {((1 - debt.remainingAmount / debt.amount) * 100).toFixed(0)}% splaceno
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;