import React, { useMemo, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Note } from '@/types/note';
import { useTheme } from '@/hooks/useTheme';
import { X, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GraphViewProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const GraphView: React.FC<GraphViewProps> = ({ notes, onSelectNote, onClose, isOpen }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => note.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (note.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'all' || (note.tags && note.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  const graphData = useMemo(() => {
    const nodes = filteredNotes.map(note => ({
      id: note.id,
      name: note.title || 'Sans titre',
      val: 1
    }));

    const links: { source: string; target: string }[] = [];
    
    filteredNotes.forEach(note => {
      // Find all [[WikiLinks]] in content
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
      let match;
      while ((match = wikiLinkRegex.exec(note.description || '')) !== null) {
        const targetTitle = match[1];
        const targetNote = filteredNotes.find(n => (n.title || '').toLowerCase() === targetTitle.toLowerCase());
        if (targetNote) {
          links.push({
            source: note.id,
            target: targetNote.id
          });
        }
      }
    });

    return { nodes, links };
  }, [filteredNotes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in duration-300">
      <div className="relative w-full h-full bg-[#050505] rounded-3xl border border-primary/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-border/40 bg-muted/20 gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Vue Graphe des Connexions</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-widest">Explorez votre Second Cerveau</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/50 h-9 rounded-full text-xs"
              />
            </div>
            
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[140px] h-9 rounded-full bg-background/50 border-border/50 text-xs">
                <Tag className="w-3.5 h-3.5 mr-2" />
                <SelectValue placeholder="Tous les tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>#{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted/80 ml-auto h-9 w-9 text-muted-foreground hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Graph Container */}
        <div className="flex-1 relative cursor-grab active:cursor-grabbing bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]">
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node: any) => {
              return node.id === filteredNotes[0]?.id ? '#f43f5e' : '#0ea5e9';
            }}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              
              // Draw circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.id === filteredNotes[0]?.id ? '#f43f5e' : '#0ea5e9';
              ctx.fill();
              
              // Glow effect
              ctx.shadowColor = node.id === filteredNotes[0]?.id ? '#f43f5e' : '#0ea5e9';
              ctx.shadowBlur = 15;
              ctx.stroke();
              ctx.shadowBlur = 0;

              // Text label
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#ffffff';
              ctx.fillText(label, node.x, node.y + 10);
            }}
            linkColor={() => 'rgba(255, 255, 255, 0.2)'}
            linkDirectionalParticles={4}
            linkDirectionalParticleSpeed={0.006}
            linkWidth={1.5}
            onNodeClick={(node: any) => {
              onSelectNote(node.id);
              onClose();
            }}
            backgroundColor="transparent"
            width={window.innerWidth > 1200 ? window.innerWidth - 128 : window.innerWidth - 32}
            height={window.innerHeight - 150}
          />
          {filteredNotes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-2 bg-black/50 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                <Search className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium text-white">Aucune note ne correspond aux filtres</p>
                <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedTag('all'); }} className="text-xs text-primary">Réinitialiser les filtres</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-black/40 border-t border-white/10 flex justify-between items-center px-8 z-10 backdrop-blur-md">
           <div className="flex gap-6 text-[10px] font-bold text-white/70 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{filteredNotes.length} {filteredNotes.length <= 1 ? 'Note' : 'Notes'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                <span>{graphData.links.length} {graphData.links.length <= 1 ? 'Connexion' : 'Connexions'}</span>
              </div>
           </div>
           <p className="text-[10px] italic text-white/50">Cliquez sur une note pour l'ouvrir</p>
        </div>
      </div>
    </div>
  );
};

