import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, MapPin, Clock } from 'lucide-react';

interface StatsOverviewProps {
  totalActiveBookings: number;
  totalPendingRequests: number;
  totalUsers: number;
  totalCourts: number;
  isLoading?: boolean;
}

export function StatsOverview({
  totalActiveBookings,
  totalPendingRequests,
  totalUsers,
  totalCourts,
  isLoading = false,
}: StatsOverviewProps) {
  const stats = [
    {
      title: 'Reserves Actives',
      value: totalActiveBookings,
      icon: Calendar,
      description: 'Reserves confirmades',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Sol·licituds Pendents',
      value: totalPendingRequests,
      icon: Clock,
      description: 'Pendents d\'assignació',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Usuaris',
      value: totalUsers,
      icon: Users,
      description: 'Total d\'usuaris',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pistes',
      value: totalCourts,
      icon: MapPin,
      description: 'Pistes disponibles',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
