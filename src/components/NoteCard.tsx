import { Edit3, Trash2, Copy, Check, Files, Sparkles, Share2, Wrench, Link2, ArrowUpRight, ChevronRight, ExternalLink, Star, Clock, Tag, FileCode2, MoreVertical, Maximize2, Download, Image as ImageIcon, Layout } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { parseNoteLinks } from '@/components/NoteLink';
import { LanguageIcon } from './LanguageIcon';
import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  allNotes?: Note[];
  onNoteClick?: (noteId: string) => void;
  settings?: {
    codeFontSize: string;
    titleFontSize: string;
    theme: string;
  };
}

export function NoteCard({ note, onEdit, onDelete, onDuplicate, isSelected, onToggleSelect, allNotes = [], onNoteClick, settings }: NoteCardProps) {
  const [copied, setCopied] = useState(false);
  const noteRef = useRef<HTMLElement>(null);

  const handleExportImage = async () => {
    if (!noteRef.current) return;
    
    try {
      const dataUrl = await toPng(noteRef.current, {
        cacheBust: true,
        backgroundColor: '#0d0d0f', // Match card background
        style: {
          padding: '24px',
          borderRadius: '16px',
        }
      });
      
      const link = document.createElement('a');
      link.download = `shrine-${note.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Export réussi",
        description: "L'image a été téléchargée.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Impossible de générer l'image.",
      });
    }
  };

  const handleExportMarkdown = () => {
    const content = `---
title: ${note.title}
category: ${note.category}
tags: ${note.tags.join(', ')}
date: ${note.updatedAt}
---

${note.description}

\`\`\`${note.language}
${note.code}
\`\`\`
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export MD réussi" });
  };

  const handleExportHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${note.title}</title>
  <style>
    body { font-family: sans-serif; padding: 40px; background: #0a0a0c; color: #fff; line-height: 1.6; }
    h1 { color: #8b5cf6; }
    pre { background: #1a1a1c; padding: 20px; border-radius: 8px; border: 1px solid #333; overflow-x: auto; }
    code { font-family: monospace; }
    .tags { color: #666; font-size: 0.8em; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  <div class="tags">catégorie: ${note.category} | tags: ${note.tags.join(', ')}</div>
  <div>${note.description.replace(/\n/g, '<br>')}</div>
  <pre><code>${note.code.replace(/</g, '&lt;')}</code></pre>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.toLowerCase().replace(/\s+/g, '-')}.html`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export HTML réussi" });
  };

  const handleExportPDF = () => {
    if (!noteRef.current) return;
    
    // Ajouter la classe de ciblage pour l'impression
    noteRef.current.classList.add('printing-note');
    
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('print-to-pdf', `${note.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      toast({ title: "Export PDF en cours...", description: "Veuillez choisir l'emplacement de sauvegarde." });
      
      // Retirer la classe après un court délai pour laisser Electron capturer
      setTimeout(() => {
        noteRef.current?.classList.remove('printing-note');
      }, 1000);
    } else {
      window.print();
      noteRef.current.classList.remove('printing-note');
    }
  };

  // Calculate backlinks (notes that link to this note)
  const backlinks = useMemo(() => {
    if (!note.title || allNotes.length === 0) return [];
    const searchStr = `[[${note.title}]]`.toLowerCase();
    return allNotes.filter(n => 
      n.id !== note.id && 
      n.description.toLowerCase().includes(searchStr)
    );
  }, [note.id, note.title, allNotes]);

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

  const handleDuplicate = () => {
    onDuplicate?.(note.id);
    toast({
      title: 'Note dupliquée',
      description: 'Une copie de la note a été créée.',
    });
  };

  const hasCode = note.code && note.code.trim().length > 0;

  // Render description with note links
  const renderDescription = (text: string) => {
    if (!onNoteClick || allNotes.length === 0) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      );
    }
    
    // Check if text contains note links
    if (text.includes('[[') && text.includes(']]')) {
      const parts = parseNoteLinks(text, allNotes, onNoteClick);
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
          {parts.map((part, i) => (
            typeof part === 'string' ? <ReactMarkdown key={i}>{part}</ReactMarkdown> : <span key={i} className="inline-block mx-0.5 align-middle">{part}</span>
          ))}
        </div>
      );
    }
    
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    );
  };

  return (
    <article ref={noteRef} className={`glass-panel rounded-2xl overflow-hidden animate-slide-up card-hover relative group/card ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {/* Selection Checkbox */}
      {onToggleSelect && (
        <div className="absolute top-4 left-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(note.id)}
            className="h-5 w-5 border-2"
          />
        </div>
      )}
      
      {/* Header */}
      <div className={`p-5 border-b border-border/50 ${onToggleSelect ? 'pl-12' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-1.5 tag-badge">
                <LanguageIcon language={note.language} className="w-4.5 h-4.5" />
                {note.category}
              </div>
              {note.subcategory && (
                <span className="tag-badge bg-secondary/50 text-secondary-foreground">{note.subcategory}</span>
              )}
              <span className="text-xs text-muted-foreground font-medium">
                {new Date(note.updatedAt).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <h3 className="font-bold text-foreground transition-all" style={{ fontSize: settings?.titleFontSize || '1.25rem' }}>{note.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            {onDuplicate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDuplicate}
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <Files className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8} className="z-[100] bg-popover/95 backdrop-blur-md border-border shadow-2xl">Dupliquer (Ctrl+D)</TooltipContent>
              </Tooltip>
            )}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>Exporter le snippet</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                <DropdownMenuItem onClick={handleExportMarkdown} className="gap-2 p-2.5 rounded-lg cursor-pointer">
                  <FileCode2 className="w-4 h-4 text-blue-500" />
                  Exporter en Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportHTML} className="gap-2 p-2.5 rounded-lg cursor-pointer">
                  <Layout className="w-4 h-4 text-orange-500" />
                  Exporter en HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2 p-2.5 rounded-lg cursor-pointer">
                  <Download className="w-4 h-4 text-red-500" />
                  Exporter en PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportImage} className="gap-2 p-2.5 rounded-lg cursor-pointer">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  Capturer en PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(note)}
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>Modifier</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>Supprimer</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Description */}
      {note.description && (
        <div className={`py-5 border-b border-border/50 bg-muted/5 ${onToggleSelect ? 'pl-12 pr-5' : 'px-5'}`}>
          {renderDescription(note.description)}
        </div>
      )}

      {/* Code */}
      {hasCode && (
        <div className="relative group/code bg-[#0d0d0f] rounded-xl overflow-hidden border border-border/40 my-4 mx-5 shadow-2xl">
          {/* Floating Action Bar - Discrete */}
          <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover/code:opacity-100 transition-all duration-200 translate-y-1 group-hover/code:translate-y-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-background/80 backdrop-blur-md border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Copier Code</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-lg bg-background/80 backdrop-blur-md border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                  onClick={() => toast({ title: "IA Magik", description: "Analyse du code en cours... (Simulé)" })}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Expliquer (IA)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-lg bg-background/80 backdrop-blur-md border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                  onClick={() => toast({ title: "Formatage", description: "Auto-formatage appliqué (Simulé)" })}
                >
                  <Wrench className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Formatter</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-lg bg-background/80 backdrop-blur-md border border-border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                  onClick={() => toast({ title: "Partage", description: "Lien de partage créé." })}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Partager</TooltipContent>
            </Tooltip>
          </div>

          <SyntaxHighlighter
            language={note.language}
            style={oneDark}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: settings?.codeFontSize || '0.9rem',
              lineHeight: '1.6',
              padding: '1.5rem',
              background: 'transparent',
            }}
            codeTagProps={{
              style: {
                fontFamily: '"JetBrains Mono", monospace',
              }
            }}
            showLineNumbers
          >
            {note.code}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Backlinks / Mentions */}
      {backlinks.length > 0 && (
        <div className="px-5 py-3 bg-primary/5 border-t border-primary/10 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider shrink-0">
            <Link2 className="w-3 h-3" />
            Mentions ({backlinks.length})
          </div>
          <div className="flex gap-2">
            {backlinks.map(link => (
              <button
                key={link.id}
                onClick={() => onNoteClick?.(link.id)}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary whitespace-nowrap bg-background/50 px-2 py-1 rounded-md border border-border/50 transition-colors group/backlink"
              >
                {link.title}
                <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover/backlink:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="px-5 py-4 flex flex-wrap gap-2 bg-muted/10 border-t border-border/10">
          {note.tags.map(tag => (
            <span key={tag} className="tag-badge text-[10px] px-2 py-0.5">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
