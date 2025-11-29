import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, X } from 'lucide-react';
import { formatDate, formatTimeSlot } from '@/utils/dateUtils';
import type { Booking, BookingRequest } from '@/types/booking';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking | BookingRequest;
  onCancel?: (id: string) => void;
  isLoading?: boolean;
  showCancelButton?: boolean;
}

export function BookingCard({
  booking,
  onCancel,
  isLoading = false,
  showCancelButton = true,
}: BookingCardProps) {
  const isBooking = 'courtId' in booking;
  const isRequest = !isBooking;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmada</Badge>;
      case 'REQUESTED':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendent</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Completada</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancel·lada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canCancel = booking.status === 'CONFIRMED' || booking.status === 'REQUESTED';

  return (
    <Card className={cn('transition-shadow hover:shadow-md')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusBadge(booking.status)}
              {isRequest && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Sol·licitud
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatDate(booking.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatTimeSlot(booking.timeSlot)}</span>
        </div>
        {isBooking && booking.court && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{booking.court.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{booking.numberOfPlayers} jugadors</span>
        </div>
      </CardContent>
      {showCancelButton && canCancel && onCancel && (
        <CardFooter className="pt-3">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onCancel(booking.id)}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            {isLoading ? 'Cancel·lant...' : 'Cancel·lar'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
