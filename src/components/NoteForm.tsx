import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Sparkles, Tag } from 'lucide-react';
import { Note, NoteFormData } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface NoteFormProps {
  note?: Note | null;
  categories: string[];
  existingTags?: string[];
  onSave: (data: NoteFormData) => void;
  onCancel: () => void;
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
];

const DEFAULT_CATEGORIES = ['Python', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'SQL', 'Bash', 'Autre'];

export function NoteForm({ note, categories, existingTags = [], onSave, onCancel }: NoteFormProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    category: '',
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])];

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
        title: note.title,
        description: note.description,
        code: note.code,
        language: note.language,
        tags: note.tags,
      });
    }
  }, [note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
  };

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
      setFormData(prev => ({ ...prev, category: trimmed }));
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">
              {note ? 'Modifier la note' : 'Nouvelle note'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-150px)]">
          {/* Category & Language */}
          <div className="grid grid-cols-2 gap-4">
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
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Langage</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="input-modern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Description <span className="text-muted-foreground font-normal">(Markdown)</span></Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Expliquez le concept, les cas d'utilisation..."
              rows={4}
              className="input-modern resize-none"
            />
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
          <Button onClick={handleSubmit} className="btn-gradient rounded-xl px-6">
            {note ? 'Enregistrer' : 'Créer la note'}
          </Button>
        </div>
      </div>
    </div>
  );
}
