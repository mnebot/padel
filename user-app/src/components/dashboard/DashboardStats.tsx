import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { User } from '../../types/user';
import { Users, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  user: User;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ user }) => {
  const userTypeLabel = user.type === 'MEMBER' ? 'Soci' : 'No Soci';
  const userTypeVariant = user.type === 'MEMBER' ? 'default' : 'secondary';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tipus d'Usuari</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge variant={userTypeVariant}>{userTypeLabel}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {user.type === 'MEMBER' 
              ? 'Tens prioritat en el sorteig de reserves'
              : 'Pots fer reserves directes i sol·licituds'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comptador d'Ús</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{user.usageCount}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Reserves completades aquest període
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
