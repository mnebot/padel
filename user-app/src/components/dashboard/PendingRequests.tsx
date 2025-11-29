import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { BookingRequest } from '../../types/booking';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface PendingRequestsProps {
  requests: BookingRequest[];
  isLoading: boolean;
}

export const PendingRequests: React.FC<PendingRequestsProps> = ({ requests, isLoading }) => {
  const navigate = useNavigate();

  // Filter for pending requests
  const pendingRequests = requests
    .filter(r => r.status === 'REQUESTED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sol·licituds Pendents</CardTitle>
          <CardDescription>Esperant assignació per sorteig</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sol·licituds Pendents</CardTitle>
          <CardDescription>Esperant assignació per sorteig</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No tens sol·licituds pendents
            </p>
            <Button onClick={() => navigate('/bookings/new')}>
              Crear Nova Sol·licitud
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sol·licituds Pendents</CardTitle>
        <CardDescription>Esperant assignació per sorteig</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate('/bookings')}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(parseISO(request.date), 'EEEE, d MMMM yyyy', { locale: ca })}
                    </span>
                  </div>
                  <Badge variant="secondary">Pendent</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{request.timeSlot}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{request.numberOfPlayers} jugadors</span>
                  </div>
                  {request.weight !== undefined && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">Pes: {request.weight}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {pendingRequests.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/bookings')}
            >
              Veure Totes les Sol·licituds
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
