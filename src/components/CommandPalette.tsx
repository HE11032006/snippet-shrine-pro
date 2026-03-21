import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { 
  Search, 
  Plus, 
  Moon, 
  Sun, 
  Trash2, 
  Copy, 
  FileCode2,
  Command as CommandIcon 
} from 'lucide-react';
import { Note } from '@/types/note';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (noteId: string) => void;
  onNewNote: () => void;
  onToggleTheme: () => void;
}

export function CommandPalette({ 
  isOpen, 
  onClose, 
  notes, 
  onSelectNote, 
  onNewNote, 
  onToggleTheme 
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');

  // Close on selection/action
  const runCommand = (command: () => void) => {
    command();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-2xl max-w-2xl">
        <Command 
          className="glass-panel rounded-2xl overflow-hidden border border-border/60 animate-in fade-in zoom-in-95 duration-200"
          value={search}
          onValueChange={setSearch}
        >
          <div className="flex items-center border-b border-border/50 px-4 py-3 gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Command.Input 
              placeholder="Chercher une note ou taper une commande..." 
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
              autoFocus
            />
            <kbd className="hidden sm:flex h-6 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              Aucun résultat trouvé.
            </Command.Empty>

            <Command.Group heading="Commandes" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              <Command.Item 
                onSelect={() => runCommand(onNewNote)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-default select-none hover:bg-primary/10 hover:text-primary aria-selected:bg-primary/10 aria-selected:text-primary transition-colors text-sm font-medium"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Plus className="w-4 h-4" />
                </div>
                Nouvelle Note
                <div className="ml-auto text-[10px] text-muted-foreground font-mono">Ctrl+N</div>
              </Command.Item>
              
              <Command.Item 
                onSelect={() => runCommand(onToggleTheme)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-default select-none hover:bg-primary/10 hover:text-primary aria-selected:bg-primary/10 aria-selected:text-primary transition-colors text-sm font-medium"
              >
                <div className="p-1.5 rounded-lg bg-secondary/80 text-muted-foreground">
                  <Moon className="w-4 h-4 dark:hidden" />
                  <Sun className="w-4 h-4 hidden dark:block" />
                </div>
                Changer le Thème
                <div className="ml-auto text-[10px] text-muted-foreground font-mono">/dark /light</div>
              </Command.Item>
            </Command.Group>

            {notes.length > 0 && (
              <Command.Group heading="Notes récentes" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                {notes.slice(0, 10).map(note => (
                  <Command.Item 
                    key={note.id}
                    onSelect={() => runCommand(() => onSelectNote(note.id))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-default select-none hover:bg-primary/10 hover:text-primary aria-selected:bg-primary/10 aria-selected:text-primary transition-colors text-sm font-medium group"
                  >
                    <div className="p-1.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <FileCode2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{note.title}</div>
                      <div className="text-[10px] text-muted-foreground flex gap-2">
                        <span>{note.category}</span>
                        {note.tags.length > 0 && <span>#{note.tags[0]}</span>}
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="mt-auto border-t border-border/50 p-2 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded bg-muted px-1.5 py-0.5 border border-border">↑↓</kbd> Naviguer
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded bg-muted px-1.5 py-0.5 border border-border">⏎</kbd> Sélectionner
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CommandIcon className="w-3 h-3" />
              Palette
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
