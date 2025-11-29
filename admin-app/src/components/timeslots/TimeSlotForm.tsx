import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { timeSlotSchema, type TimeSlotFormData } from '@/utils/validationSchemas';
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
import type { TimeSlot } from '@/types/timeSlot';
import { getDayOfWeekName } from '@/utils/dateUtils';

interface TimeSlotFormProps {
  timeSlot?: TimeSlot;
  onSubmit: (data: TimeSlotFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TimeSlotForm({ timeSlot, onSubmit, onCancel, isLoading = false }: TimeSlotFormProps) {
  const form = useForm<TimeSlotFormData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      dayOfWeek: timeSlot?.dayOfWeek ?? 1,
      startTime: timeSlot?.startTime || '09:00',
      endTime: timeSlot?.endTime || '10:00',
      duration: timeSlot?.duration || 60,
      type: timeSlot?.type || 'OFF_PEAK',
    },
  });

  const handleSubmit = async (data: TimeSlotFormData) => {
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
          name="dayOfWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dia de la setmana</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value.toString()}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un dia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {getDayOfWeekName(day)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Dia de la setmana per aquesta franja horària
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora d'inici</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    placeholder="09:00"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Format: HH:mm
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de fi</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    placeholder="10:00"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Format: HH:mm
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durada (minuts)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="60"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  disabled={isLoading}
                  min={30}
                  max={240}
                  step={15}
                />
              </FormControl>
              <FormDescription>
                Durada de cada reserva en aquesta franja (30-240 minuts)
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
              <FormLabel>Tipus de franja</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="OFF_PEAK">Hora Vall</SelectItem>
                  <SelectItem value="PEAK">Hora Punta</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Les hores punta tenen més demanda i poden tenir prioritats diferents
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
            {isLoading ? 'Guardant...' : timeSlot ? 'Actualitzar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
