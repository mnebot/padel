import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Users, TrendingUp, TrendingDown } from 'lucide-react';
import type { LotteryResult } from '@/services/lotteryService';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';

interface LotteryResultsProps {
  result: LotteryResult;
}

export function LotteryResults({ result }: LotteryResultsProps) {
  const assignmentRate = result.totalRequests > 0
    ? Math.round((result.assignedBookings / result.totalRequests) * 100)
    : 0;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd/MM/yyyy', { locale: ca });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sol·licituds</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Sol·licituds processades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignades</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {result.assignedBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              {assignmentRate}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Assignades</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {result.totalRequests - result.assignedBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              {100 - assignmentRate}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Success/Warning Alert */}
      {result.assignedBookings === result.totalRequests ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Totes les sol·licituds assignades</AlertTitle>
          <AlertDescription>
            S'han pogut assignar pistes a totes les sol·licituds pendents.
          </AlertDescription>
        </Alert>
      ) : result.assignedBookings === 0 ? (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Cap assignació realitzada</AlertTitle>
          <AlertDescription>
            No s'ha pogut assignar cap pista. Comprova que hi hagi pistes disponibles.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertDescription>
            S'han assignat {result.assignedBookings} de {result.totalRequests} sol·licituds.
            Les sol·licituds no assignades romanen pendents per a futurs sortejos.
          </AlertDescription>
        </Alert>
      )}

      {/* Assigned Bookings */}
      {result.bookings && result.bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Reserves Assignades
            </CardTitle>
            <CardDescription>
              Pistes assignades durant el sorteig
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuari</TableHead>
                    <TableHead>Pista</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Jugadors</TableHead>
                    <TableHead>Estat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.user?.name || 'Desconegut'}</p>
                          {booking.user?.email && (
                            <p className="text-xs text-muted-foreground">
                              {booking.user.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {booking.court?.name || `Pista ${booking.courtId}`}
                      </TableCell>
                      <TableCell>{formatDate(booking.date)}</TableCell>
                      <TableCell>{booking.timeSlot}</TableCell>
                      <TableCell>{booking.numberOfPlayers}</TableCell>
                      <TableCell>
                        <Badge variant="default">Confirmada</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unassigned Requests Info */}
      {result.totalRequests > result.assignedBookings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-orange-600" />
              Sol·licituds No Assignades
            </CardTitle>
            <CardDescription>
              Aquestes sol·licituds romanen pendents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Hi ha {result.totalRequests - result.assignedBookings} sol·licituds que no han
                pogut ser assignades en aquest sorteig. Aquestes sol·licituds romandran amb estat
                REQUESTED i podran participar en futurs sortejos si es tornen a executar.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
