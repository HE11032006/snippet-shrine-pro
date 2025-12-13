import { Menu, X, Code2, FolderOpen, Hash, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileSidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onNewNote: () => void;
}

export function MobileSidebar({ categories, selectedCategory, onSelectCategory, onNewNote }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (category: string | null) => {
    onSelectCategory(category);
    setIsOpen(false);
  };

  const handleNewNote = () => {
    onNewNote();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-semibold text-foreground">Code Notes</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-72 bg-sidebar border-l border-sidebar-border animate-slide-in-left">
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-3">
              <button
                onClick={handleNewNote}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Note
              </button>
            </div>

            <nav className="p-3 space-y-1">
              <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Catégories
              </div>
              <button
                onClick={() => handleSelect(null)}
                className={cn('sidebar-item w-full', selectedCategory === null && 'active')}
              >
                <FolderOpen className="w-4 h-4" />
                Toutes les notes
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleSelect(category)}
                  className={cn('sidebar-item w-full', selectedCategory === category && 'active')}
                >
                  <Hash className="w-4 h-4" />
                  {category}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
