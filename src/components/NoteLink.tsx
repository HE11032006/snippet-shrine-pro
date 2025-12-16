import { Note } from '@/types/note';

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
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm"
        >
          📎 {linkedNote.title}
        </button>
      );
    } else {
      // Note not found - show as broken link
      parts.push(
        <span
          key={`broken-${match.index}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/10 text-destructive/70 text-sm line-through"
          title="Note non trouvée"
        >
          [[{noteTitle}]]
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
