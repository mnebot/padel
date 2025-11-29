import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courtSchema, type CourtFormData } from '@/utils/validationSchemas';
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
import { Checkbox } from '@/components/ui/checkbox';
import type { Court } from '@/types/court';

interface CourtFormProps {
  court?: Court;
  onSubmit: (data: CourtFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CourtForm({ court, onSubmit, onCancel, isLoading = false }: CourtFormProps) {
  const form = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Reset form when court changes
  useEffect(() => {
    if (court) {
      form.reset({
        name: court.name,
        description: court.description || '',
        isActive: court.isActive,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        isActive: true,
      });
    }
  }, [court, form]);

  const handleSubmit = async (data: CourtFormData) => {
    try {
      await onSubmit(data);
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
              <FormLabel>Nom de la pista</FormLabel>
              <FormControl>
                <Input
                  placeholder="Pista 1"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                El nom identificatiu de la pista
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripció</FormLabel>
              <FormControl>
                <Input
                  placeholder="Descripció de la pista (opcional)"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Informació addicional sobre la pista
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Pista activa
                </FormLabel>
                <FormDescription>
                  Les pistes inactives no es poden reservar
                </FormDescription>
              </div>
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
            {isLoading ? 'Guardant...' : court ? 'Actualitzar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
