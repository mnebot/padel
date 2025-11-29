import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Calendar as CalendarIcon, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { apiClient } from '@/services/api';
interface LotteryDashboardProps {
  onSelectDate: (date: Date, timeSlot: string, requestCount: number) => void;
}

export function LotteryDashboard({ onSelectDate }: LotteryDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<{ timeSlot: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlotsForDate(selectedDate);
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  const loadTimeSlotsForDate = async (date: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Get all time slots (we'll need to check each one for pending requests)
      // Since we don't have an endpoint to get all time slots with requests,
      // we'll use common time slots
      const commonTimeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
        '20:00', '21:00', '22:00'
      ];
      
      const slotsWithRequests: { timeSlot: string; count: number }[] = [];
      
      // Check each time slot for pending requests
      for (const timeSlot of commonTimeSlots) {
        try {
          const response = await apiClient.get<{ success: boolean; data: { count: number } }>(
            `/requests/pending?date=${dateStr}&timeSlot=${timeSlot}`
          );
          
          if (response.data.count > 0) {
            slotsWithRequests.push({
              timeSlot,
              count: response.data.count,
            });
          }
        } catch (err) {
          // Ignore errors for individual time slots
          console.debug(`No requests for ${timeSlot}:`, err);
        }
      }
      
      setTimeSlots(slotsWithRequests);
    } catch (err: any) {
      setError(err.message || 'Error carregant franges horàries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) {
      setTimeSlots([]);
    }
  };

  const handleTimeSlotSelect = (timeSlot: string, count: number) => {
    if (selectedDate) {
      onSelectDate(selectedDate, timeSlot, count);
    }
  };



  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Selecciona una Data
          </CardTitle>
          <CardDescription>
            Les dates amb sol·licituds pendents estan destacades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <ErrorMessage message={error} />}
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={ca}
            className="rounded-md border"
          />
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Selecciona una data per veure les sol·licituds pendents</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Franges Horàries
          </CardTitle>
          <CardDescription>
            {selectedDate
              ? `Sol·licituds per ${format(selectedDate, 'd/MM/yyyy', { locale: ca })}`
              : 'Selecciona una data per veure les franges horàries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona una data del calendari</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground mt-4">Carregant sol·licituds...</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hi ha sol·licituds pendents per aquesta data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeSlots.map(({ timeSlot, count }) => (
                <div
                  key={timeSlot}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{timeSlot}</p>
                      <p className="text-sm text-muted-foreground">
                        {count} {count === 1 ? 'sol·licitud' : 'sol·licituds'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {count}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleTimeSlotSelect(timeSlot, count)}
                    >
                      Executar Sorteig
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
