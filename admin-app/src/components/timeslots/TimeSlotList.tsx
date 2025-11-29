import { TimeSlotCard } from './TimeSlotCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import type { TimeSlot } from '@/types/timeSlot';
import { getDayOfWeekName } from '@/utils/dateUtils';

interface TimeSlotListProps {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (timeSlot: TimeSlot) => void;
}

export function TimeSlotList({
  timeSlots,
  isLoading,
  error,
  onEdit,
  onDelete,
}: TimeSlotListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Carregant franges horàries..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        variant="card"
        title="Error al carregar les franges horàries"
        message={error}
      />
    );
  }

  if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hi ha franges horàries creades. Crea la primera franja per començar.
        </p>
      </div>
    );
  }

  // Group time slots by day of week
  const groupedByDay = timeSlots.reduce((acc, timeSlot) => {
    const day = timeSlot.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(timeSlot);
    return acc;
  }, {} as Record<number, TimeSlot[]>);

  // Sort time slots within each day by start time
  Object.keys(groupedByDay).forEach((day) => {
    const dayNumber = parseInt(day);
    const slots = groupedByDay[dayNumber];
    if (slots && Array.isArray(slots)) {
      slots.sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    }
  });

  // Sort days (0-6, Sunday to Saturday)
  const sortedDays = Object.keys(groupedByDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {sortedDays.map((day) => {
        const daySlots = groupedByDay[day];
        if (!daySlots || !Array.isArray(daySlots) || daySlots.length === 0) {
          return null;
        }
        
        return (
          <div key={day}>
            <h3 className="text-lg font-semibold mb-4">
              {getDayOfWeekName(day)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daySlots.map((timeSlot) => (
                <TimeSlotCard
                  key={timeSlot.id}
                  timeSlot={timeSlot}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
