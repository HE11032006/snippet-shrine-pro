import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus, Maximize2 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Note, NoteFormData } from '@/types/note';
import { Sidebar } from '@/components/Sidebar';
// import { NoteForm } from '@/components/NoteForm'; // Remplacé par FullPageEditor
import { FullPageEditor } from '@/components/editor/FullPageEditor';
import { SelectionBar } from '@/components/SelectionBar';
import { AdvancedSearchFilters, DEFAULT_FILTERS } from '@/components/AdvancedSearch';
import { CommandPalette } from '@/components/CommandPalette';
import { NoteList } from '@/components/NoteList';
import { NoteDetail } from '@/components/NoteDetail';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from '@/hooks/use-toast';
import { NoteTemplate, NOTE_TEMPLATES } from '@/components/NoteTemplates';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from '@/components/SettingsDialog';
import { 
  PanelGroup, 
  Panel, 
  PanelResizeHandle
} from 'react-resizable-panels';
import { cn } from '@/lib/utils';

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
  const [displayDensity, setDisplayDensity] = useState<'compact' | 'cozy'>('cozy');
  const [settings, setSettings] = useState({
    codeFontSize: '0.9rem',
    titleFontSize: '1.25rem',
    theme: 'dark',
    gitRepoPath: '',
    gitAutoSync: false,
    gitRemoteUrl: ''
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  // Apply theme class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('obsidian-dark');
    if (settings.theme === 'obsidian-dark') {
      root.classList.add('obsidian-dark');
    }
  }, [settings.theme]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize theme
  const { toggleTheme } = useTheme();

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

    // Filter by Advanced Filters (Tags)
    if (advancedFilters.tags.length > 0) {
      result = result.filter(note => 
        advancedFilters.tags.every(tag => note.tags.includes(tag))
      );
    }
    
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

  const handleMoveNoteToCategory = useCallback((noteId: string, category: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      updateNote(noteId, { ...note, category, subcategory: null });
      toast({
        title: "Snippet déplacé",
        description: `"${note.title}" est maintenant dans ${category}.`,
      });
    }
  }, [notes, updateNote]);

  // Auto-sync notes to Git Repository
  useEffect(() => {
    if (settings.gitAutoSync && settings.gitRepoPath && window.require) {
      const fs = window.require('fs');
      const path = window.require('path');
      
      const syncToGit = async () => {
        try {
          // Create category folders and write notes
          for (const note of notes) {
            const categoryDir = path.join(settings.gitRepoPath, note.category);
            if (!fs.existsSync(categoryDir)) {
              fs.mkdirSync(categoryDir, { recursive: true });
            }
            
            const fileName = `${note.title.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
            const filePath = path.join(categoryDir, fileName);
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
            fs.writeFileSync(filePath, content);
          }

          // Optional: Auto-commit
          if (settings.gitAutoSync) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('git-command', { 
              command: 'git add . && git commit -m "Auto-sync: update snippets"', 
              repoPath: settings.gitRepoPath 
            });
          }
        } catch (error) {
          console.error('Git Sync Error:', error);
        }
      };

      const timer = setTimeout(syncToGit, 2000); // Debounce sync
      return () => clearTimeout(timer);
    }
  }, [notes, settings.gitRepoPath, settings.gitAutoSync]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNewDailyLog = useCallback(() => {
    const dailyTemplate = NOTE_TEMPLATES.find(t => t.id === 'daily-log');
    if (dailyTemplate) {
      const today = new Date().toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      const logData: NoteFormData = {
        category: 'Journal',
        subcategory: '',
        title: `Log - ${today}`,
        description: dailyTemplate.data.description || '',
        code: '',
        language: 'markdown',
        tags: ['journal', 'daily-log'],
      };
      
      const newNote = addNote(logData);
      if (newNote) {
        setSelectedNoteId(newNote.id);
        setSelectedCategory('Journal');
        toast({
          title: 'Journal de bord créé',
          description: `Log du ${today} initialisé.`,
        });
      }
    }
  }, [addNote, setSelectedNoteId, setSelectedCategory]);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onNewNote: () => handleNewNote(),
    onSearch: handleFocusSearch,
    onCancel: handleCancelForm,
    onPalette: () => setIsPaletteOpen(prev => !prev),
    onZen: () => setIsZenMode(prev => !prev),
  }, !isFormOpen);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-indigo-500 font-medium">
        <div className="animate-pulse">Chargement de vos notes...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex relative">
      {/* Column 1: Sidebar - Fixed width, sticky to snippet list */}
      {!isZenMode && (
        <aside 
          className={cn(
            "h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-20 shrink-0",
            isSidebarCollapsed ? "w-16" : "w-64"
          )}
        >
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
            displayDensity={displayDensity}
            onToggleDensity={() => setDisplayDensity(prev => prev === 'compact' ? 'cozy' : 'compact')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleZen={() => setIsZenMode(prev => !prev)}
            onMoveNoteToCategory={handleMoveNoteToCategory}
            collapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
            onNewDailyLog={handleNewDailyLog}
          />
        </aside>
      )}

      {/* Main Resizable Area */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Column 2: Note List (Master) */}
        {!isZenMode && (
          <>
            <Panel defaultSize={35} minSize={25} maxSize={45} className="h-full">
              <div className="h-full flex flex-col border-r border-border/50 relative">
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
                  displayDensity={displayDensity}
                  onToggleDensity={() => setDisplayDensity(prev => prev === 'compact' ? 'cozy' : 'compact')}
                  allTags={allTags}
                  settings={settings}
                />
                
                {/* Selection Bar inside the column to follow its width */}
                {isSelectionMode && selectedNoteIds.size > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 z-40">
                    <SelectionBar
                      selectedCount={selectedNoteIds.size}
                      totalCount={filteredNotes.length}
                      onSelectAll={handleSelectAll}
                      onClearSelection={handleClearSelection}
                      onDeleteSelected={handleDeleteSelected}
                      onExportSelected={handleBatchExport}
                    />
                  </div>
                )}
              </div>
            </Panel>
            <PanelResizeHandle className="w-1 bg-border/20 hover:bg-primary/30 transition-colors cursor-col-resize" />
          </>
        )}

        {/* Column 3: Note Detail (Detail) */}
        <Panel className="h-full">
          <main className="h-full overflow-hidden relative bg-muted/5">
            {isZenMode && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsZenMode(false)}
                className="absolute top-4 left-4 z-50 rounded-full bg-background/50 backdrop-blur border shadow-sm hover:bg-background"
                title="Quitter le mode Zen"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
            {isFormOpen ? (
              <FullPageEditor
                note={editingNote}
                categories={categories}
                existingTags={allTags}
                existingSubcategories={allSubcategories}
                onSave={handleSaveNote}
                onCancel={handleCancelForm}
              />
            ) : (
              <NoteDetail
                note={notes.find(n => n.id === selectedNoteId) || null}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onDuplicate={handleDuplicateNote}
                onToggleStar={toggleStar}
                settings={settings}
              />
            )}
          </main>
        </Panel>
      </PanelGroup>

      {/* Overlays */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {(!isSelectionMode || isZenMode) && !isFormOpen && (
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
