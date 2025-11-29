import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingList } from '@/components/booking';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    bookings,
    isLoading: isLoadingBookings,
    error: bookingsError,
    fetchBookings,
    cancelBooking,
  } = useBookings();
  const {
    requests,
    isLoading: isLoadingRequests,
    error: requestsError,
    fetchRequests,
    cancelRequest,
  } = useBookingRequests();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'booking' | 'request';
    id: string;
    title: string;
    description: string;
  }>({
    open: false,
    type: 'booking',
    id: '',
    title: '',
    description: '',
  });
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch bookings and requests on mount
  useEffect(() => {
    if (user) {
      fetchBookings(user.id);
      fetchRequests(user.id);
    }
  }, [user, fetchBookings, fetchRequests]);

  const handleCancelBooking = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    setConfirmDialog({
      open: true,
      type: 'booking',
      id,
      title: 'Cancel·lar reserva',
      description: `Estàs segur que vols cancel·lar la reserva del ${booking.date} a les ${booking.timeSlot}? Aquesta acció no es pot desfer.`,
    });
  };

  const handleCancelRequest = (id: string) => {
    const request = requests.find((r) => r.id === id);
    if (!request) return;

    setConfirmDialog({
      open: true,
      type: 'request',
      id,
      title: 'Cancel·lar sol·licitud',
      description: `Estàs segur que vols cancel·lar la sol·licitud del ${request.date} a les ${request.timeSlot}? Aquesta acció no es pot desfer.`,
    });
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);

    try {
      if (confirmDialog.type === 'booking') {
        await cancelBooking(confirmDialog.id);
        toast.success('Reserva cancel·lada correctament');
      } else {
        await cancelRequest(confirmDialog.id);
        toast.success('Sol·licitud cancel·lada correctament');
      }

      // Refresh data
      if (user) {
        fetchBookings(user.id);
        fetchRequests(user.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error cancel·lant');
    } finally {
      setIsCancelling(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const isLoading = isLoadingBookings || isLoadingRequests;
  const error = bookingsError || requestsError;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Les Meves Reserves</h1>
          <p className="text-muted-foreground">
            Gestiona les teves reserves i sol·licituds
          </p>
        </div>
        <Button onClick={() => navigate('/bookings/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <BookingList
          bookings={bookings}
          requests={requests}
          onCancelBooking={handleCancelBooking}
          onCancelRequest={handleCancelRequest}
          isLoading={isCancelling}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Cancel·lar"
        cancelText="Tornar"
        variant="destructive"
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
