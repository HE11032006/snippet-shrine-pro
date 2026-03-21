import React from 'react';
import { Note } from '@/types/note';
import { NoteCard } from './NoteCard';
import { FileText, Edit3, Trash2, ArrowLeft, Star } from 'lucide-react';
import { Button } from './ui/button';

interface NoteDetailProps {
  note: Note | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onDuplicate: (note: Note) => void;
  onToggleStar: (id: string) => void;
  onBack?: () => void;
  settings: {
    codeFontSize: string;
    titleFontSize: string;
    theme: string;
  };
}

export function NoteDetail({
  note,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStar,
  onBack,
  settings
}: NoteDetailProps) {
  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-background/30">
        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6 animate-pulse">
          <FileText className="w-12 h-12 text-primary/20" />
        </div>
        <h3 className="text-xl font-semibold text-foreground/80 mb-2">Sélectionnez une note</h3>
        <p className="text-muted-foreground max-w-xs mx-auto text-sm">
          Choisissez un snippet dans la liste pour voir son contenu et l'éditer.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-background">
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Actions for Detail View */}
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onToggleStar(note.id)}
              className={note.isStarred ? 'text-amber-500 border-amber-500/30 bg-amber-500/5' : ''}
            >
              <Star className={`w-4 h-4 mr-2 ${note.isStarred ? 'fill-current' : ''}`} />
              {note.isStarred ? 'Favori' : 'Marquer favori'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(note)} className="hover:bg-primary/10 hover:text-primary border-primary/20">
              <Edit3 className="w-4 h-4 mr-2" /> Éditer
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDuplicate(note)}>
              Plier (Copier)
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(note.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Supprimer
            </Button>
          </div>
        </div>

        {/* The Actual Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <NoteCard
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={() => onDuplicate(note)}
            allNotes={[]} // We could pass allNotes here if we have them
            onNoteClick={() => {}} // We could pass onNoteClick here
            settings={settings}
          />
</div>
      </div>
    </div>
  );
}
