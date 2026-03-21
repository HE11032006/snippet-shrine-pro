import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FileCode2 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Note, NoteFormData } from '@/types/note';
import { Sidebar } from '@/components/Sidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { SearchBar } from '@/components/SearchBar';
import { NoteCard } from '@/components/NoteCard';
import { NoteForm } from '@/components/NoteForm';
import { SelectionBar } from '@/components/SelectionBar';
import { AdvancedSearch, AdvancedSearchFilters, DEFAULT_FILTERS } from '@/components/AdvancedSearch';
import { CommandPalette } from '@/components/CommandPalette';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from '@/hooks/use-toast';
import { NoteTemplate } from '@/components/NoteTemplates';

const Index = () => {
  const { notes, isLoaded, addNote, updateNote, deleteNote, getCategories, getSubcategories, getAllTags, duplicateNote, importNotes } = useNotes();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>(DEFAULT_FILTERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [initialTemplate, setInitialTemplate] = useState<NoteTemplate | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize theme
  const { theme, toggleTheme } = useTheme();

  const categories = useMemo(() => getCategories(), [notes, getCategories]);
  const allTags = useMemo(() => getAllTags(), [notes, getAllTags]);
  
  // Get all unique languages
  const allLanguages = useMemo(() => {
    const langs = new Set(notes.map(note => note.language));
    return Array.from(langs).sort();
  }, [notes]);
  
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

    // Filter by language (advanced filter)
    if (advancedFilters.language !== 'all') {
      result = result.filter(note => note.language === advancedFilters.language);
    }

    // Filter by date range (advanced filter)
    if (advancedFilters.dateFrom) {
      const fromDate = new Date(advancedFilters.dateFrom);
      result = result.filter(note => new Date(note.createdAt) >= fromDate);
    }
    if (advancedFilters.dateTo) {
      const toDate = new Date(advancedFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(note => new Date(note.createdAt) <= toDate);
    }

    // Filter by search query with advanced scope
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => {
        const matchTitle = advancedFilters.searchInTitle && note.title.toLowerCase().includes(query);
        const matchDescription = advancedFilters.searchInDescription && note.description.toLowerCase().includes(query);
        const matchCode = advancedFilters.searchInCode && note.code.toLowerCase().includes(query);
        const matchTags = note.tags.some(tag => tag.toLowerCase().includes(query));
        return matchTitle || matchDescription || matchCode || matchTags;
      });
    }

    return result;
  }, [notes, selectedCategory, selectedSubcategory, selectedTags, searchQuery, advancedFilters]);

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

  const handleNewNote = useCallback((template?: NoteTemplate) => {
    setEditingNote(null);
    setInitialTemplate(template || null);
    setIsFormOpen(true);
  }, []);

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setInitialTemplate(null);
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
    setInitialTemplate(null);
  };

  const handleCancelForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingNote(null);
    setInitialTemplate(null);
  }, []);

  // Listen for Electron IPC events
  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const handleTriggerNewNote = () => {
          handleNewNote();
        };
        ipcRenderer.on('trigger-new-note', handleTriggerNewNote);
        return () => {
          ipcRenderer.removeListener('trigger-new-note', handleTriggerNewNote);
        };
      } catch (e) {
        console.error('Electron IPC not available', e);
      }
    }
  }, [handleNewNote]);

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

  // Selection handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedNoteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedNoteIds(new Set(filteredNotes.map(n => n.id)));
  }, [filteredNotes]);

  const handleClearSelection = useCallback(() => {
    setSelectedNoteIds(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (confirm(`Supprimer ${selectedNoteIds.size} note(s) ?`)) {
      selectedNoteIds.forEach(id => deleteNote(id));
      toast({
        title: 'Notes supprimées',
        description: `${selectedNoteIds.size} note(s) supprimée(s).`,
      });
      setSelectedNoteIds(new Set());
    }
  }, [selectedNoteIds, deleteNote]);

  const handleExportSelected = useCallback(() => {
    const selectedNotes = notes.filter(n => selectedNoteIds.has(n.id));
    const dataStr = JSON.stringify(selectedNotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Export réussi',
      description: `${selectedNotes.length} note(s) exportée(s).`,
    });
    setSelectedNoteIds(new Set());
  }, [selectedNoteIds, notes]);

  const handleNoteClick = useCallback((noteId: string) => {
    const targetNote = notes.find(n => n.id === noteId);
    if (targetNote) {
      // Scroll to note and highlight it
      const element = document.getElementById(`note-${noteId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-primary');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary');
        }, 2000);
      }
    }
  }, [notes]);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onNewNote: () => handleNewNote(),
    onSearch: handleFocusSearch,
    onCancel: handleCancelForm,
    onPalette: () => setIsPaletteOpen(prev => !prev),
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
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBar ref={searchInputRef} value={searchQuery} onChange={setSearchQuery} />
              </div>
              <AdvancedSearch 
                filters={advancedFilters} 
                onChange={setAdvancedFilters} 
                languages={allLanguages} 
              />
            </div>
          </header>

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="space-y-6">
              {filteredNotes.map(note => (
                <div key={note.id} id={`note-${note.id}`}>
                  <NoteCard
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={deleteNote}
                    onDuplicate={handleDuplicateNote}
                    isSelected={selectedNoteIds.has(note.id)}
                    onToggleSelect={handleToggleSelect}
                    allNotes={notes}
                    onNoteClick={handleNoteClick}
                  />
                </div>
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
                  ? "Essayez avec d'autres termes de recherche"
                  : 'Créez votre première note de code'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => handleNewNote()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Créer une note
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Selection Bar */}
      <SelectionBar
        selectedCount={selectedNoteIds.size}
        totalCount={filteredNotes.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
        onExportSelected={handleExportSelected}
      />

      {/* Note Form Modal */}
      {isFormOpen && (
        <NoteForm
          note={editingNote}
          categories={categories}
          existingTags={allTags}
          existingSubcategories={allSubcategories}
          onSave={handleSaveNote}
          onCancel={handleCancelForm}
          onNewNote={handleNewNote}
          initialTemplate={initialTemplate}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        notes={notes}
        onSelectNote={handleNoteClick}
        onNewNote={handleNewNote}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
};

export default Index;
