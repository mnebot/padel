import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CourtUsageStats } from '@/services/statsService';

interface UsageChartProps {
  courtUsage: CourtUsageStats[];
  isLoading?: boolean;
  showDetails?: boolean;
}

export function UsageChart({ courtUsage, isLoading = false, showDetails = false }: UsageChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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

  // Calculate max booking count for scaling
  const maxBookings = Math.max(...courtUsage.map(c => c.bookingCount), 1);
  
  // Calculate totals for detailed view
  const totalBookings = courtUsage.reduce((sum, court) => sum + court.bookingCount, 0);
  const avgUtilization = courtUsage.length > 0
    ? courtUsage.reduce((sum, court) => sum + court.utilizationRate, 0) / courtUsage.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ús de Pistes</CardTitle>
        <CardDescription>
          {showDetails 
            ? `${totalBookings} reserves totals · ${avgUtilization.toFixed(1)}% ocupació mitjana`
            : 'Nombre de reserves per pista'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {courtUsage.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hi ha dades d'ús disponibles
          </div>
        ) : (
          <div className="space-y-4">
            {courtUsage.map((court) => {
              const percentage = (court.bookingCount / maxBookings) * 100;
              const utilizationColor = 
                court.utilizationRate >= 80 ? 'bg-green-500' :
                court.utilizationRate >= 50 ? 'bg-yellow-500' :
                'bg-red-500';

              return (
                <div key={court.courtId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {court.courtName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {court.utilizationRate.toFixed(0)}% ocupació
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {court.bookingCount} reserves
                      {showDetails && totalBookings > 0 && (
                        <span className="ml-2 text-xs">
                          ({((court.bookingCount / totalBookings) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${utilizationColor} transition-all duration-300`}
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
