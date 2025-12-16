import { Trash2, Download, X, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note } from '@/types/note';

interface SelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onExportSelected: () => void;
}

export function SelectionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onExportSelected,
}: SelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="flex items-center gap-3 px-5 py-3 bg-card border border-border rounded-2xl shadow-2xl backdrop-blur-lg">
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedCount < totalCount && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              className="rounded-xl text-xs"
            >
              Tout sélectionner ({totalCount})
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportSelected}
            className="rounded-xl text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteSelected}
            className="rounded-xl text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="rounded-xl h-8 w-8 ml-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
