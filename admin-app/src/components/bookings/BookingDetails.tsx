import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, User, Hash } from 'lucide-react';
import type { Booking } from '@/types/booking';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';

interface BookingDetailsProps {
  booking: Booking;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'default';
    case 'COMPLETED':
      return 'secondary';
    case 'CANCELLED':
      return 'destructive';
    case 'REQUESTED':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmada';
    case 'COMPLETED':
      return 'Completada';
    case 'CANCELLED':
      return 'Cancel·lada';
    case 'REQUESTED':
      return 'Sol·licitada';
    default:
      return status;
  }
};

export function BookingDetails({ booking }: BookingDetailsProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: ca });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "d/MM/yyyy 'a les' HH:mm", { locale: ca });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">Detalls de la Reserva</CardTitle>
          <Badge variant={getStatusBadgeVariant(booking.status)}>
            {getStatusLabel(booking.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">ID de Reserva</p>
                <p className="text-sm text-muted-foreground font-mono">{booking.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Data</p>
                <p className="text-sm text-muted-foreground">{formatDate(booking.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Hora</p>
                <p className="text-sm text-muted-foreground">{booking.timeSlot}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Pista</p>
                <p className="text-sm text-muted-foreground">
                  {booking.court?.name || `Pista ${booking.courtId}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Nombre de Jugadors</p>
                <p className="text-sm text-muted-foreground">{booking.numberOfPlayers}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Usuari</p>
                <p className="text-sm text-muted-foreground">
                  {booking.user?.name || 'Usuari desconegut'}
                </p>
                {booking.user?.email && (
                  <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                )}
              </div>
            </div>

            {booking.requestId && (
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">ID de Sol·licitud</p>
                  <p className="text-sm text-muted-foreground font-mono">{booking.requestId}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Creada</p>
                <p className="text-sm text-muted-foreground">{formatDateTime(booking.createdAt)}</p>
              </div>
            </div>

            {booking.completedAt && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Completada</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(booking.completedAt)}</p>
                </div>
              </div>
            )}

            {booking.cancelledAt && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Cancel·lada</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(booking.cancelledAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
