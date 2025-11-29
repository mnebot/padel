import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import type { UserType } from '@/types/user';

export interface UserFilters {
  type?: UserType;
  search?: string;
}

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
}

export function UserFiltersComponent({ filters, onFiltersChange }: UserFiltersProps) {
  const handleTypeChange = (value: string) => {
    if (value === 'all') {
      const { type, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, type: value as UserType });
    }
  };

  const handleSearchChange = (value: string) => {
    if (value.trim() === '') {
      const { search, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, search: value });
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.type || filters.search;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nom o email..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filters.type || 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipus d'usuari" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tots els usuaris</SelectItem>
              <SelectItem value="MEMBER">Socis</SelectItem>
              <SelectItem value="NON_MEMBER">No Socis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Netejar filtres
          </Button>
        )}
      </div>
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Filtres actius:</span>
          {filters.type && (
            <span className="bg-secondary px-2 py-1 rounded">
              Tipus: {filters.type === 'MEMBER' ? 'Soci' : 'No Soci'}
            </span>
          )}
          {filters.search && (
            <span className="bg-secondary px-2 py-1 rounded">
              Cerca: "{filters.search}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
