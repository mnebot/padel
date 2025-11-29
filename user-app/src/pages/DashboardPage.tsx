import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { useBookingRequests } from '../hooks/useBookingRequests';
import { DashboardStats, UpcomingBookings, PendingRequests } from '../components/dashboard';
import { Button } from '../components/ui/button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Plus } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, isLoading: bookingsLoading, error: bookingsError, fetchBookings } = useBookings();
  const { requests, isLoading: requestsLoading, error: requestsError, fetchRequests } = useBookingRequests();

  useEffect(() => {
    if (user?.id) {
      fetchBookings(user.id);
      fetchRequests(user.id);
    }
  }, [user?.id, fetchBookings, fetchRequests]);

  if (!user) {
    return null;
  }

  const hasError = bookingsError || requestsError;

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Benvingut/da, {user.name}
          </p>
        </div>
        <Button onClick={() => navigate('/bookings/new')} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Error Messages */}
      {hasError && (
        <div className="space-y-2">
          {bookingsError && <ErrorMessage message={bookingsError} />}
          {requestsError && <ErrorMessage message={requestsError} />}
        </div>
      )}

      {/* Stats Cards */}
      <DashboardStats user={user} />

      {/* Bookings and Requests */}
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingBookings bookings={bookings} isLoading={bookingsLoading} />
        <PendingRequests requests={requests} isLoading={requestsLoading} />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Button
          variant="outline"
          className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-2"
          onClick={() => navigate('/bookings/new')}
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-sm sm:text-base">Nova Reserva</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-2"
          onClick={() => navigate('/bookings')}
        >
          <span className="text-xl sm:text-2xl">📋</span>
          <span className="text-sm sm:text-base">Les Meves Reserves</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-2"
          onClick={() => navigate('/history')}
        >
          <span className="text-xl sm:text-2xl">📊</span>
          <span className="text-sm sm:text-base">Historial</span>
        </Button>
      </div>
    </div>
  );
};
