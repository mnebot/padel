import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Power, PowerOff } from 'lucide-react';
import type { Court } from '@/types/court';

interface CourtCardProps {
  court: Court;
  onEdit: (court: Court) => void;
  onDelete: (court: Court) => void;
  onToggleActive: (court: Court) => void;
}

export function CourtCard({ court, onEdit, onDelete, onToggleActive }: CourtCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{court.name}</CardTitle>
          <Badge variant={court.isActive ? 'default' : 'secondary'}>
            {court.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {court.description || 'Sense descripció'}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(court)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(court)}
            className="flex-1"
          >
            {court.isActive ? (
              <>
                <PowerOff className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Desactivar</span>
              </>
            ) : (
              <>
                <Power className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Activar</span>
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(court)}
            className="px-3"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
