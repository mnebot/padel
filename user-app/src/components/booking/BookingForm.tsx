import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Users } from 'lucide-react';
import { formatDate, formatTimeSlot } from '@/utils/dateUtils';

interface BookingFormProps {
  date: Date;
  timeSlot: string;
  courtName?: string;
  isDirectBooking: boolean;
  numberOfPlayers: number;
  participantsCount: number;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BookingForm({
  date,
  timeSlot,
  courtName,
  isDirectBooking,
  numberOfPlayers,
  participantsCount,
  onSubmit,
  onCancel,
  isLoading = false,
}: BookingFormProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate participants
    if (participantsCount !== numberOfPlayers) {
      setError(`Has de seleccionar exactament ${numberOfPlayers} participant${numberOfPlayers > 1 ? 's' : ''}`);
      return;
    }

    try {
      await onSubmit();
    } catch (err: any) {
      setError(err.message || 'Error creant la reserva');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isDirectBooking ? 'Confirmar reserva directa' : 'Crear sol·licitud de reserva'}
        </CardTitle>
        <CardDescription>
          {isDirectBooking
            ? 'Revisa els detalls i confirma la teva reserva'
            : 'La teva sol·licitud entrarà al sorteig per aquesta data i horari'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Booking details summary */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Data:</span>
              <span className="text-sm">{formatDate(date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Horari:</span>
              <span className="text-sm">{formatTimeSlot(timeSlot)}</span>
            </div>
            {isDirectBooking && courtName && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Pista:</span>
                <span className="text-sm">{courtName}</span>
              </div>
            )}
          </div>

          {/* Participants info */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Participants:</span>
              </div>
              <span className="text-sm">
                {participantsCount}/{numberOfPlayers} seleccionats
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel·lar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading
              ? 'Processant...'
              : isDirectBooking
              ? 'Confirmar reserva'
              : 'Crear sol·licitud'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
