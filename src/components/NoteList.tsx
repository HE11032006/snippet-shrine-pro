import React from 'react';
import { SearchBar } from './SearchBar';
import { AdvancedSearch, AdvancedSearchFilters } from './AdvancedSearch';
import { FileCode2, Clock, Tag } from 'lucide-react';
import { Note } from '@/types/note';

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
}: NoteListProps) {
  return (
    <div className="flex flex-col h-full border-r border-border/50 bg-muted/10">
      {/* Header / Search */}
      <div className="p-4 space-y-3 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={onSearchChange} />
          </div>
          <AdvancedSearch 
            filters={advancedFilters} 
            onChange={onFiltersChange} 
            languages={languages} 
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notes.length > 0 ? (
          <div className="divide-y divide-border/30">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`p-4 cursor-pointer transition-all hover:bg-primary/5 relative group ${
                  selectedNoteId === note.id ? 'bg-primary/10 border-l-4 border-primary' : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold truncate text-sm flex-1 ${selectedNoteId === note.id ? 'text-primary' : 'text-foreground'}`}>
                    {note.title || 'Sans titre'}
                  </h4>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2 opacity-60">
                    {new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed opacity-80">
                  {note.description || 'Aucune description'}
                </p>

                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="px-1.5 py-0.5 rounded bg-secondary/50 text-[9px] font-bold text-secondary-foreground uppercase tracking-tight">
                    {note.language}
                  </span>
                  {note.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] text-primary/70 font-medium">#{tag}</span>
                  ))}
                  {note.tags.length > 2 && <span className="text-[9px] text-muted-foreground">+{note.tags.length - 2}</span>}
                </div>

                {/* Selection checkbox visible on hover or if selected */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(note.id);
                  }}
                  className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedNoteIds.has(note.id) ? 'opacity-100' : ''}`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedNoteIds.has(note.id) ? 'bg-primary border-primary' : 'bg-background border-border shadow-sm'
                  }`}>
                    {selectedNoteIds.has(note.id) && <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-40">
            <FileCode2 className="w-12 h-12 mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">Aucun snippet</p>
          </div>
        )}
      </div>
    </div>
  );
}
