import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserList, UserForm, UserFilters, type UserFiltersType } from '@/components/users';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/context/ToastContext';
import type { User } from '@/types/user';
import type { UserCreateFormData, UserUpdateFormData } from '@/utils/validationSchemas';

export function UsersPage() {
  const { users, isLoading, error, fetchUsers, createUser, updateUser } = useUsers();
  const { showToast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<UserFiltersType>({});

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Apply filters to users
  const filteredUsers = useMemo(() => {
    let result = users;

    // Filter by type
    if (filters.type) {
      result = result.filter(user => user.type === filters.type);
    }

    // Filter by search (name or email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [users, filters]);

  const handleCreate = () => {
    setSelectedUser(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: UserCreateFormData | UserUpdateFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await updateUser(selectedUser.id, data as UserUpdateFormData);
        showToast('success', 'Usuari actualitzat correctament');
      } else {
        await createUser(data as UserCreateFormData);
        showToast('success', 'Usuari creat correctament');
      }
      setIsFormOpen(false);
      setSelectedUser(undefined);
    } catch (error: any) {
      showToast('error', error.message || 'Error al guardar l\'usuari');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedUser(undefined);
  };

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestió d'Usuaris</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Crea i gestiona els usuaris del sistema
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nou Usuari
        </Button>
      </div>

      <UserFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <UserList
        users={filteredUsers}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Editar Usuari' : 'Nou Usuari'}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
