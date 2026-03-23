import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings2, 
  Search, 
  Tag as TagIcon, 
  Command,
  Maximize2,
  Minimize2,
  Layout,
  Plus,
  ArrowRight,
  Database,
  Star,
  Clock,
  FolderOpen,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Note } from '@/types/note';
import { Statistics } from './Statistics';
import { ExportImport } from './ExportImport';
import { ThemeToggle } from './ThemeToggle';
import { TagFilter } from './TagFilter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LanguageIcon } from './LanguageIcon';

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
  displayDensity: 'compact' | 'cozy';
  onToggleDensity: () => void;
  onOpenSettings: () => void;
  onToggleZen: () => void;
  onMoveNoteToCategory: (noteId: string, category: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewDailyLog: () => void;
}

// Local Component: SmartFolders
function SmartFolders({ collapsed, selectedCategory, onSelectCategory, notes }: { 
  collapsed: boolean, 
  selectedCategory: string | null, 
  onSelectCategory: (c: string | null) => void,
  notes: Note[]
}) {
  const folders = [
    { id: '__starred__', label: 'Favoris', icon: Star, color: 'text-amber-500', count: notes.filter(n => n.isStarred).length },
    { id: '__recent__', label: 'Récents', icon: Clock, color: 'text-blue-500', count: notes.filter(n => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(n.updatedAt) >= weekAgo;
    }).length },
    { id: '__untagged__', label: 'Sans tags', icon: TagIcon, color: 'text-gray-500', count: notes.filter(n => n.tags.length === 0).length },
  ];

  return (
    <div className="space-y-1 mb-6">
      {!collapsed && <h3 className="px-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">Recherches</h3>}
      {folders.map(folder => (
        <Tooltip key={folder.id} delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onSelectCategory(selectedCategory === folder.id ? null : folder.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group",
                selectedCategory === folder.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                collapsed && "justify-center px-0 h-10 w-10 mx-auto"
              )}
            >
              <folder.icon className={cn(collapsed ? "w-6 h-6" : "w-4 h-4", selectedCategory === folder.id ? folder.color : "opacity-60")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium text-left">{folder.label}</span>
                  <span className="text-[10px] font-bold opacity-40">{folder.count}</span>
                </>
              )}
            </button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{folder.label} ({folder.count})</TooltipContent>}
        </Tooltip>
      ))}
    </div>
  );
}

// Local Component: CategoryList
function CategoryList({ 
  categories, 
  expandedCategories, 
  toggleCategory, 
  selectedCategory, 
  selectedSubcategory, 
  onSelectCategory, 
  collapsed,
  notes,
  onMoveNoteToCategory
}: {
  categories: string[],
  expandedCategories: string[],
  toggleCategory: (c: string) => void,
  selectedCategory: string | null,
  selectedSubcategory: string | null,
  onSelectCategory: (c: string | null, s?: string | null) => void,
  collapsed: boolean,
  notes: Note[],
  onMoveNoteToCategory: (noteId: string, category: string) => void
}) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    if (noteId) {
      onMoveNoteToCategory(noteId, category);
    }
  };

  return (
    <div className="space-y-1">
      {categories.map(category => {
        const isExpanded = expandedCategories.includes(category);
        const isSelected = selectedCategory === category;
        const subcategories = Array.from(new Set(notes.filter(n => n.category === category && n.subcategory).map(n => n.subcategory!)));
        const count = notes.filter(n => n.category === category).length;

        return (
          <div key={category} className="space-y-1">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (collapsed) {
                       onSelectCategory(isSelected ? null : category);
                    } else {
                       toggleCategory(category);
                       if (!isSelected) onSelectCategory(category);
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group",
                    isSelected && !selectedSubcategory 
                      ? "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    collapsed && "justify-center px-0 h-10 w-10 mx-auto",
                    "drop-target:bg-primary/20"
                  )}
                >
                  <LanguageIcon 
                    language={category} 
                    className={cn(collapsed ? "w-6 h-6" : "w-4 h-4", isSelected ? "text-primary" : "opacity-60")} 
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium text-left truncate">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold opacity-40">{count}</span>
                        {subcategories.length > 0 && (
                          <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded ? "rotate-180" : "")} />
                        )}
                      </div>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{category} ({count})</TooltipContent>}
            </Tooltip>
            
            {!collapsed && isExpanded && subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => onSelectCategory(category, sub)}
                className={cn(
                  "w-[calc(100%-1.5rem)] ml-6 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all",
                  selectedSubcategory === sub 
                    ? "bg-primary/5 text-primary font-bold" 
                    : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/30"
                )}
              >
                <div className={cn("w-1 h-1 rounded-full", selectedSubcategory === sub ? "bg-primary" : "bg-muted-foreground/30")} />
                <span className="truncate">{sub}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
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
  onClearTags,
  displayDensity,
  onToggleDensity,
  onOpenSettings,
  onToggleZen,
  onMoveNoteToCategory,
  collapsed,
  onToggleCollapse,
  onNewDailyLog,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <aside 
      className={cn(
        "h-full flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter text-primary">HE</span>
          </div>
        )}
        {collapsed ? (
          <div className="w-full flex justify-center py-2">
             <span className="font-display font-black text-xl tracking-tighter text-primary">HE</span>
          </div>
        ) : (
            <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleCollapse}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col py-4 px-2">
        {/* New Note Button */}
        {!collapsed && (
          <Button 
            onClick={() => onNewNote()}
            className="w-full justify-start gap-2 mb-6 bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Nouveau Snippet
          </Button>
        )}

        {/* Smart Folders */}
        <SmartFolders 
          collapsed={collapsed}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          notes={notes}
        />

        {/* Journal Section */}
        <div className="px-2 mb-6">
          {!collapsed && (
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Journal</h3>
              <button 
                onClick={onNewDailyLog}
                className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-500 transition-colors"
                title="Log du jour"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectCategory('Journal')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group",
                  selectedCategory === 'Journal' 
                    ? "bg-emerald-500/10 text-emerald-500 border-l-2 border-emerald-500 rounded-l-none" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  collapsed && "justify-center px-0 h-10 w-10 mx-auto"
                )}
              >
                <BookOpen className={cn(collapsed ? "w-6 h-6" : "w-4 h-4", selectedCategory === 'Journal' ? "text-emerald-500" : "opacity-60")} />
                {!collapsed && (
                  <span className="flex-1 text-sm font-medium text-left">Journal de Bord</span>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Journal de Bord</TooltipContent>}
          </Tooltip>
        </div>

        {/* Categories */}
        <div className="px-2 mb-6">
          {!collapsed && <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">Bibliothèque</h3>}
            <CategoryList 
              categories={categories}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectCategory={onSelectCategory}
              collapsed={collapsed}
              notes={notes}
              onMoveNoteToCategory={onMoveNoteToCategory}
            />
        </div>

        {/* Tag Filter */}
        {!collapsed && (
          <div className="mt-2">
            <TagFilter
              tags={tags}
              selectedTags={selectedTags}
              onToggleTag={onToggleTag}
              onClearTags={onClearTags}
            />
          </div>
        )}
      </div>

      {/* Footer Tools */}
      <div className="mt-auto border-t border-sidebar-border/50 bg-black/5 dark:bg-white/5 p-2 flex flex-col gap-2">
        {!collapsed && (
          <div className="space-y-4 p-2">
            <Statistics notes={notes} />
            
            <div className="flex items-center justify-between gap-1 pt-3 border-t border-sidebar-border/30">
               <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleZen}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Mode Zen (Ctrl+K)"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenSettings}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Paramètres"
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex bg-sidebar-accent/50 rounded-lg p-0.5 border border-sidebar-border/50">
                  <button
                    onClick={onToggleDensity}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      displayDensity === 'compact' ? "bg-sidebar-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Mode Compact"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onToggleDensity}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      displayDensity === 'cozy' ? "bg-sidebar-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Mode Confort"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <ExportImport notes={notes} onImport={onImport} />
              <ThemeToggle />
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex flex-col items-center gap-4 py-4">
             <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleZen}
                    className="h-10 w-10 rounded-xl"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Mode Zen (Ctrl+K)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenSettings}
                    className="h-10 w-10 rounded-xl"
                  >
                    <Settings2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Paramètres</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Collapse Button */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 h-8 rounded-lg justify-start gap-2 px-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Réduire</span>
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 h-8 rounded-lg justify-center p-0"
          >
             <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}
