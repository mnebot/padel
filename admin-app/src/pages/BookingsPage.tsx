import { useEffect, useState } from 'react';
import { Calendar, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookingFilters,
  BookingListView,
  BookingCalendarView,
} from '@/components/bookings';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { useBookings } from '@/hooks/useBookings';
import { useCourts } from '@/hooks/useCourts';
import { useToast } from '@/context/ToastContext';
import type { BookingFilters as BookingFiltersType } from '@/services/bookingService';

export function BookingsPage() {
  const { bookings, isLoading, error, fetchAllBookings, filterBookings } = useBookings();
  const { courts, fetchCourts } = useCourts();
  const { showToast } = useToast();
  
  const [filters, setFilters] = useState<BookingFiltersType>({});
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchAllBookings(), fetchCourts()]);
      } catch (error: any) {
        showToast('error', error.message || 'Error al carregar les dades');
      }
    };
    loadData();
  }, [fetchAllBookings, fetchCourts, showToast]);

  const handleFiltersChange = async (newFilters: BookingFiltersType) => {
    setFilters(newFilters);
    
    // If no filters are active, fetch all bookings
    const hasActiveFilters = Object.keys(newFilters).length > 0;
    
    try {
      if (hasActiveFilters) {
        await filterBookings(newFilters);
      } else {
        await fetchAllBookings();
      }
    } catch (error: any) {
      showToast('error', error.message || 'Error al aplicar els filtres');
    }
  };

  const courtsForFilter = courts.map(court => ({
    id: court.id,
    name: court.name,
  }));

  if (error && bookings.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Visualització de Reserves</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Consulta totes les reserves del sistema
          </p>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Visualització de Reserves</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Consulta totes les reserves del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {bookings.length} {bookings.length === 1 ? 'reserva' : 'reserves'}
          </span>
        </div>
      </div>

      <BookingFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        courts={courtsForFilter}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'list' | 'calendar')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span>Llista</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Calendari</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <BookingListView bookings={bookings} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <BookingCalendarView bookings={bookings} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
