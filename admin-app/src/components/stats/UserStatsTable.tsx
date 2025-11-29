import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserStats } from '@/services/statsService';

interface UserStatsTableProps {
  userStats: UserStats[];
  isLoading?: boolean;
}

export function UserStatsTable({ userStats, isLoading = false }: UserStatsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by total bookings descending
  const sortedStats = [...userStats].sort((a, b) => b.totalBookings - a.totalBookings);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadístiques d'Usuaris</CardTitle>
        <CardDescription>
          Comptadors d'ús i reserves per usuari
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hi ha dades d'usuaris disponibles
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuari</TableHead>
                  <TableHead>Tipus</TableHead>
                  <TableHead className="text-right">Comptador d'Ús</TableHead>
                  <TableHead className="text-right">Total Reserves</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStats.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.userName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.userType === 'MEMBER' ? 'default' : 'secondary'}
                      >
                        {user.userType === 'MEMBER' ? 'Soci' : 'No Soci'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">{user.usageCount}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.totalBookings}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
