import { useState } from 'react';
import { Filter, Calendar, Code, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export interface AdvancedSearchFilters {
  language: string;
  dateFrom: string;
  dateTo: string;
  searchInCode: boolean;
  searchInDescription: boolean;
  searchInTitle: boolean;
}

interface AdvancedSearchProps {
  filters: AdvancedSearchFilters;
  onChange: (filters: AdvancedSearchFilters) => void;
  languages: string[];
}

const DEFAULT_FILTERS: AdvancedSearchFilters = {
  language: 'all',
  dateFrom: '',
  dateTo: '',
  searchInCode: true,
  searchInDescription: true,
  searchInTitle: true,
};

export function AdvancedSearch({ filters, onChange, languages }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.language !== 'all',
    filters.dateFrom !== '',
    filters.dateTo !== '',
    !filters.searchInCode,
    !filters.searchInDescription,
    !filters.searchInTitle,
  ].filter(Boolean).length;

  const handleReset = () => {
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Filter className="w-4 h-4" />
        Filtres avancés
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 p-4 bg-card border border-border rounded-xl shadow-lg z-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Language Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Code className="w-4 h-4" />
              Langage
            </Label>
            <Select
              value={filters.language}
              onValueChange={(value) => onChange({ ...filters, language: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les langages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les langages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Période
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Du</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Au</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Search Scope */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rechercher dans</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Titre</span>
                <Switch
                  checked={filters.searchInTitle}
                  onCheckedChange={(checked) => onChange({ ...filters, searchInTitle: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Description</span>
                <Switch
                  checked={filters.searchInDescription}
                  onCheckedChange={(checked) => onChange({ ...filters, searchInDescription: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Code</span>
                <Switch
                  checked={filters.searchInCode}
                  onCheckedChange={(checked) => onChange({ ...filters, searchInCode: checked })}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={handleReset} className="flex-1">
              <X className="w-3 h-3 mr-1" />
              Réinitialiser
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsOpen(false)} className="flex-1">
              Appliquer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_FILTERS };
