import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Booking } from '../../types/booking';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface UpcomingBookingsProps {
  bookings: Booking[];
  isLoading: boolean;
}

export const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ bookings, isLoading }) => {
  const navigate = useNavigate();

  // Filter for upcoming confirmed bookings
  const upcomingBookings = bookings
    .filter(b => b.status === 'CONFIRMED' && new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properes Reserves</CardTitle>
          <CardDescription>Les teves reserves confirmades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properes Reserves</CardTitle>
          <CardDescription>Les teves reserves confirmades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No tens reserves properes
            </p>
            <Button onClick={() => navigate('/bookings/new')}>
              Crear Nova Reserva
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Properes Reserves</CardTitle>
        <CardDescription>Les teves reserves confirmades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate('/bookings')}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(parseISO(booking.date), 'EEEE, d MMMM yyyy', { locale: ca })}
                    </span>
                  </div>
                  <Badge variant="default">Confirmada</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{booking.timeSlot}</span>
                  </div>
                  {booking.court && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{booking.court.name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{booking.numberOfPlayers} jugadors</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {upcomingBookings.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/bookings')}
            >
              Veure Totes les Reserves
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
