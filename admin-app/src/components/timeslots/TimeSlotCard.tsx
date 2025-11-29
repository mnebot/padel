import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Clock } from 'lucide-react';
import type { TimeSlot } from '@/types/timeSlot';
import { getDayOfWeekName } from '@/utils/dateUtils';

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (timeSlot: TimeSlot) => void;
}

export function TimeSlotCard({ timeSlot, onEdit, onDelete }: TimeSlotCardProps) {
  const isPeak = timeSlot.type === 'PEAK';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">
            {getDayOfWeekName(timeSlot.dayOfWeek)}
          </CardTitle>
          <Badge 
            variant={isPeak ? 'default' : 'secondary'}
            className={isPeak ? 'peak' : 'off-peak'}
          >
            {isPeak ? 'Hora Punta' : 'Hora Vall'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {timeSlot.startTime} - {timeSlot.endTime}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Durada: {timeSlot.duration} minuts
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(timeSlot)}
          className="flex-1"
        >
          <Pencil className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Editar</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(timeSlot)}
          className="flex-1"
        >
          <Trash2 className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Eliminar</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
