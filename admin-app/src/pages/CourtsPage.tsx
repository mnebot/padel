import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CourtList, CourtForm } from '@/components/courts';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useCourts } from '@/hooks/useCourts';
import { useToast } from '@/context/ToastContext';
import type { Court } from '@/types/court';
import type { CourtFormData } from '@/utils/validationSchemas';

export function CourtsPage() {
  const { courts, isLoading, error, fetchCourts, createCourt, updateCourt, deleteCourt } = useCourts();
  const { showToast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | undefined>(undefined);
  const [courtToDelete, setCourtToDelete] = useState<Court | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const handleCreate = () => {
    setSelectedCourt(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (court: Court) => {
    setSelectedCourt(court);
    setIsFormOpen(true);
  };

  const handleDelete = (court: Court) => {
    setCourtToDelete(court);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = async (court: Court) => {
    try {
      setIsSubmitting(true);
      await updateCourt(court.id, { isActive: !court.isActive });
      showToast(
        'success',
        `Pista ${court.isActive ? 'desactivada' : 'activada'} correctament`
      );
    } catch (error: any) {
      showToast('error', error.message || 'Error al canviar l\'estat de la pista');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (data: CourtFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedCourt) {
        await updateCourt(selectedCourt.id, data);
        showToast('success', 'Pista actualitzada correctament');
      } else {
        await createCourt(data);
        showToast('success', 'Pista creada correctament');
      }
      setIsFormOpen(false);
      setSelectedCourt(undefined);
    } catch (error: any) {
      showToast('error', error.message || 'Error al guardar la pista');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!courtToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteCourt(courtToDelete.id);
      showToast('success', 'Pista eliminada correctament');
      setIsDeleteDialogOpen(false);
      setCourtToDelete(undefined);
    } catch (error: any) {
      showToast('error', error.message || 'Error al eliminar la pista');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedCourt(undefined);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestió de Pistes</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Crea i gestiona les pistes del club
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Pista
        </Button>
      </div>

      <CourtList
        courts={courts}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCourt ? 'Editar Pista' : 'Nova Pista'}
            </DialogTitle>
          </DialogHeader>
          <CourtForm
            court={selectedCourt}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Eliminar Pista"
        description={`Estàs segur que vols eliminar la pista "${courtToDelete?.name}"? Aquesta acció no es pot desfer. Si la pista té reserves actives, no es podrà eliminar.`}
        confirmText="Eliminar"
        cancelText="Cancel·lar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}
