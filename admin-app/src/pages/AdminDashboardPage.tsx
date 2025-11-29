import React, { useEffect } from 'react';
import { useStats } from '@/hooks';
import { StatsOverview, UsageChart } from '@/components/stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { stats, isLoading, error, fetchStats } = useStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard d'Administrador</h1>
          <p className="text-muted-foreground">
            Visió general del sistema de reserves
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>Error carregant les estadístiques: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard d'Administrador</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Visió general del sistema de reserves
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview
        totalActiveBookings={stats?.totalActiveBookings || 0}
        totalPendingRequests={stats?.totalPendingRequests || 0}
        totalUsers={stats?.totalUsers || 0}
        totalCourts={stats?.totalCourts || 0}
        isLoading={isLoading}
      />

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Court Usage Chart */}
        <UsageChart
          courtUsage={stats?.courtUsage || []}
          isLoading={isLoading}
        />

        {/* Additional Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Resum de Reserves</CardTitle>
            <CardDescription>
              Estat de totes les reserves del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total de Reserves</span>
                  <Badge variant="outline" className="text-base font-semibold">
                    {stats?.totalBookings || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reserves Actives</span>
                  <Badge className="bg-blue-500 text-base font-semibold">
                    {stats?.totalActiveBookings || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reserves Completades</span>
                  <Badge className="bg-green-500 text-base font-semibold">
                    {stats?.totalCompletedBookings || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reserves Cancel·lades</span>
                  <Badge variant="destructive" className="text-base font-semibold">
                    {stats?.totalCancelledBookings || 0}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Accions Ràpides
          </CardTitle>
          <CardDescription>
            Accés ràpid a les funcions principals de gestió
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <a
              href="/courts"
              className="flex flex-col items-center justify-center p-4 md:p-6 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl md:text-2xl font-bold text-purple-600">
                {stats?.totalCourts || 0}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground text-center">Gestionar Pistes</span>
            </a>
            <a
              href="/users"
              className="flex flex-col items-center justify-center p-4 md:p-6 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl md:text-2xl font-bold text-green-600">
                {stats?.totalUsers || 0}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground text-center">Gestionar Usuaris</span>
            </a>
            <a
              href="/lottery"
              className="flex flex-col items-center justify-center p-4 md:p-6 border rounded-lg hover:bg-gray-50 transition-colors sm:col-span-2 md:col-span-1"
            >
              <span className="text-xl md:text-2xl font-bold text-yellow-600">
                {stats?.totalPendingRequests || 0}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground text-center">Executar Sorteig</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
