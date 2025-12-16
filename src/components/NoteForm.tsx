import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Plus, Sparkles, Tag, Eye, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Note, NoteFormData } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { NoteTemplates, NoteTemplate } from '@/components/NoteTemplates';

interface NoteFormProps {
  note?: Note | null;
  categories: string[];
  existingTags?: string[];
  existingSubcategories?: Record<string, string[]>;
  onSave: (data: NoteFormData) => void;
  onCancel: () => void;
  onNewNote?: (template?: NoteTemplate) => void;
  initialTemplate?: NoteTemplate | null;
}

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
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'lua', label: 'Lua' },
  { value: 'perl', label: 'Perl' },
  { value: 'scala', label: 'Scala' },
  { value: 'r', label: 'R' },
  { value: 'dart', label: 'Dart' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'vbnet', label: 'VB.NET' },
  { value: 'objectivec', label: 'Objective-C' },
  { value: 'asm6502', label: 'Assembly' },
  { value: 'solidity', label: 'Solidity' },
  { value: 'zig', label: 'Zig' },
];

const DEFAULT_CATEGORIES = ['Python', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'SQL', 'Bash', 'Autre'];

export function NoteForm({ note, categories, existingTags = [], existingSubcategories = {}, onSave, onCancel, onNewNote, initialTemplate }: NoteFormProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    category: '',
    subcategory: '',
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewSubcategory, setShowNewSubcategory] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [previewMode, setPreviewMode] = useState<'write' | 'preview'>('write');
  const [addedCategories, setAddedCategories] = useState<string[]>([]);
  const [addedSubcategories, setAddedSubcategories] = useState<Record<string, string[]>>({});

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories, ...addedCategories])];
  const subcategoriesForCategory = formData.category 
    ? [...new Set([...(existingSubcategories[formData.category] || []), ...(addedSubcategories[formData.category] || [])])]
    : [];

  // Filter tag suggestions based on input
  const tagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return existingTags.filter(t => !formData.tags.includes(t)).slice(0, 8);
    const query = tagInput.toLowerCase();
    return existingTags
      .filter(t => t.toLowerCase().includes(query) && !formData.tags.includes(t))
      .slice(0, 5);
  }, [tagInput, existingTags, formData.tags]);

  useEffect(() => {
    if (note) {
      setFormData({
        category: note.category,
        subcategory: note.subcategory || '',
        title: note.title,
        description: note.description,
        code: note.code,
        language: note.language,
        tags: note.tags,
      });
    } else if (initialTemplate) {
      setFormData(prev => ({
        ...prev,
        title: initialTemplate.data.title || '',
        description: initialTemplate.data.description || '',
        code: initialTemplate.data.code || '',
        tags: initialTemplate.data.tags || [],
      }));
    }
  }, [note, initialTemplate]);

  const handleSelectTemplate = (template: NoteTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.data.title || '',
      description: template.data.description || '',
      code: template.data.code || '',
      tags: template.data.tags || [],
    }));
    toast({
      title: 'Template appliqué',
      description: `Le modèle "${template.name}" a été appliqué.`,
    });
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!formData.title.trim()) {
      toast({ title: 'Erreur', description: 'Le titre est requis.', variant: 'destructive' });
      return;
    }
    if (!formData.category.trim()) {
      toast({ title: 'Erreur', description: 'La catégorie est requise.', variant: 'destructive' });
      return;
    }

    onSave(formData);
    toast({
      title: note ? 'Note modifiée' : 'Note créée',
      description: note ? 'La note a été modifiée avec succès.' : 'La note a été créée avec succès.',
    });
  }, [formData, note, onSave]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: handleSubmit,
    onCancel,
  }, true);

  const addTag = (tag?: string) => {
    const tagToAdd = (tag || tagInput).trim().toLowerCase();
    if (tagToAdd && !formData.tags.includes(tagToAdd)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagToAdd] }));
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddCategory = (e?: React.MouseEvent) => {
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

  const handleAddSubcategory = (e?: React.MouseEvent) => {
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {note ? 'Modifier la note' : 'Nouvelle note'}
              </h2>
              <p className="text-xs text-muted-foreground">Ctrl+S pour sauvegarder • Échap pour annuler</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!note && (
              <NoteTemplates onSelectTemplate={handleSelectTemplate} />
            )}
            <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-150px)]">
          {/* Category, Subcategory & Language */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Catégorie</Label>
              {showNewCategory ? (
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    placeholder="Nouvelle catégorie"
                    className="input-modern"
                    autoFocus
                  />
                  <Button type="button" variant="secondary" onClick={(e) => handleAddCategory(e)} className="rounded-xl">
                    OK
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowNewCategory(false)} className="rounded-xl">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, subcategory: '' }))}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setShowNewCategory(true)} className="rounded-xl">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Subcategory */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Sous-catégorie <span className="text-muted-foreground font-normal text-xs">(optionnel)</span></Label>
              {showNewSubcategory ? (
                <div className="flex gap-2">
                  <Input
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                    placeholder="Nouvelle sous-catégorie"
                    className="input-modern"
                    autoFocus
                  />
                  <Button type="button" variant="secondary" onClick={(e) => handleAddSubcategory(e)} className="rounded-xl">
                    OK
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowNewSubcategory(false)} className="rounded-xl">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={formData.subcategory || '_none'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value === '_none' ? '' : value }))}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Aucune" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Aucune</SelectItem>
                      {subcategoriesForCategory.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setShowNewSubcategory(true)} className="rounded-xl" disabled={!formData.category}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Langage</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="input-modern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Titre</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: List Comprehension en Python"
              className="input-modern text-base"
            />
          </div>

          {/* Description with Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Description <span className="text-muted-foreground font-normal">(Markdown)</span></Label>
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewMode('write')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    previewMode === 'write' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Edit2 className="w-3 h-3" />
                  Écrire
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('preview')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    previewMode === 'preview' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Prévisualiser
                </button>
              </div>
            </div>
            
            {previewMode === 'write' ? (
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Expliquez le concept, les cas d'utilisation... (supporte **gras**, *italique*, `code`, listes...)"
                rows={5}
                className="input-modern resize-none"
              />
            ) : (
              <div className="min-h-[130px] p-4 rounded-xl border border-border bg-muted/30 prose-custom text-sm overflow-auto">
                {formData.description ? (
                  <ReactMarkdown>{formData.description}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">Aucun contenu à prévisualiser</p>
                )}
              </div>
            )}
          </div>

          {/* Code (optionnel) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Code <span className="text-muted-foreground font-normal text-xs">(optionnel)</span></Label>
            <Textarea
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Collez votre code ici..."
              rows={8}
              className="input-modern font-mono text-sm resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags personnalisés
            </Label>
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Tapez un tag..."
                  className="input-modern"
                />
                <Button type="button" onClick={() => addTag()} className="btn-gradient rounded-xl px-5">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              {/* Tag suggestions dropdown */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 p-2 bg-popover border border-border rounded-xl shadow-xl animate-scale-in">
                  <p className="text-xs text-muted-foreground px-2 pb-2 font-medium">Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {tagSuggestions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="tag-badge hover:scale-105"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-xl">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag-badge selected flex items-center gap-1.5 pl-3 pr-2">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="p-0.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-border/50 bg-muted/30">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl px-6">
            Annuler
          </Button>
          <Button onClick={() => handleSubmit()} className="btn-gradient rounded-xl px-6">
            {note ? 'Enregistrer' : 'Créer la note'}
          </Button>
        </div>
      </div>
    </div>
  );
}
