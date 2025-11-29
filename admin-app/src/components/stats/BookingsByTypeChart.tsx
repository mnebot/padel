import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck } from 'lucide-react';
import type { BookingsByUserType } from '@/services/statsService';

interface BookingsByTypeChartProps {
  bookingsByType: BookingsByUserType;
  isLoading?: boolean;
}

export function BookingsByTypeChart({ bookingsByType, isLoading = false }: BookingsByTypeChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBookings = bookingsByType.memberBookings + bookingsByType.nonMemberBookings;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reserves per Tipus d'Usuari</CardTitle>
        <CardDescription>
          Distribució entre socis i no socis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalBookings === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hi ha dades de reserves disponibles
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visual bar chart */}
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${bookingsByType.memberPercentage}%` }}
              />
              <div
                className="absolute top-0 h-full bg-purple-500 transition-all duration-300"
                style={{
                  left: `${bookingsByType.memberPercentage}%`,
                  width: `${bookingsByType.nonMemberPercentage}%`,
                }}
              />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Socis</p>
                  <p className="text-2xl font-bold">{bookingsByType.memberBookings}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bookingsByType.memberPercentage.toFixed(1)}% del total
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">No Socis</p>
                  <p className="text-2xl font-bold">{bookingsByType.nonMemberBookings}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bookingsByType.nonMemberPercentage.toFixed(1)}% del total
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
