import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { BookingCard } from '@/components/booking/BookingCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { parseDate } from '@/utils/dateUtils';
import type { Booking } from '@/types/booking';

export function HistoryPage() {
  const { user } = useAuth();
  const { bookings, isLoading, error, fetchBookings } = useBookings();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Fetch bookings on mount
  useEffect(() => {
    if (user) {
      fetchBookings(user.id);
    }
  }, [user, fetchBookings]);

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings.filter(
      (booking) =>
        booking.status === 'COMPLETED' || booking.status === 'CANCELLED'
    );

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const bookingDate = (booking: Booking) => parseDate(booking.date);

      switch (dateFilter) {
        case 'last-week':
          const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((booking) => bookingDate(booking) >= lastWeek);
          break;
        case 'last-month':
          const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((booking) => bookingDate(booking) >= lastMonth);
          break;
        case 'last-3-months':
          const last3Months = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((booking) => bookingDate(booking) >= last3Months);
          break;
      }
    }

    // Sort by date descending (most recent first)
    return filtered.sort((a, b) => {
      const dateA = parseDate(a.date).getTime();
      const dateB = parseDate(b.date).getTime();
      return dateB - dateA;
    });
  }, [bookings, statusFilter, dateFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    const total = completed + cancelled;

    return {
      total,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [bookings]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Historial de Reserves</h1>
        <p className="text-muted-foreground">
          Consulta el teu historial i estadístiques personals
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Comptador d'Ús</CardDescription>
            <CardTitle className="text-3xl">{user.usageCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Reserves totals</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completades</CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Reserves jugades</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cancel·lades</CardDescription>
            <CardTitle className="text-3xl">{stats.cancelled}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Reserves cancel·lades</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Taxa de Completació</CardDescription>
            <CardTitle className="text-3xl">{stats.completionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Reserves completades</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Filtra el teu historial per estat i data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estat</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tots els estats</SelectItem>
                  <SelectItem value="COMPLETED">Completades</SelectItem>
                  <SelectItem value="CANCELLED">Cancel·lades</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Període</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona període" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tot l'historial</SelectItem>
                  <SelectItem value="last-week">Última setmana</SelectItem>
                  <SelectItem value="last-month">Últim mes</SelectItem>
                  <SelectItem value="last-3-months">Últims 3 mesos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No hi ha reserves</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'No s\'han trobat reserves amb els filtres seleccionats'
                  : 'Encara no tens cap reserva completada o cancel·lada'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Reserves ({filteredBookings.length})
            </h2>
            <Badge variant="outline">
              Ordenades per data (més recents primer)
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                showCancelButton={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
