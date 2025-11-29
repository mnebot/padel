import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ErrorMessage } from '../common/ErrorMessage';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Introdueix un email vàlid'),
  password: z.string().min(1, 'La contrasenya és obligatòria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface AdminLoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string | null;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSubmit, error }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data.email, data.password);
    } catch (err) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary-100 rounded-full">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <CardTitle className="text-center">Accés d'Administrador</CardTitle>
        <CardDescription className="text-center">
          Introdueix les teves credencials d'administrador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && <ErrorMessage message={error} />}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@exemple.com"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contrasenya</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Iniciant sessió...
              </>
            ) : (
              'Iniciar Sessió'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
