import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users } from 'lucide-react';
import type { AvailabilitySlot } from '@/services/bookingService';
import { cn } from '@/lib/utils';

interface TimeSlotSelectorProps {
  slots: AvailabilitySlot[];
  selectedTimeSlot: string | null;
  selectedCourtId: string | null;
  onTimeSlotSelect: (timeSlot: string, courtId?: string) => void;
  isDirectBooking: boolean;
}

export function TimeSlotSelector({
  slots,
  selectedTimeSlot,
  selectedCourtId,
  onTimeSlotSelect,
  isDirectBooking,
}: TimeSlotSelectorProps) {
  if (slots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Horaris disponibles</CardTitle>
          <CardDescription>No hi ha horaris disponibles per aquesta data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTimeSlotBadgeVariant = (type: string): 'default' | 'secondary' => {
    return type === 'PEAK' ? 'default' : 'secondary';
  };

  const getTimeSlotLabel = (type: string): string => {
    return type === 'PEAK' ? 'Hora Punta' : 'Hora Vall';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horaris disponibles</CardTitle>
        <CardDescription>
          {isDirectBooking
            ? 'Selecciona un horari i una pista disponible'
            : 'Selecciona un horari per a la teva sol·licitud'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.timeSlot}
              className={cn(
                'rounded-lg border p-4 transition-colors',
                !slot.isAvailable && 'opacity-50'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-lg">{slot.timeSlot}</span>
                  <Badge
                    variant={getTimeSlotBadgeVariant(slot.type)}
                    className={cn(
                      slot.type === 'PEAK' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600',
                      'text-white'
                    )}
                  >
                    {getTimeSlotLabel(slot.type)}
                  </Badge>
                </div>
              </div>

              {isDirectBooking ? (
                // Direct booking: show available courts
                <div className="space-y-2">
                  {slot.availableCourts.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        Pistes disponibles:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {slot.availableCourts.map((court) => (
                          <Button
                            key={court.id}
                            variant={
                              selectedTimeSlot === slot.timeSlot && selectedCourtId === court.id
                                ? 'default'
                                : 'outline'
                            }
                            className="justify-start"
                            onClick={() => onTimeSlotSelect(slot.timeSlot, court.id)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            {court.name}
                          </Button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hi ha pistes disponibles
                    </p>
                  )}
                </div>
              ) : (
                // Request booking: just select time slot
                <Button
                  variant={selectedTimeSlot === slot.timeSlot ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => onTimeSlotSelect(slot.timeSlot)}
                  disabled={!slot.isAvailable}
                >
                  {slot.isAvailable ? 'Seleccionar horari' : 'No disponible'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
