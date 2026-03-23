import React from 'react';
import { SearchBar } from './SearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedSearch, AdvancedSearchFilters } from './AdvancedSearch';
import { FileCode2, Clock, Tag, Star, Search } from 'lucide-react';
import { Note } from '@/types/note';
import { cn } from '@/lib/utils';
import { LanguageIcon } from './LanguageIcon';
import { Virtuoso } from 'react-virtuoso';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  advancedFilters: AdvancedSearchFilters;
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  languages: string[];
  selectedNoteIds: Set<string>;
  onToggleSelect: (id: string) => void;
  displayDensity: 'compact' | 'cozy';
  onToggleDensity: () => void;
  allTags: string[];
  settings?: {
    codeFontSize: string;
    titleFontSize: string;
    theme: string;
  };
}

export function NoteList({ 
  notes, 
  selectedNoteId, 
  onSelectNote, 
  searchQuery, 
  onSearchChange,
  advancedFilters,
  onFiltersChange,
  languages,
  selectedNoteIds,
  onToggleSelect,
  displayDensity,
  onToggleDensity,
  allTags,
  settings
}: NoteListProps) {
  return (
    <div className="flex flex-col h-full border-r border-border/50 bg-muted/10">
      <div className="p-4 space-y-4 bg-background/50 backdrop-blur-sm border-b border-border/40">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
             <FileCode2 className="w-4 h-4 text-primary" />
             <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
              {notes.length} Snippet{notes.length > 1 ? 's' : ''}
             </span>
          </div>
          <AdvancedSearch 
            filters={advancedFilters} 
            onChange={onFiltersChange} 
            languages={languages} 
            allTags={allTags}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-hidden relative">
        {notes.length > 0 ? (
          <Virtuoso
            style={{ height: '100%' }}
            data={notes}
            className="custom-scrollbar"
            totalCount={notes.length}
            itemContent={(index, note) => (
              <div className="p-3 pt-0">
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div 
                    onClick={() => onSelectNote(note.id)}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('noteId', note.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className={cn(
                      "group relative cursor-pointer rounded-xl border transition-all duration-200",
                      displayDensity === 'compact' ? "p-2.5" : "p-3",
                      selectedNoteId === note.id 
                        ? "bg-primary/10 border-primary ring-1 ring-primary/20 shadow-lg shadow-primary/5" 
                        : "bg-background/40 border-border/40 hover:border-primary/30 hover:bg-background/80"
                    )}
                  >
                    {/* Selection Checkbox */}
                    {(selectedNoteIds.size > 0 || selectedNoteId === note.id) && (
                      <div 
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(note.id);
                        }}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          selectedNoteIds.has(note.id) 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "bg-background/50 border-muted-foreground/30 hover:border-primary/50"
                        )}>
                          {selectedNoteIds.has(note.id) && <div className="w-1.5 h-1.5 rounded-sm bg-current" />}
                        </div>
                      </div>
                    )}

                    <div className={cn(
                      "space-y-2",
                      (selectedNoteIds.size > 0 || selectedNoteId === note.id) ? "pl-7" : ""
                    )}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <LanguageIcon language={note.language} className="w-4 h-4 shrink-0 text-muted-foreground/70" />
                          <h3 className={cn(
                            "text-sm font-bold truncate transition-colors",
                            selectedNoteId === note.id ? "text-primary" : "text-foreground group-hover:text-primary"
                          )}>
                            {note.title || 'Sans titre'}
                          </h3>
                        </div>
                        {note.isStarred && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                      </div>
                      
                      {displayDensity === 'cozy' && (
                         <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed opacity-70">
                          {note.description || 'Aucune description'}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground/60 overflow-hidden pt-1">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3 h-3 opacity-70" />
                          <span>{new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        {note.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Tag className="w-3 h-3 shrink-0 opacity-70" />
                            <span className="truncate">#{note.tags[0]}{note.tags.length > 1 ? ` +${note.tags.length - 1}` : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          />
        ) : (
          <div className="p-3">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-40 flex flex-col items-center justify-center text-center p-6 bg-muted/5 rounded-2xl border border-dashed border-border/60"
            >
              <Search className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Aucun snippet trouvé</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">Essayez de modifier vos filtres ou de créer une nouvelle note.</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
