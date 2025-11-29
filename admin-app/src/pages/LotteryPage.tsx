import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LotteryDashboard, LotteryExecutor, LotteryResults } from '@/components/lottery';
import { Shuffle, History, ArrowLeft } from 'lucide-react';
import type { LotteryResult } from '@/services/lotteryService';

export function LotteryPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [requestCount, setRequestCount] = useState<number>(0);
  const [isExecutorOpen, setIsExecutorOpen] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<LotteryResult | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'results'>('dashboard');

  const handleSelectDate = (date: Date, timeSlot: string, count: number) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setRequestCount(count);
    setIsExecutorOpen(true);
  };

  const handleLotterySuccess = (result: LotteryResult) => {
    setLotteryResult(result);
    setIsExecutorOpen(false);
    setActiveTab('results');
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setLotteryResult(null);
    setSelectedDate(null);
    setSelectedTimeSlot('');
    setRequestCount(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestió de Sortejos</h1>
        <p className="text-muted-foreground">
          Executa sortejos per assignar pistes a les sol·licituds pendents
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dashboard' | 'results')}>
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Executar Sorteig
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!lotteryResult}>
            <History className="h-4 w-4" />
            Resultats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecciona Data i Hora</CardTitle>
              <CardDescription>
                Tria una data amb sol·licituds pendents i una franja horària per executar el sorteig
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LotteryDashboard onSelectDate={handleSelectDate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {lotteryResult ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Resultats del Sorteig</h2>
                  <p className="text-muted-foreground">
                    Data: {lotteryResult.date} - Hora: {selectedTimeSlot}
                  </p>
                </div>
                <Button variant="outline" onClick={handleBackToDashboard}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tornar al Dashboard
                </Button>
              </div>
              <LotteryResults result={lotteryResult} />
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hi ha resultats per mostrar</p>
                  <p className="text-sm mt-2">Executa un sorteig per veure els resultats</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Lottery Executor Dialog */}
      {selectedDate && (
        <LotteryExecutor
          isOpen={isExecutorOpen}
          onClose={() => setIsExecutorOpen(false)}
          date={selectedDate}
          timeSlot={selectedTimeSlot}
          requestCount={requestCount}
          onSuccess={handleLotterySuccess}
        />
      )}
    </div>
  );
}
