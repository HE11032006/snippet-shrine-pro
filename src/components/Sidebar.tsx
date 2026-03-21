import { useState, useMemo } from 'react';
import { Code2, FolderOpen, Hash, Plus, ChevronLeft, ChevronRight, ChevronDown, Star, Clock, Tag, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ExportImport } from '@/components/ExportImport';
import { TagFilter } from '@/components/TagFilter';
import { Statistics } from '@/components/Statistics';
import { Note } from '@/types/note';

interface SidebarProps {
  categories: string[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelectCategory: (category: string | null, subcategory?: string | null) => void;
  onNewNote: () => void;
  notesCount: number;
  notes: Note[];
  onImport: (notes: Note[]) => void;
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export function Sidebar({ 
  categories, 
  selectedCategory,
  selectedSubcategory,
  onSelectCategory, 
  onNewNote, 
  notesCount,
  notes,
  onImport,
  tags,
  selectedTags,
  onToggleTag,
  onClearTags
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Get subcategories for each category
  const subcategoriesByCategory = useMemo(() => {
    const result: Record<string, string[]> = {};
    notes.forEach(note => {
      if (note.subcategory) {
        if (!result[note.category]) {
          result[note.category] = [];
        }
        if (!result[note.category].includes(note.subcategory)) {
          result[note.category].push(note.subcategory);
        }
      }
    });
    // Sort subcategories
    Object.keys(result).forEach(cat => {
      result[cat].sort();
    });
    return result;
  }, [notes]);

  const toggleCategoryExpand = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCategoryClick = (category: string | null) => {
    onSelectCategory(category, null);
  };

  const handleSubcategoryClick = (category: string, subcategory: string) => {
    onSelectCategory(category, subcategory);
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="p-2.5 rounded-xl bg-primary/15 shrink-0 shadow-lg shadow-primary/10">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-foreground truncate gradient-text">Code Notes</h1>
              <p className="text-xs text-muted-foreground font-medium">{notesCount} snippets</p>
            </div>
          )}
        </div>
      </div>

      {/* New Note Button */}
      <div className="p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewNote}
                size="icon"
                className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Nouvelle Note (Ctrl+N)</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewNote}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Note
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ctrl+N</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Smart Folders / Navigation */}
      <div className="px-3 space-y-4">
        {!collapsed && (
          <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </div>
        )}
        <nav className="space-y-1">
          {/* Toutes les notes */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={cn(
              collapsed ? 'w-full flex items-center justify-center p-2.5 rounded-lg' : 'sidebar-item w-full',
              selectedCategory === null && !selectedSubcategory && 'active'
            )}
          >
            <FolderOpen className={cn(collapsed ? "w-5 h-5" : "w-4 h-4")} />
            {!collapsed && <span className="flex-1 text-left">Toutes les notes</span>}
          </button>

          {/* Favoris */}
          <button
            onClick={() => onSelectCategory('__starred__', null)}
            className={cn(
              collapsed ? 'w-full flex items-center justify-center p-2.5 rounded-lg' : 'sidebar-item w-full text-amber-500 hover:text-amber-600',
              selectedCategory === '__starred__' && 'active bg-amber-500/10 text-amber-600'
            )}
          >
            <Star className={cn(collapsed ? "w-5 h-5" : "w-4 h-4", selectedCategory === '__starred__' && "fill-current")} />
            {!collapsed && <span className="flex-1 text-left">Favoris</span>}
          </button>

          {/* Récents */}
          <button
            onClick={() => onSelectCategory('__recent__', null)}
            className={cn(
              collapsed ? 'w-full flex items-center justify-center p-2.5 rounded-lg' : 'sidebar-item w-full',
              selectedCategory === '__recent__' && 'active'
            )}
          >
            <Clock className={cn(collapsed ? "w-5 h-5" : "w-4 h-4")} />
            {!collapsed && <span className="flex-1 text-left">Récents</span>}
          </button>

          {/* Sans étiquettes */}
          <button
            onClick={() => onSelectCategory('__untagged__', null)}
            className={cn(
              collapsed ? 'w-full flex items-center justify-center p-2.5 rounded-lg' : 'sidebar-item w-full',
              selectedCategory === '__untagged__' && 'active'
            )}
          >
            <Inbox className={cn(collapsed ? "w-5 h-5" : "w-4 h-4")} />
            {!collapsed && <span className="flex-1 text-left">Sans étiquettes</span>}
          </button>
        </nav>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {!collapsed && (
          <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Catégories
          </div>
        )}
        
        <nav className="space-y-1">

          {categories.map(category => {
            const subcategories = subcategoriesByCategory[category] || [];
            const hasSubcategories = subcategories.length > 0;
            const isExpanded = expandedCategories.includes(category);
            const isSelected = selectedCategory === category;

            return collapsed ? (
              <Tooltip key={category}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={cn(
                      'w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200',
                      isSelected
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Hash className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{category}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={category}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    'sidebar-item w-full group',
                    isSelected && !selectedSubcategory && 'active'
                  )}
                >
                  <Hash className="w-4 h-4" />
                  <span className="flex-1 text-left">{category}</span>
                  {hasSubcategories && (
                    <span
                      onClick={(e) => toggleCategoryExpand(category, e)}
                      className="p-1 hover:bg-sidebar-accent rounded transition-colors"
                    >
                      <ChevronDown className={cn(
                        "w-3 h-3 transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </span>
                  )}
                </button>
                
                {/* Subcategories */}
                {hasSubcategories && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-border pl-3">
                    {subcategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => handleSubcategoryClick(category, sub)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
                          selectedCategory === category && selectedSubcategory === sub
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                        )}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Tag Filter */}
        {!collapsed && (
          <TagFilter
            tags={tags}
            selectedTags={selectedTags}
            onToggleTag={onToggleTag}
            onClearTags={onClearTags}
          />
        )}
      </div>

      {/* Footer with tools */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {!collapsed && (
          <>
            <Statistics notes={notes} />
            <div className="flex items-center justify-between">
              <ExportImport notes={notes} onImport={onImport} />
              <ThemeToggle />
            </div>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full text-muted-foreground hover:text-foreground",
            collapsed && "px-0 justify-center"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Réduire
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
