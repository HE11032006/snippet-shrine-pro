import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Note, NoteFormData } from '@/types/note';
import { Sidebar } from '@/components/Sidebar';
import { NoteForm } from '@/components/NoteForm';
import { SelectionBar } from '@/components/SelectionBar';
import { AdvancedSearchFilters, DEFAULT_FILTERS } from '@/components/AdvancedSearch';
import { CommandPalette } from '@/components/CommandPalette';
import { NoteList } from '@/components/NoteList';
import { NoteDetail } from '@/components/NoteDetail';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from '@/hooks/use-toast';
import { NoteTemplate } from '@/components/NoteTemplates';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { notes, isLoaded, addNote, updateNote, deleteNote, getCategories, getSubcategories, getAllTags, duplicateNote, importNotes, toggleStar } = useNotes();
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
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
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

    // Filter by category or smart folder
    if (selectedCategory) {
      if (selectedCategory === '__starred__') {
        result = result.filter(note => note.isStarred);
      } else if (selectedCategory === '__recent__') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        result = result.filter(note => new Date(note.updatedAt) >= weekAgo);
      } else if (selectedCategory === '__untagged__') {
        result = result.filter(note => note.tags.length === 0);
      } else {
        result = result.filter(note => note.category === selectedCategory);
      }
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
      const newNote = addNote(data);
      if (newNote) setSelectedNoteId(newNote.id);
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

  const handleDuplicateNote = useCallback((note: Note) => {
    const newNote = duplicateNote(note.id);
    if (newNote) {
      setSelectedNoteId(newNote.id);
      toast({
        title: 'Note dupliquée',
        description: `"${newNote.title}" a été créée.`,
      });
    }
  }, [duplicateNote]);

  const handleDeleteNote = useCallback((id: string) => {
    if (confirm('Supprimer ce snippet ?')) {
      deleteNote(id);
      setSelectedNoteId(null);
      toast({ title: 'Snippet supprimé' });
    }
  }, [deleteNote]);

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
      setSelectedNoteId(null);
    }
  }, [selectedNoteIds, deleteNote]);

  const handleBatchExport = useCallback(() => {
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
    if (isSelectionMode) {
      handleToggleSelect(noteId);
    } else {
      setSelectedNoteId(noteId);
    }
  }, [isSelectionMode, handleToggleSelect]);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onNewNote: () => handleNewNote(),
    onSearch: handleFocusSearch,
    onCancel: handleCancelForm,
    onPalette: () => setIsPaletteOpen(prev => !prev),
  }, !isFormOpen);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-indigo-500 font-medium">
        <div className="animate-pulse">Chargement de vos notes...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Column 1: Sidebar */}
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

      {/* Column 2: Note List (Master) */}
      <div className="w-[350px] lg:w-[400px] flex-shrink-0 flex flex-col border-r border-border/50">
        <NoteList
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={handleNoteClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          advancedFilters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          languages={allLanguages}
          selectedNoteIds={selectedNoteIds}
          onToggleSelect={handleToggleSelect}
        />
      </div>

      {/* Column 3: Note Detail (Detail) */}
      <main className="flex-1 overflow-hidden relative bg-muted/5">
        <NoteDetail
          note={notes.find(n => n.id === selectedNoteId) || null}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          onDuplicate={handleDuplicateNote}
          onToggleStar={toggleStar}
        />

        {/* Global Floating Action Button */}
        {!isSelectionMode && (
          <div className="absolute bottom-8 right-8 z-30">
            <Button
              size="lg"
              className="rounded-full shadow-2xl px-6 py-6 h-14 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 group font-bold"
              onClick={() => handleNewNote()}
            >
              <Plus className="w-6 h-6 mr-2 transition-transform group-hover:rotate-90" />
              Nouveau Snippet
              <kbd className="ml-3 hidden sm:inline-flex h-5 items-center gap-1 rounded bg-primary-foreground/20 px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">Ctrl+N</span>
              </kbd>
            </Button>
          </div>
        )}

        {/* Selection Bar */}
        {isSelectionMode && selectedNoteIds.size > 0 && (
          <SelectionBar
            selectedCount={selectedNoteIds.size}
            totalCount={filteredNotes.length}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onDeleteSelected={handleDeleteSelected}
            onExportSelected={handleBatchExport}
          />
        )}
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
