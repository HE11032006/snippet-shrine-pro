import { Note } from '@/types/note';
import { Link2, Link2Off } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteLinkProps {
  content: string;
  notes: Note[];
  onNoteClick: (noteId: string) => void;
}

// Regex to match [[Note Title]] syntax
const NOTE_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

export function parseNoteLinks(
  text: string, 
  notes: Note[], 
  onNoteClick: (noteId: string) => void
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = NOTE_LINK_REGEX.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const noteTitle = match[1];
    const linkedNote = notes.find(
      n => n.title.toLowerCase() === noteTitle.toLowerCase()
    );

    if (linkedNote) {
      parts.push(
        <button
          key={`link-${match.index}`}
          onClick={(e) => {
            e.stopPropagation();
            onNoteClick(linkedNote.id);
          }}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-all font-semibold border border-primary/20 hover:border-primary/40 group/link"
        >
          <Link2 className="w-3.5 h-3.5 transition-transform group-hover/link:rotate-12" />
          {linkedNote.title}
        </button>
      );
    } else {
      // Note not found - show as broken link
      parts.push(
        <span
          key={`broken-${match.index}`}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-muted-foreground/60 line-through decoration-muted-foreground/30 border border-transparent"
          title="Note non trouvée"
        >
          <Link2Off className="w-3.5 h-3.5 opacity-50" />
          {noteTitle}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function NoteLink({ content, notes, onNoteClick }: NoteLinkProps) {
  return <>{parseNoteLinks(content, notes, onNoteClick)}</>;
}
