import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getToday, isInDirectBookingWindow, isInRequestWindow, isPastDate, toISODateString } from '@/utils/dateUtils';
import { addDays } from 'date-fns';

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function BookingCalendar({ selectedDate, onDateSelect }: BookingCalendarProps) {
  const today = getToday();
  const maxDate = addDays(today, 60); // Allow booking up to 60 days in advance

  const getDateBadge = (date: Date): string | null => {
    if (isPastDate(date)) return null;
    if (isInDirectBookingWindow(date)) return 'Reserva directa';
    if (isInRequestWindow(date)) return 'Sol·licitud';
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecciona una data</CardTitle>
        <CardDescription>
          Tria la data per a la teva reserva o sol·licitud
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={(date) => isPastDate(date) || date > maxDate}
          className="rounded-md border"
        />
        
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="default">Reserva directa</Badge>
            <span className="text-muted-foreground">Avui i demà (menys de 2 dies)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Sol·licitud</Badge>
            <span className="text-muted-foreground">Més de 2 dies d'antelació</span>
          </div>
        </div>

        {selectedDate && (
          <div className="mt-4 w-full rounded-md bg-muted p-3">
            <p className="text-sm font-medium">
              Data seleccionada: {toISODateString(selectedDate)}
            </p>
            <p className="text-sm text-muted-foreground">
              Tipus: {getDateBadge(selectedDate)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
