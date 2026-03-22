import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeMirror from '@uiw/react-codemirror';
import { vim } from '@replit/codemirror-vim';
import { langs } from '@uiw/codemirror-extensions-langs';
import { oneDark } from '@codemirror/theme-one-dark';
import { Note, NoteFormData } from '@/types/note';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tag, Plus, X, Command, Code2, BookOpen, Bug, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
  onSave: (data: NoteFormData) => void;
  onCancel: () => void;
}

export function FullPageEditor({
  note,
  categories,
  existingTags = [],
  existingSubcategories = {},
  onSave,
  onCancel
}: FullPageEditorProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    title: note?.title || '',
    category: note?.category || '',
    subcategory: note?.subcategory || '',
    description: note?.description || '',
    code: note?.code || '',
    language: note?.language || 'javascript',
    tags: note?.tags || [],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [showCode, setShowCode] = useState(!!note?.code);
  const [isVimMode, setIsVimMode] = useState(() => localStorage.getItem('shrine-vim-mode') === 'true');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Commencez à écrire... ou tapez '/' pour les commandes, ou appuyez sur entrée.",
      }),
    ],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, description: editor.getHTML() }));
      
      // Simple slash command detection
      const text = editor.getText();
      if (text.endsWith('/')) {
         // Could trigger a custom popover instead of FloatingMenu here if needed
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base prose-invert max-w-none focus:outline-none min-h-[200px]',
      },
    },
  });

  const toggleVimMode = (checked: boolean) => {
    setIsVimMode(checked);
    localStorage.setItem('shrine-vim-mode', String(checked));
    toast({ title: checked ? 'Mode NeoVim activé' : 'Mode NeoVim désactivé' });
  };

  const getCodeMirrorExtensions = useCallback(() => {
    const extensions = [];
    if (isVimMode) {
      extensions.push(vim({ status: true }));
    }
    try {
      if (langs[formData.language as keyof typeof langs]) {
        extensions.push(langs[formData.language as keyof typeof langs]());
      }
    } catch { /* ignore */ }
    return extensions;
  }, [isVimMode, formData.language]);

  const insertTemplate = (templateId: string) => {
    const template = NOTE_TEMPLATES.find(t => t.id === templateId);
    if (template && editor) {
      editor.commands.clearContent();
      editor.commands.insertContent(template.data.description || '');
      toast({ title: 'Template injecté', description: template.name });
    }
  };

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

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto animate-fade-in">
      {/* Top Header / Metadata Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border/50 bg-muted/20 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={formData.category} onValueChange={(val) => setFormData(p => ({...p, category: val}))}>
            <SelectTrigger className="w-[180px] h-8 text-xs bg-transparent border-dashed">
              <SelectValue placeholder="Choisir Catégorie..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          
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
          {editor && (
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
              <div className="flex items-center gap-1 p-1 bg-popover border border-border rounded-lg shadow-xl">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-muted ${editor.isActive('bold') ? 'bg-muted text-primary' : ''}`}><b>B</b></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-muted ${editor.isActive('italic') ? 'bg-muted text-primary' : ''}`}><i>I</i></button>
                <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1.5 rounded hover:bg-muted ${editor.isActive('code') ? 'bg-muted text-primary' : ''}`}><Code2 className="w-4 h-4" /></button>
              </div>
            </BubbleMenu>
          )}

          {editor && (
            <FloatingMenu editor={editor} tippyOptions={{ duration: 100, placement: 'right' }}>
              <div className="flex flex-col p-1.5 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl w-56 animate-scale-in">
                <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1.5 tracking-wider">Slash Commands</span>
                <button onClick={() => setShowCode(true)} className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-muted rounded-lg text-left transition-colors">
                  <Code2 className="w-4 h-4 text-emerald-500" /> Ajouter un bloc de Code
                </button>
                <button onClick={() => insertTemplate('daily-log')} className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-muted rounded-lg text-left transition-colors">
                  <BookOpen className="w-4 h-4 text-blue-500" /> Insérer Daily Log
                </button>
                <button onClick={() => insertTemplate('bug-fix')} className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-muted rounded-lg text-left transition-colors">
                  <Bug className="w-4 h-4 text-rose-500" /> Insérer Rapport de Bug
                </button>
              </div>
            </FloatingMenu>
          )}

          <EditorContent editor={editor} />
        </div>

        {/* Dedicated CodeBlock (CodeMirror) */}
        {showCode && (
          <div className="mt-8 animate-slide-up">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                Bloc de Code ({formData.language})
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="vim-mode-editor" className="text-xs text-muted-foreground cursor-pointer">NeoVim</Label>
                  <Switch id="vim-mode-editor" checked={isVimMode} onCheckedChange={toggleVimMode} className="scale-75" />
                </div>
                <button onClick={() => setShowCode(false)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                  <X className="w-3 h-3" /> Fermer le bloc
                </button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-border/50 shadow-inner">
              <CodeMirror
                value={formData.code}
                height="auto"
                minHeight="200px"
                theme={oneDark}
                extensions={getCodeMirrorExtensions()}
                onChange={(val) => setFormData(p => ({...p, code: val}))}
                className="text-sm font-mono [&_.cm-editor]:outline-none"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  bracketMatching: true,
                  autocompletion: true,
                }}
              />
            </div>
          </div>
        )}
        
        {!showCode && (
          <button 
            onClick={() => setShowCode(true)}
            className="w-full py-4 mt-8 border border-dashed border-border/50 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
          >
            <Code2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Ajouter un bloc de code
          </button>
        )}

      </div>
    </div>
  );
}
