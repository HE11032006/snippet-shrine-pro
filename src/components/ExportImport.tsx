import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { Note } from '@/types/note';

interface ExportImportProps {
  notes: Note[];
  onImport: (notes: Note[]) => void;
}

export function ExportImport({ notes, onImport }: ExportImportProps) {
  const handleExport = () => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-notes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Export réussi', description: `${notes.length} notes exportées.` });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        
        if (!Array.isArray(imported)) {
          throw new Error('Format invalide');
        }

        // Validate notes structure
        const validNotes = imported.filter((note: unknown) => {
          if (typeof note !== 'object' || note === null) return false;
          const n = note as Record<string, unknown>;
          return typeof n.id === 'string' && 
                 typeof n.title === 'string' && 
                 typeof n.category === 'string';
        }) as Note[];

        if (validNotes.length === 0) {
          throw new Error('Aucune note valide trouvée');
        }

        onImport(validNotes);
        toast({ 
          title: 'Import réussi', 
          description: `${validNotes.length} notes importées.` 
        });
      } catch (error) {
        toast({ 
          title: 'Erreur d\'import', 
          description: 'Le fichier n\'est pas un JSON valide.',
          variant: 'destructive'
        });
      }
    };
    input.click();
  };

  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            className="text-muted-foreground hover:text-foreground"
          >
            <Download className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Exporter les notes</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleImport}
            className="text-muted-foreground hover:text-foreground"
          >
            <Upload className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Importer des notes</TooltipContent>
      </Tooltip>
    </div>
  );
}
