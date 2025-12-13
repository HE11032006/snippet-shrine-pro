import { Code2, FolderOpen, Hash, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onNewNote: () => void;
}

export function Sidebar({ categories, selectedCategory, onSelectCategory, onNewNote }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Code Notes</h1>
            <p className="text-xs text-muted-foreground">Gérez vos snippets</p>
          </div>
        </div>
      </div>

      {/* New Note Button */}
      <div className="p-3">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90 glow-primary"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Note
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Catégories
        </div>
        
        <nav className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              'sidebar-item w-full',
              selectedCategory === null && 'active'
            )}
          >
            <FolderOpen className="w-4 h-4" />
            Toutes les notes
          </button>

          {categories.map(category => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={cn(
                'sidebar-item w-full animate-slide-in-left',
                selectedCategory === category && 'active'
              )}
            >
              <Hash className="w-4 h-4" />
              {category}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          {categories.length} catégorie{categories.length !== 1 ? 's' : ''}
        </p>
      </div>
    </aside>
  );
}
