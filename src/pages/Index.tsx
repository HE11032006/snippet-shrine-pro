import { useState, useMemo, useEffect } from 'react';
import { FileCode2 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Note, NoteFormData } from '@/types/note';
import { Sidebar } from '@/components/Sidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { SearchBar } from '@/components/SearchBar';
import { NoteCard } from '@/components/NoteCard';
import { NoteForm } from '@/components/NoteForm';

const Index = () => {
  const { notes, isLoaded, addNote, updateNote, deleteNote, getCategories } = useNotes();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Apply dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const categories = useMemo(() => getCategories(), [notes, getCategories]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    // Filter by category
    if (selectedCategory) {
      result = result.filter(note => note.category === selectedCategory);
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
  }, [notes, selectedCategory, searchQuery]);

  const handleNewNote = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

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

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

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
          onSelectCategory={setSelectedCategory}
          onNewNote={handleNewNote}
          notesCount={notes.length}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onNewNote={handleNewNote}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {selectedCategory || 'Toutes les notes'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} trouvée{filteredNotes.length !== 1 ? 's' : ''}
            </p>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
          onSave={handleSaveNote}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};

export default Index;
