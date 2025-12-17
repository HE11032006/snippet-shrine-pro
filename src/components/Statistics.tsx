import { useMemo } from 'react';
import { BarChart3, FileCode2, FolderOpen, Tag, Calendar, Code } from 'lucide-react';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StatisticsProps {
  notes: Note[];
}

export function Statistics({ notes }: StatisticsProps) {
  const stats = useMemo(() => {
    const categories = new Map<string, number>();
    const languages = new Map<string, number>();
    const tags = new Map<string, number>();
    
    let totalCodeLines = 0;
    let notesWithCode = 0;
    let oldestDate = new Date();
    let newestDate = new Date(0);

    notes.forEach((note) => {
      // Categories
      categories.set(note.category, (categories.get(note.category) || 0) + 1);
      
      // Languages
      languages.set(note.language, (languages.get(note.language) || 0) + 1);
      
      // Tags
      note.tags.forEach((tag) => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
      
      // Code lines
      if (note.code) {
        totalCodeLines += note.code.split('\n').length;
        notesWithCode++;
      }
      
      // Dates
      const createdDate = new Date(note.createdAt);
      if (createdDate < oldestDate) oldestDate = createdDate;
      if (createdDate > newestDate) newestDate = createdDate;
    });

    // Sort by count and get top 5
    const topCategories = [...categories.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const topLanguages = [...languages.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const topTags = [...tags.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      totalNotes: notes.length,
      totalCategories: categories.size,
      totalLanguages: languages.size,
      totalTags: tags.size,
      totalCodeLines,
      notesWithCode,
      topCategories,
      topLanguages,
      topTags,
      oldestDate: notes.length > 0 ? oldestDate : null,
      newestDate: notes.length > 0 ? newestDate : null,
    };
  }, [notes]);

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 w-full justify-start">
          <BarChart3 className="w-4 h-4" />
          Statistiques
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Statistiques
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={FileCode2} label="Notes" value={stats.totalNotes} color="text-blue-500" />
            <StatCard icon={FolderOpen} label="Catégories" value={stats.totalCategories} color="text-green-500" />
            <StatCard icon={Code} label="Langages" value={stats.totalLanguages} color="text-purple-500" />
            <StatCard icon={Tag} label="Tags uniques" value={stats.totalTags} color="text-orange-500" />
          </div>

          {/* Code Stats */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Lignes de code</span>
                <p className="font-semibold text-lg">{stats.totalCodeLines.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Notes avec code</span>
                <p className="font-semibold text-lg">{stats.notesWithCode} / {stats.totalNotes}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Première note</span>
                <p className="font-medium">{formatDate(stats.oldestDate)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Dernière note</span>
                <p className="font-medium">{formatDate(stats.newestDate)}</p>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          {stats.topCategories.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Top Catégories</h4>
              <div className="space-y-1.5">
                {stats.topCategories.map(([name, count]) => (
                  <ProgressBar key={name} label={name} value={count} max={stats.totalNotes} />
                ))}
              </div>
            </div>
          )}

          {/* Top Languages */}
          {stats.topLanguages.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Top Langages</h4>
              <div className="space-y-1.5">
                {stats.topLanguages.map(([name, count]) => (
                  <ProgressBar key={name} label={name} value={count} max={stats.totalNotes} />
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          {stats.topTags.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Tags populaires</h4>
              <div className="flex flex-wrap gap-2">
                {stats.topTags.map(([tag, count]) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                  >
                    {tag} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ProgressBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-24 truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{value}</span>
    </div>
  );
}
