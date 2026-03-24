import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { CustomCodeBlock } from './extensions/CodeBlockExtension';
import { WikiLink } from './extensions/WikiLinkExtension';
import { Note, NoteFormData } from '@/types/note';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Tag, Plus, X, Command, Code2, BookOpen, Bug, Check, Link2,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus, CheckSquare, Type,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Palette
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { NOTE_TEMPLATES } from '@/components/NoteTemplates';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'cpp', label: 'C++' },
  { value: 'markdown', label: 'Markdown' },
];

interface FullPageEditorProps {
  note?: Note | null;
  categories: string[];
  existingTags?: string[];
  existingSubcategories?: Record<string, string[]>;
  notes: Note[];
  onSave: (data: NoteFormData) => void;
  onCancel: () => void;
  onSelectNoteByTitle?: (title: string) => void;
  isZenMode?: boolean;
}

export function FullPageEditor({
  note,
  categories,
  existingTags = [],
  existingSubcategories = {},
  notes = [],
  onSave,
  onCancel,
  onSelectNoteByTitle,
  isZenMode = false
}: FullPageEditorProps) {
  const [formData, setFormData] = useState<NoteFormData>(() => {
    let initialDesc = note?.description || '';
    if (note?.code) {
      initialDesc += `\n\n\`\`\`${note?.language || 'javascript'}\n${note.code}\n\`\`\`\n`;
    }
    return {
      title: note?.title || '',
      category: note?.category || '',
      subcategory: note?.subcategory || '',
      description: initialDesc,
      code: '',
      language: note?.language || 'javascript',
      tags: note?.tags || [],
    };
  });
  
  const [tagInput, setTagInput] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const backlinks = useMemo(() => {
    if (!note) return [];
    return notes.filter(n => 
      n.id !== note.id && 
      (n.description.includes(`[[${note.title}]]`) || n.description.includes(`data-title="${note.title}"`))
    );
  }, [note, notes]);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [addedCategories, setAddedCategories] = useState<string[]>([]);

  const [showNewSubcategory, setShowNewSubcategory] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [addedSubcategories, setAddedSubcategories] = useState<Record<string, string[]>>({});

  const allCategories = useMemo(() => {
    return Array.from(new Set([...categories, ...addedCategories]));
  }, [categories, addedCategories]);

  const subcategoriesForCategory = useMemo(() => {
    if (!formData.category) return [];
    const base = existingSubcategories[formData.category] || [];
    const added = addedSubcategories[formData.category] || [];
    return Array.from(new Set([...base, ...added]));
  }, [formData.category, existingSubcategories, addedSubcategories]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CustomCodeBlock,
      WikiLink,
      Markdown,
      Underline,
      TextStyle,
      Color,
      Strike,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: "Commencez à écrire... ou tapez '/' pour les commandes, ou appuyez sur entrée.",
      }),
    ],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, description: (editor.storage as any).markdown.getMarkdown() }));
      
      const { selection } = editor.state;
      const textAfterSlash = editor.state.doc.textBetween(
        Math.max(0, selection.from - 20), 
        selection.from, 
        '\n'
      );
      
      const slashIndex = textAfterSlash.lastIndexOf('/');
      if (slashIndex !== -1) {
        const query = textAfterSlash.slice(slashIndex + 1);
        if (!query.includes(' ')) {
          // Calculate position
          const { view } = editor;
          const { from } = selection;
          const coords = view.coordsAtPos(from);
          const editorBounds = view.dom.getBoundingClientRect();
          
          setMenuPosition({
            top: coords.top - editorBounds.top + view.dom.scrollTop,
            left: coords.left - editorBounds.left,
          });
          
          setShowSlashMenu(true);
          setSlashQuery(query.toLowerCase());
          return;
        }
      }
      
      setShowSlashMenu(false);
      setSlashQuery('');
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base prose-invert max-w-none focus:outline-none min-h-[200px]',
      },
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target as HTMLElement;
          if (target.hasAttribute('data-wiki-link')) {
            const title = target.getAttribute('data-title');
            if (title && onSelectNoteByTitle) {
              onSelectNoteByTitle(title);
              return true;
            }
          }
          return false;
        },
      },
    },
  });

  // Removed toggleVimMode and getCodeMirrorExtensions as they are no longer needed.

  const handleShowCode = () => {
    if (editor) {
      const { from } = editor.state.selection;
      editor.commands.deleteRange({ from: from - slashQuery.length - 1, to: from });
      editor.chain().focus().toggleCodeBlock().run();
    }
    setShowSlashMenu(false);
  };

  const executeCommand = (command: () => void) => {
    if (editor) {
      const { from } = editor.state.selection;
      editor.commands.deleteRange({ from: from - slashQuery.length - 1, to: from });
      command();
    }
    setShowSlashMenu(false);
  };

  const SLASH_COMMANDS = [
    { id: 'h1', label: 'Titre 1', icon: Heading1, command: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
    { id: 'h2', label: 'Titre 2', icon: Heading2, command: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { id: 'h3', label: 'Titre 3', icon: Heading3, command: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    { id: 'bold', label: 'Gras', icon: Bold, command: () => editor?.chain().focus().toggleBold().run() },
    { id: 'italic', label: 'Italique', icon: Italic, command: () => editor?.chain().focus().toggleItalic().run() },
    { id: 'underline', label: 'Souligné', icon: UnderlineIcon, command: () => editor?.chain().focus().toggleUnderline().run() },
    { id: 'strike', label: 'Barré', icon: Strikethrough, command: () => editor?.chain().focus().toggleStrike().run() },
    { id: 'text', label: 'Texte', icon: Type, command: () => editor?.chain().focus().setParagraph().run() },
    { id: 'red', label: 'Texte Rouge', icon: Palette, command: () => editor?.chain().focus().setColor('#ef4444').run() },
    { id: 'blue', label: 'Texte Bleu', icon: Palette, command: () => editor?.chain().focus().setColor('#3b82f6').run() },
    { id: 'green', label: 'Texte Vert', icon: Palette, command: () => editor?.chain().focus().setColor('#22c55e').run() },
    { id: 'bullet', label: 'Liste à puces', icon: List, command: () => editor?.chain().focus().toggleBulletList().run() },
    { id: 'ordered', label: 'Liste numérotée', icon: ListOrdered, command: () => editor?.chain().focus().toggleOrderedList().run() },
    { id: 'task', label: 'Liste de tâches', icon: CheckSquare, command: () => editor?.chain().focus().toggleTaskList().run() },
    { id: 'quote', label: 'Citation', icon: Quote, command: () => editor?.chain().focus().toggleBlockquote().run() },
    { id: 'code', label: 'Bloc de Code', icon: Code2, command: handleShowCode },
    { id: 'divider', label: 'Séparateur', icon: Minus, command: () => editor?.chain().focus().setHorizontalRule().run() },
    { id: 'link', label: 'Lien Standard', icon: Link2, command: () => {
      const url = window.prompt('Entrez l\'URL du lien :');
      if (url) {
        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    }},
    { id: 'journal', label: 'Modèle Journal', icon: BookOpen, command: () => editor?.commands.insertContent(NOTE_TEMPLATES.find(t => t.id === 'daily-log')?.data.description || '') },
    { id: 'bug', label: 'Modèle Bug', icon: Bug, command: () => editor?.commands.insertContent(NOTE_TEMPLATES.find(t => t.id === 'bug-fix')?.data.description || '') },
  ];

  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(slashQuery) || cmd.id.includes(slashQuery)
  );

  const handleSave = () => {
    if (!formData.title.trim() || !formData.category.trim()) {
      toast({ title: 'Erreur', description: 'Le titre et la catégorie sont requis.', variant: 'destructive' });
      return;
    }
    // Remove code if it wasn't toggled but has text, or keep it depending on rules. We just save the form data.
    onSave({
      ...formData,
      // Markdown-like description is automatically maintained by TipTap (getHTML())
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleAddCategory = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const trimmed = newCategory.trim();
    if (trimmed) {
      setAddedCategories(prev => [...new Set([...prev, trimmed])]);
      setFormData(prev => ({ ...prev, category: trimmed, subcategory: '' }));
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  const handleAddSubcategory = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const trimmed = newSubcategory.trim();
    if (trimmed && formData.category) {
      setAddedSubcategories(prev => ({
        ...prev,
        [formData.category]: [...new Set([...(prev[formData.category] || []), trimmed])]
      }));
      setFormData(prev => ({ ...prev, subcategory: trimmed }));
      setNewSubcategory('');
      setShowNewSubcategory(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto animate-fade-in group">
      {/* Top Header / Metadata Bar */}
      <div className={cn(
        "flex items-center justify-between px-8 py-4 border-b border-border/50 bg-muted/20 sticky top-0 z-10 backdrop-blur-md transition-all",
        isZenMode && "pl-16"
      )}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Input/Select */}
          {showNewCategory ? (
            <div className="flex items-center gap-1">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory(e);
                  if (e.key === 'Escape') setShowNewCategory(false);
                }}
                placeholder="Nouvelle Catégorie..."
                className="w-[180px] h-8 text-xs bg-transparent border-dashed"
                autoFocus
              />
              <Button type="button" variant="ghost" size="sm" onClick={handleAddCategory} className="h-8 px-2 text-primary"><Check className="w-3 h-3" /></Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCategory(false)} className="h-8 px-2 text-muted-foreground"><X className="w-3 h-3" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Select value={formData.category} onValueChange={(val) => setFormData(p => ({...p, category: val, subcategory: ''}))}>
                <SelectTrigger className="w-[180px] h-8 text-xs bg-transparent border-dashed">
                  <SelectValue placeholder="Choisir Catégorie..." />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCategory(true)} className="h-8 px-2 text-muted-foreground hover:text-primary"><Plus className="w-3 h-3" /></Button>
            </div>
          )}

          {/* Subcategory Input/Select */}
          {showNewSubcategory ? (
            <div className="flex items-center gap-1">
              <Input
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubcategory(e);
                  if (e.key === 'Escape') setShowNewSubcategory(false);
                }}
                placeholder="Nouvelle Sous-Catégorie..."
                className="w-[180px] h-8 text-xs bg-transparent border-dashed"
                autoFocus
              />
              <Button type="button" variant="ghost" size="sm" onClick={handleAddSubcategory} className="h-8 px-2 text-primary"><Check className="w-3 h-3" /></Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewSubcategory(false)} className="h-8 px-2 text-muted-foreground"><X className="w-3 h-3" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Select value={formData.subcategory || '_none'} onValueChange={(val) => setFormData(p => ({...p, subcategory: val === '_none' ? '' : val}))} disabled={!formData.category}>
                <SelectTrigger className="w-[180px] h-8 text-xs bg-transparent border-dashed">
                  <SelectValue placeholder={formData.category ? "Sous-catégorie..." : "Sous-catégorie"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Aucune</SelectItem>
                  {subcategoriesForCategory.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewSubcategory(true)} disabled={!formData.category} className="h-8 px-2 text-muted-foreground hover:text-primary"><Plus className="w-3 h-3" /></Button>
            </div>
          )}
          
          <Select value={formData.language} onValueChange={(val) => setFormData(p => ({...p, language: val}))}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-transparent border-dashed">
              <SelectValue placeholder="Langage" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 relative">
            <Tag className="w-3 h-3 text-muted-foreground" />
            <Input 
              placeholder="Ajouter tag (Entrée)" 
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="h-8 w-[150px] text-xs bg-transparent border-none focus-visible:ring-1"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            Annuler
          </Button>
          <Button size="sm" onClick={handleSave} className="btn-gradient shadow-md shadow-primary/20">
            <Check className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-8 py-12 flex-1">
        
        {/* Tags badges */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {formData.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        {/* Title Input */}
        <input
          type="text"
          placeholder="Titre de la note..."
          value={formData.title}
          onChange={e => setFormData(prev => ({...prev, title: e.target.value}))}
          className="w-full text-4xl sm:text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30 mb-8 tracking-tight text-foreground"
          autoFocus
        />

        {/* TipTap Editor */}
        <div className="min-h-[300px] mb-8 relative">
          
          {showSlashMenu && (
            <div 
              className="absolute z-50 flex flex-col p-1 bg-card border border-border/50 rounded-xl shadow-2xl w-64 animate-scale-in max-h-[400px] overflow-y-auto"
              style={{ 
                top: `${menuPosition.top + 25}px`, 
                left: `${Math.min(menuPosition.left, (editor?.view.dom.clientWidth || 800) - 260)}px` 
              }}
            >
              <div className="px-3 py-2 flex items-center justify-between border-b border-border/30 mb-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Commandes</span>
                {slashQuery && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">/{slashQuery}</span>}
              </div>
              <div className="p-1 space-y-0.5">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map(cmd => (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd.command)}
                      className="w-full flex items-center gap-3 px-2.5 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-lg text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                        <cmd.icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{cmd.label}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-xs text-muted-foreground text-center italic">Aucun résultat</div>
                )}
              </div>
            </div>
          )}

          <EditorContent editor={editor} onClick={() => setShowSlashMenu(false)} />
        </div>

        {/* Backlinks Section */}
        {backlinks.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border/30 opacity-60 hover:opacity-100 transition-opacity">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Link2 className="w-3 h-3" />
              Liens entrants ({backlinks.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {backlinks.map(bn => (
                <button
                  key={bn.id}
                  onClick={() => onSelectNoteByTitle?.(bn.title)}
                  className="flex flex-col p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 text-left transition-all group"
                >
                  <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">{bn.title}</span>
                  <span className="text-[10px] text-muted-foreground">{bn.category}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
