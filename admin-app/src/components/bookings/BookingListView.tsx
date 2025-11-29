import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import type { Booking } from '@/types/booking';
import { BookingDetails } from './BookingDetails';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';

interface BookingListViewProps {
  bookings: Booking[];
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

export function BookingListView({ bookings }: BookingListViewProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd/MM/yyyy', { locale: ca });
    } catch {
      return dateString;
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No s'han trobat reserves amb els filtres aplicats</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Pista</TableHead>
              <TableHead>Usuari</TableHead>
              <TableHead>Jugadors</TableHead>
              <TableHead>Estat</TableHead>
              <TableHead className="text-right">Accions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {formatDate(booking.date)}
                </TableCell>
                <TableCell>{booking.timeSlot}</TableCell>
                <TableCell>
                  {booking.court?.name || `Pista ${booking.courtId}`}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.user?.name || 'Desconegut'}</p>
                    {booking.user?.email && (
                      <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{booking.numberOfPlayers}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Veure
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalls de la Reserva</DialogTitle>
          </DialogHeader>
          {selectedBooking && <BookingDetails booking={selectedBooking} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
