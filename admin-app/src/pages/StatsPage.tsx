import { useState, useEffect } from 'react';
import { useStats } from '@/hooks/useStats';
import {
  StatsOverview,
  UsageChart,
  UserStatsTable,
  TimeSlotDemandChart,
  BookingsByTypeChart,
} from '@/components/stats';
import { ErrorMessage } from '@/components/common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { statsService, type StatsFilters, type UserStats, type TimeSlotDemand, type BookingsByUserType } from '@/services/statsService';

type Period = 'week' | 'month' | 'year';

export function StatsPage() {
  const { stats, isLoading: statsLoading, error: statsError, fetchStats } = useStats();
  const [period, setPeriod] = useState<Period>('month');
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [timeSlotDemand, setTimeSlotDemand] = useState<TimeSlotDemand[]>([]);
  const [bookingsByType, setBookingsByType] = useState<BookingsByUserType | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Fetch all statistics when period changes
  useEffect(() => {
    loadAllStats();
  }, [period]);

  const loadAllStats = async () => {
    const filters: StatsFilters = { period };

    try {
      // Fetch main stats
      await fetchStats(filters);

      // Fetch detailed stats
      setIsLoadingDetails(true);
      setDetailsError(null);

      const [users, timeslots, bookingsType] = await Promise.all([
        statsService.getUserStats(filters),
        statsService.getTimeSlotDemand(filters),
        statsService.getBookingsByUserType(filters),
      ]);

      setUserStats(users);
      setTimeSlotDemand(timeslots);
      setBookingsByType(bookingsType);
    } catch (err: any) {
      setDetailsError(err.message || 'Error carregant estadístiques detallades');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePeriodChange = (value: Period) => {
    setPeriod(value);
  };

  const handleRefresh = () => {
    loadAllStats();
  };

  const getPeriodLabel = (period: Period): string => {
    switch (period) {
      case 'week':
        return 'Última setmana';
      case 'month':
        return 'Últim mes';
      case 'year':
        return 'Últim any';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estadístiques</h1>
          <p className="text-muted-foreground">
            Anàlisi detallada de l'ús del sistema
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última setmana</SelectItem>
              <SelectItem value="month">Últim mes</SelectItem>
              <SelectItem value="year">Últim any</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline">
            Actualitzar
          </Button>
        </div>
      </div>

      {/* Period indicator */}
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>
            Mostrant dades per: <span className="font-semibold">{getPeriodLabel(period)}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error messages */}
      {statsError && (
        <ErrorMessage message={statsError} />
      )}
      {detailsError && (
        <ErrorMessage message={detailsError} />
      )}

      {/* Overview stats */}
      {stats && (
        <StatsOverview
          totalActiveBookings={stats.totalActiveBookings}
          totalPendingRequests={stats.totalPendingRequests}
          totalUsers={stats.totalUsers}
          totalCourts={stats.totalCourts}
          isLoading={statsLoading}
        />
      )}

      {/* Bookings by user type */}
      {bookingsByType && (
        <BookingsByTypeChart
          bookingsByType={bookingsByType}
          isLoading={isLoadingDetails}
        />
      )}

      {/* Court usage and time slot demand */}
      <div className="grid gap-6 md:grid-cols-2">
        {stats && (
          <UsageChart
            courtUsage={stats.courtUsage}
            isLoading={statsLoading}
            showDetails={true}
          />
        )}
        <TimeSlotDemandChart
          timeSlotDemand={timeSlotDemand}
          isLoading={isLoadingDetails}
        />
      </div>

      {/* User statistics table */}
      <UserStatsTable
        userStats={userStats}
        isLoading={isLoadingDetails}
      />

      {/* Additional stats summary */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Reserves Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalCompletedBookings} completades, {stats.totalCancelledBookings} cancel·lades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Taxa de Completació</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalBookings > 0
                  ? ((stats.totalCompletedBookings / stats.totalBookings) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reserves completades amb èxit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Taxa de Cancel·lació</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalBookings > 0
                  ? ((stats.totalCancelledBookings / stats.totalBookings) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reserves cancel·lades
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
