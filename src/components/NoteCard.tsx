import { Edit3, Trash2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note.code);
    setCopied(true);
    toast({
      title: 'Code copié !',
      description: 'Le code a été copié dans le presse-papiers.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      onDelete(note.id);
      toast({
        title: 'Note supprimée',
        description: 'La note a été supprimée avec succès.',
      });
    }
  };

  return (
    <article className="glass-panel rounded-xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="tag-badge">{note.category}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(note.updatedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground truncate">{note.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(note)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      {note.description && (
        <div className="px-4 py-3 border-b border-border/50">
          <div className="prose-custom text-sm">
            <ReactMarkdown>{note.description}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Code */}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 z-10 p-2 rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
          title="Copier le code"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
        <SyntaxHighlighter
          language={note.language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.8125rem',
            padding: '1rem',
          }}
          showLineNumbers
        >
          {note.code}
        </SyntaxHighlighter>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {note.tags.map(tag => (
            <span key={tag} className="tag-badge text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
