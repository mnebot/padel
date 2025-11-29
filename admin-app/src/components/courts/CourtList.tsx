import { CourtCard } from './CourtCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import type { Court } from '@/types/court';

interface CourtListProps {
  courts: Court[];
  isLoading: boolean;
  error: string | null;
  onEdit: (court: Court) => void;
  onDelete: (court: Court) => void;
  onToggleActive: (court: Court) => void;
}

export function CourtList({
  courts,
  isLoading,
  error,
  onEdit,
  onDelete,
  onToggleActive,
}: CourtListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Carregant pistes..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        variant="card"
        title="Error al carregar les pistes"
        message={error}
      />
    );
  }

  if (!courts || !Array.isArray(courts) || courts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hi ha pistes creades. Crea la primera pista per començar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courts.map((court) => (
        <CourtCard
          key={court.id}
          court={court}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
}
