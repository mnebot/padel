import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { BookingStatus } from '@/types/booking';
import type { BookingFilters as BookingFiltersType } from '@/services/bookingService';

interface BookingFiltersProps {
  filters: BookingFiltersType;
  onFiltersChange: (filters: BookingFiltersType) => void;
  courts: Array<{ id: string; name: string }>;
}

export function BookingFilters({ filters, onFiltersChange, courts }: BookingFiltersProps) {
  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      const { status, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, status: value as typeof BookingStatus[keyof typeof BookingStatus] });
    }
  };

  const handleCourtChange = (value: string) => {
    if (value === 'all') {
      const { courtId, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, courtId: value });
    }
  };

  const handleDateFromChange = (value: string) => {
    if (value === '') {
      const { dateFrom, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, dateFrom: value });
    }
  };

  const handleDateToChange = (value: string) => {
    if (value === '') {
      const { dateTo, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, dateTo: value });
    }
  };

  const handleUserIdChange = (value: string) => {
    if (value.trim() === '') {
      const { userId, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, userId: value });
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = 
    filters.status || 
    filters.courtId || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.userId;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Data des de</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Data fins</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Pista</label>
          <Select
            value={filters.courtId || 'all'}
            onValueChange={handleCourtChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Totes les pistes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Totes les pistes</SelectItem>
              {courts.map((court) => (
                <SelectItem key={court.id} value={court.id}>
                  {court.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Estat</label>
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tots els estats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tots els estats</SelectItem>
              <SelectItem value={BookingStatus.REQUESTED}>Sol·licitada</SelectItem>
              <SelectItem value={BookingStatus.CONFIRMED}>Confirmada</SelectItem>
              <SelectItem value={BookingStatus.COMPLETED}>Completada</SelectItem>
              <SelectItem value={BookingStatus.CANCELLED}>Cancel·lada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">ID Usuari</label>
          <Input
            placeholder="Filtra per usuari..."
            value={filters.userId || ''}
            onChange={(e) => handleUserIdChange(e.target.value)}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Filtres actius:</span>
            {filters.dateFrom && (
              <span className="bg-secondary px-2 py-1 rounded">
                Des de: {filters.dateFrom}
              </span>
            )}
            {filters.dateTo && (
              <span className="bg-secondary px-2 py-1 rounded">
                Fins: {filters.dateTo}
              </span>
            )}
            {filters.courtId && (
              <span className="bg-secondary px-2 py-1 rounded">
                Pista: {courts.find(c => c.id === filters.courtId)?.name || filters.courtId}
              </span>
            )}
            {filters.status && (
              <span className="bg-secondary px-2 py-1 rounded">
                Estat: {filters.status}
              </span>
            )}
            {filters.userId && (
              <span className="bg-secondary px-2 py-1 rounded">
                Usuari: {filters.userId}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Netejar filtres
          </Button>
        </div>
      )}
    </div>
  );
}
