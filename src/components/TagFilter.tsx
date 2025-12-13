import { Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export function TagFilter({ tags, selectedTags, onToggleTag, onClearTags }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Tag className="w-3 h-3" />
          Tags
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearTags}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Effacer
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, 15).map(tag => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={cn(
              'px-2 py-1 text-xs rounded-md transition-all duration-200',
              selectedTags.includes(tag)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
          >
            #{tag}
          </button>
        ))}
        {tags.length > 15 && (
          <span className="px-2 py-1 text-xs text-muted-foreground">
            +{tags.length - 15}
          </span>
        )}
      </div>
    </div>
  );
}
