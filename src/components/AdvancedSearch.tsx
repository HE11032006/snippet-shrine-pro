import { useState } from 'react';
import { Filter, Calendar, Code, X, ChevronDown, ChevronUp, Search, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  tags: string[];
}

interface AdvancedSearchProps {
  filters: AdvancedSearchFilters;
  onChange: (filters: AdvancedSearchFilters) => void;
  languages: string[];
  allTags: string[];
}

const DEFAULT_FILTERS: AdvancedSearchFilters = {
  language: 'all',
  dateFrom: '',
  dateTo: '',
  searchInCode: true,
  searchInDescription: true,
  searchInTitle: true,
  tags: [],
};

export function AdvancedSearch({ filters, onChange, languages, allTags }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.language !== 'all',
    filters.dateFrom !== '',
    filters.dateTo !== '',
    !filters.searchInCode,
    !filters.searchInDescription,
    !filters.searchInTitle,
    filters.tags.length > 0,
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
        className="gap-2 h-9 rounded-xl border-border/50 bg-background/50 hover:bg-background transition-all"
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filtres</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] font-bold bg-primary/10 text-primary">
            {activeFiltersCount}
          </Badge>
        )}
        {isOpen ? <ChevronUp className="w-3 h-3 opacity-50" /> : <ChevronDown className="w-3 h-3 opacity-50" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 p-5 bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl z-50 space-y-5 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Recherche Avancée
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 rounded-lg">
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Language Filter */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Code className="w-3.5 h-3.5" />
              Langage
            </Label>
            <Select
              value={filters.language}
              onValueChange={(value) => onChange({ ...filters, language: value })}
            >
              <SelectTrigger className="h-9 rounded-lg border-border/40">
                <SelectValue placeholder="Tous les langages" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem value="all">Tous les langages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags Filter */}
          <div className="space-y-3 pt-1">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" />
              Tags ({allTags.length})
            </Label>
            
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1">
              {allTags.map(tag => {
                const isSelected = filters.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = isSelected 
                        ? filters.tags.filter(t => t !== tag)
                        : [...filters.tags, tag];
                      onChange({ ...filters, tags: newTags });
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border",
                      isSelected 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30 hover:bg-muted"
                    )}
                  >
                    #{tag}
                  </button>
                );
              })}
              {allTags.length === 0 && <p className="text-[10px] text-muted-foreground italic">Aucun tag disponible</p>}
            </div>
          </div>

          {/* Search Scope */}
          <div className="space-y-3 pt-1 border-t border-border/30">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Portée de la recherche</Label>
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Titre</span>
                <Switch
                  checked={filters.searchInTitle}
                  onCheckedChange={(checked) => onChange({ ...filters, searchInTitle: checked })}
                  className="scale-90"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Description</span>
                <Switch
                  checked={filters.searchInDescription}
                  onCheckedChange={(checked) => onChange({ ...filters, searchInDescription: checked })}
                  className="scale-90"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Code</span>
                <Switch
                  checked={filters.searchInCode}
                  onCheckedChange={(checked) => onChange({ ...filters, searchInCode: checked })}
                  className="scale-90"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-border/30">
            <Button variant="ghost" size="sm" onClick={handleReset} className="flex-1 h-9 rounded-lg text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              Réinitialiser
            </Button>
            <Button variant="default" size="sm" onClick={() => setIsOpen(false)} className="flex-1 h-9 rounded-lg text-xs font-bold bg-primary shadow-lg shadow-primary/20">
              Appliquer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_FILTERS };
