import { BookingCard } from './BookingCard';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Info } from 'lucide-react';
import type { Booking, BookingRequest } from '@/types/booking';

interface BookingListProps {
  bookings: Booking[];
  requests: BookingRequest[];
  onCancelBooking?: (id: string) => void;
  onCancelRequest?: (id: string) => void;
  isLoading?: boolean;
}

export function BookingList({
  bookings,
  requests,
  onCancelBooking,
  onCancelRequest,
  isLoading = false,
}: BookingListProps) {
  const activeBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'REQUESTED'
  );
  const pendingRequests = requests.filter((r) => r.status === 'REQUESTED');

  return (
    <Tabs defaultValue="bookings" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="bookings" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Reserves ({activeBookings.length})
        </TabsTrigger>
        <TabsTrigger value="requests" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Sol·licituds ({pendingRequests.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bookings" className="space-y-4 mt-4">
        {activeBookings.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No tens reserves actives. Crea una nova reserva per començar!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={onCancelBooking}
                isLoading={isLoading}
                showCancelButton={true}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="requests" className="space-y-4 mt-4">
        {pendingRequests.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No tens sol·licituds pendents. Les sol·licituds es creen per a dates amb més de 2 dies d'antelació.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Les sol·licituds pendents s'assignaran automàticament mitjançant sorteig.
                Rebràs una notificació quan s'assigni la teva reserva.
              </AlertDescription>
            </Alert>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingRequests.map((request) => (
                <BookingCard
                  key={request.id}
                  booking={request}
                  onCancel={onCancelRequest}
                  isLoading={isLoading}
                  showCancelButton={true}
                />
              ))}
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
