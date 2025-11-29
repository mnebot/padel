import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TimeSlotDemand } from '@/services/statsService';

interface TimeSlotDemandChartProps {
  timeSlotDemand: TimeSlotDemand[];
  isLoading?: boolean;
}

export function TimeSlotDemandChart({ timeSlotDemand, isLoading = false }: TimeSlotDemandChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by total demand (bookings + requests) descending
  const sortedDemand = [...timeSlotDemand].sort(
    (a, b) => (b.bookingCount + b.requestCount) - (a.bookingCount + a.requestCount)
  );

  const maxDemand = Math.max(
    ...sortedDemand.map(slot => slot.bookingCount + slot.requestCount),
    1
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demanda per Franja Horària</CardTitle>
        <CardDescription>
          Franges horàries més sol·licitades
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedDemand.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hi ha dades de demanda disponibles
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDemand.map((slot) => {
              const totalDemand = slot.bookingCount + slot.requestCount;
              const percentage = (totalDemand / maxDemand) * 100;

              return (
                <div key={slot.timeSlot} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {slot.timeSlot}
                      </span>
                      <Badge
                        variant={slot.type === 'PEAK' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {slot.type === 'PEAK' ? 'Hora Punta' : 'Hora Vall'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold">{totalDemand}</span>
                      {' '}
                      ({slot.bookingCount} reserves, {slot.requestCount} sol·licituds)
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
