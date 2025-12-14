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

  const hasCode = note.code && note.code.trim().length > 0;

  return (
    <article className="glass-panel rounded-2xl overflow-hidden animate-slide-up card-hover">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="tag-badge">{note.category}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {new Date(note.updatedAt).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{note.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(note)}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      {note.description && (
        <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
          <div className="prose-custom text-sm">
            <ReactMarkdown>{note.description}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Code */}
      {hasCode && (
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-secondary/90 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all shadow-lg hover:scale-105"
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
              padding: '1.25rem',
            }}
            showLineNumbers
          >
            {note.code}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="px-5 py-4 flex flex-wrap gap-2 bg-muted/20">
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
