import { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { TimeSlotList, TimeSlotForm } from '@/components/timeslots';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useToast } from '@/context/ToastContext';
import type { TimeSlot } from '@/types/timeSlot';
import type { TimeSlotFormData } from '@/utils/validationSchemas';

export function TimeSlotsPage() {
  const { timeSlots, isLoading, error, fetchTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } = useTimeSlots();
  const { showToast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined);
  const [timeSlotToDelete, setTimeSlotToDelete] = useState<TimeSlot | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  const handleCreate = () => {
    setSelectedTimeSlot(undefined);
    setConflictWarning(null);
    setIsFormOpen(true);
  };

  const handleEdit = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setConflictWarning(null);
    setIsFormOpen(true);
  };

  const handleDelete = (timeSlot: TimeSlot) => {
    setTimeSlotToDelete(timeSlot);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Check for potential conflicts with existing time slots
   * This checks if the new/updated time slot overlaps with existing ones on the same day
   */
  const checkForConflicts = (data: TimeSlotFormData, currentTimeSlotId?: string): string | null => {
    const sameDaySlots = timeSlots.filter(
      (slot) => slot.dayOfWeek === data.dayOfWeek && slot.id !== currentTimeSlotId
    );

    if (sameDaySlots.length === 0) {
      return null;
    }

    const [newStartHour, newStartMin] = data.startTime.split(':').map(Number);
    const [newEndHour, newEndMin] = data.endTime.split(':').map(Number);
    const newStartMinutes = newStartHour * 60 + newStartMin;
    const newEndMinutes = newEndHour * 60 + newEndMin;

    for (const slot of sameDaySlots) {
      const [existingStartHour, existingStartMin] = slot.startTime.split(':').map(Number);
      const [existingEndHour, existingEndMin] = slot.endTime.split(':').map(Number);
      const existingStartMinutes = existingStartHour * 60 + existingStartMin;
      const existingEndMinutes = existingEndHour * 60 + existingEndMin;

      // Check for overlap
      const hasOverlap = 
        (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes);

      if (hasOverlap) {
        return `Aquesta franja horària se solapa amb una franja existent (${slot.startTime} - ${slot.endTime}). Si continues, pot haver-hi conflictes amb reserves existents.`;
      }
    }

    return null;
  };

  const handleFormSubmit = async (data: TimeSlotFormData) => {
    try {
      setIsSubmitting(true);
      
      // Check for conflicts
      const conflict = checkForConflicts(data, selectedTimeSlot?.id);
      if (conflict) {
        setConflictWarning(conflict);
        setIsSubmitting(false);
        return;
      }

      if (selectedTimeSlot) {
        await updateTimeSlot(selectedTimeSlot.id, data);
        showToast('success', 'Franja horària actualitzada correctament');
      } else {
        await createTimeSlot(data);
        showToast('success', 'Franja horària creada correctament');
      }
      setIsFormOpen(false);
      setSelectedTimeSlot(undefined);
      setConflictWarning(null);
    } catch (error: any) {
      showToast('error', error.message || 'Error al guardar la franja horària');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!timeSlotToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteTimeSlot(timeSlotToDelete.id);
      showToast('success', 'Franja horària eliminada correctament');
      setIsDeleteDialogOpen(false);
      setTimeSlotToDelete(undefined);
    } catch (error: any) {
      showToast('error', error.message || 'Error al eliminar la franja horària');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedTimeSlot(undefined);
    setConflictWarning(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestió d'Horaris</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Configura les franges horàries i la seva classificació
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Franja Horària
        </Button>
      </div>

      <TimeSlotList
        timeSlots={timeSlots}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTimeSlot ? 'Editar Franja Horària' : 'Nova Franja Horària'}
            </DialogTitle>
          </DialogHeader>
          
          {conflictWarning && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Advertència de Conflicte</AlertTitle>
              <AlertDescription>{conflictWarning}</AlertDescription>
            </Alert>
          )}

          <TimeSlotForm
            timeSlot={selectedTimeSlot}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Eliminar Franja Horària"
        description={`Estàs segur que vols eliminar aquesta franja horària? Aquesta acció no es pot desfer. Si hi ha reserves que utilitzen aquesta franja, pot causar problemes.`}
        confirmText="Eliminar"
        cancelText="Cancel·lar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}
