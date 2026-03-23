import { useState, useEffect, useCallback } from 'react';
import { Note, NoteFormData } from '@/types/note';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'code-notes-data';

const defaultNotes: Note[] = [
  {
    id: uuidv4(),
    category: 'Python',
    title: 'List Comprehension',
    description: 'Une syntaxe concise pour créer des listes en Python. Très utile pour transformer ou filtrer des données.\n\n**Avantages:**\n- Plus lisible\n- Plus rapide que les boucles traditionnelles\n- Syntaxe Pythonic',
    code: `# List comprehension basique
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(squares)  # [1, 4, 9, 16, 25]

# Avec condition
evens = [x for x in numbers if x % 2 == 0]
print(evens)  # [2, 4]

# Nested comprehension
matrix = [[i*j for j in range(3)] for i in range(3)]
print(matrix)  # [[0,0,0], [0,1,2], [0,2,4]]`,
    language: 'python',
    tags: ['python', 'list', 'comprehension', 'basics'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    category: 'JavaScript',
    title: 'Async/Await Pattern',
    description: 'Gestion asynchrone moderne en JavaScript avec `async/await`. Plus lisible que les callbacks ou les `.then()`.',
    code: `// Fonction async
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Utilisation
const getData = async () => {
  const users = await fetchData('/api/users');
  console.log(users);
};`,
    language: 'javascript',
    tags: ['javascript', 'async', 'promises', 'es6'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    category: 'CSS',
    title: 'Flexbox Centering',
    description: 'La méthode la plus simple pour centrer un élément horizontalement et verticalement avec **Flexbox**.',
    code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Alternative avec place-items (Grid) */
.container-grid {
  display: grid;
  place-items: center;
  min-height: 100vh;
}`,
    language: 'css',
    tags: ['css', 'flexbox', 'centering', 'layout'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useNotes(vaultPath: string = '') {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const vaultKey = vaultPath ? `${STORAGE_KEY}-${vaultPath}` : STORAGE_KEY;

  // Load notes from localStorage
  useEffect(() => {
    setIsLoaded(false);
    const stored = localStorage.getItem(vaultKey);
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch {
        setNotes(defaultNotes);
      }
    } else {
      setNotes(defaultNotes);
    }
    setIsLoaded(true);
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(vaultKey, JSON.stringify(notes));
    }
  }, [notes, isLoaded, vaultKey]);

  const addNote = useCallback((data: NoteFormData): Note => {
    const newNote: Note = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, data: Partial<NoteFormData>) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...data, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const getCategories = useCallback((): string[] => {
    const categories = new Set(notes.map(note => note.category));
    return Array.from(categories).sort();
  }, [notes]);

  const getAllTags = useCallback((): string[] => {
    const tags = new Set(notes.flatMap(note => note.tags));
    return Array.from(tags).sort();
  }, [notes]);

  const getSubcategories = useCallback((category: string): string[] => {
    const subcategories = new Set(
      notes
        .filter(note => note.category === category && note.subcategory)
        .map(note => note.subcategory!)
    );
    return Array.from(subcategories).sort();
  }, [notes]);

  const duplicateNote = useCallback((id: string): Note | null => {
    const noteToDuplicate = notes.find(n => n.id === id);
    if (!noteToDuplicate) return null;
    
    const newNote: Note = {
      ...noteToDuplicate,
      id: uuidv4(),
      title: `${noteToDuplicate.title} (copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, [notes]);

  const importNotes = useCallback((importedNotes: Note[]) => {
    setNotes(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const newNotes = importedNotes.filter(n => !existingIds.has(n.id));
      return [...newNotes, ...prev];
    });
  }, []);

  const toggleStar = useCallback((id: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, isStarred: !note.isStarred, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }, []);

  return {
    notes,
    isLoaded,
    addNote,
    updateNote,
    deleteNote,
    getCategories,
    getSubcategories,
    getAllTags,
    duplicateNote,
    importNotes,
    toggleStar,
  };
}
