import { UserCard } from './UserCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import type { User } from '@/types/user';

interface UserListProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onEdit: (user: User) => void;
}

export function UserList({
  users,
  isLoading,
  error,
  onEdit,
}: UserListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Carregant usuaris..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        variant="card"
        title="Error al carregar els usuaris"
        message={error}
      />
    );
  }

  if (!users || !Array.isArray(users) || users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No s'han trobat usuaris amb els filtres aplicats.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
