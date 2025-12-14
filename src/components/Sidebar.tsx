import { useState } from 'react';
import { Code2, FolderOpen, Hash, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ExportImport } from '@/components/ExportImport';
import { TagFilter } from '@/components/TagFilter';
import { Note } from '@/types/note';

interface SidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
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
            <TooltipContent side="right">Nouvelle Note</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            onClick={onNewNote}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Note
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {!collapsed && (
          <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Catégories
          </div>
        )}
        
        <nav className="space-y-1">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectCategory(null)}
                  className={cn(
                    'w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200',
                    selectedCategory === null 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <FolderOpen className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Toutes les notes</TooltipContent>
            </Tooltip>
          ) : (
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
          )}

          {categories.map(category => (
            collapsed ? (
              <Tooltip key={category}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectCategory(category)}
                    className={cn(
                      'w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200',
                      selectedCategory === category 
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
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={cn(
                  'sidebar-item w-full',
                  selectedCategory === category && 'active'
                )}
              >
                <Hash className="w-4 h-4" />
                {category}
              </button>
            )
          ))}
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
          <div className="flex items-center justify-between">
            <ExportImport notes={notes} onImport={onImport} />
            <ThemeToggle />
          </div>
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
