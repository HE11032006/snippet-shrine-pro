import { useState, useMemo, useCallback, useRef } from 'react';
import { FileCode2 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Note, NoteFormData } from '@/types/note';
import { Sidebar } from '@/components/Sidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { SearchBar } from '@/components/SearchBar';
import { NoteCard } from '@/components/NoteCard';
import { NoteForm } from '@/components/NoteForm';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { notes, isLoaded, addNote, updateNote, deleteNote, getCategories, getSubcategories, getAllTags, duplicateNote, importNotes } = useNotes();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize theme
  useTheme();

  const categories = useMemo(() => getCategories(), [notes, getCategories]);
  const allTags = useMemo(() => getAllTags(), [notes, getAllTags]);
  
  // Get subcategories for all categories (for the form)
  const allSubcategories = useMemo(() => {
    const result: Record<string, string[]> = {};
    categories.forEach(cat => {
      result[cat] = getSubcategories(cat);
    });
    return result;
  }, [categories, getSubcategories, notes]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    // Filter by category
    if (selectedCategory) {
      result = result.filter(note => note.category === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      result = result.filter(note => note.subcategory === selectedSubcategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter(note => 
        selectedTags.every(tag => note.tags.includes(tag))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.description.toLowerCase().includes(query) ||
          note.code.toLowerCase().includes(query) ||
          note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [notes, selectedCategory, selectedSubcategory, selectedTags, searchQuery]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const handleNewNote = useCallback(() => {
    setEditingNote(null);
    setIsFormOpen(true);
  }, []);

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleSaveNote = (data: NoteFormData) => {
    if (editingNote) {
      updateNote(editingNote.id, data);
    } else {
      addNote(data);
    }
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const handleCancelForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingNote(null);
  }, []);

  const handleSelectCategory = useCallback((category: string | null, subcategory?: string | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory ?? null);
  }, []);

  const handleDuplicateNote = useCallback((id: string) => {
    const newNote = duplicateNote(id);
    if (newNote) {
      toast({
        title: 'Note dupliquée',
        description: `"${newNote.title}" a été créée.`,
      });
    }
  }, [duplicateNote]);

  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onNewNote: handleNewNote,
    onSearch: handleFocusSearch,
    onCancel: handleCancelForm,
  }, !isFormOpen);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectCategory={handleSelectCategory}
          onNewNote={handleNewNote}
          notesCount={notes.length}
          notes={notes}
          onImport={importNotes}
          tags={allTags}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          onClearTags={handleClearTags}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => handleSelectCategory(cat, null)}
        onNewNote={handleNewNote}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {selectedSubcategory 
                ? `${selectedCategory} › ${selectedSubcategory}`
                : selectedCategory || 'Toutes les notes'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} trouvée{filteredNotes.length !== 1 ? 's' : ''}
              <span className="text-xs ml-2 opacity-60">(Ctrl+F pour rechercher)</span>
            </p>
            <SearchBar ref={searchInputRef} value={searchQuery} onChange={setSearchQuery} />
          </header>

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="space-y-6">
              {filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={deleteNote}
                  onDuplicate={handleDuplicateNote}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <FileCode2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucune note trouvée
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Essayez avec d\'autres termes de recherche'
                  : 'Créez votre première note de code'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleNewNote}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Créer une note
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Note Form Modal */}
      {isFormOpen && (
        <NoteForm
          note={editingNote}
          categories={categories}
          existingTags={allTags}
          existingSubcategories={allSubcategories}
          onSave={handleSaveNote}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};

export default Index;
