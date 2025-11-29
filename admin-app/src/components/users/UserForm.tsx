import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateFormData,
  type UserUpdateFormData,
} from '@/utils/validationSchemas';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { User } from '@/types/user';

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserCreateFormData | UserUpdateFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isLoading = false }: UserFormProps) {
  const isEditing = !!user;
  
  const form = useForm<UserCreateFormData | UserUpdateFormData>({
    resolver: zodResolver(isEditing ? userUpdateSchema : userCreateSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      type: user?.type || 'NON_MEMBER',
      password: '',
    },
  });

  const handleSubmit = async (data: UserCreateFormData | UserUpdateFormData) => {
    try {
      // Remove password if it's empty during update
      if (isEditing && 'password' in data && !data.password) {
        const { password, ...dataWithoutPassword } = data;
        await onSubmit(dataWithoutPassword);
      } else {
        await onSubmit(data);
      }
      form.reset();
    } catch (error) {
      // Error is handled by parent component
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input
                  placeholder="Joan Garcia"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                El nom complet de l'usuari
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correu electrònic</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="joan@example.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                L'adreça de correu electrònic de l'usuari
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipus d'usuari</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipus d'usuari" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MEMBER">Soci</SelectItem>
                  <SelectItem value="NON_MEMBER">No Soci</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Els socis tenen prioritat en el sorteig de reserves
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isEditing ? 'Nova contrasenya (opcional)' : 'Contrasenya'}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={isEditing ? 'Deixa en blanc per no canviar' : 'Mínim 6 caràcters'}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                {isEditing
                  ? 'Deixa aquest camp en blanc si no vols canviar la contrasenya'
                  : 'La contrasenya ha de tenir almenys 6 caràcters'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel·lar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardant...' : isEditing ? 'Actualitzar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
