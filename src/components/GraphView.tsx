import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Note } from '@/types/note';
import { useTheme } from '@/hooks/useTheme';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GraphViewProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const GraphView: React.FC<GraphViewProps> = ({ notes, onSelectNote, onClose, isOpen }) => {
  const { theme } = useTheme();

  const graphData = useMemo(() => {
    const nodes = notes.map(note => ({
      id: note.id,
      name: note.title || 'Sans titre',
      val: 1
    }));

    const links: { source: string; target: string }[] = [];
    
    notes.forEach(note => {
      // Find all [[WikiLinks]] in content
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
      let match;
      while ((match = wikiLinkRegex.exec(note.description)) !== null) {
        const targetTitle = match[1];
        const targetNote = notes.find(n => n.title.toLowerCase() === targetTitle.toLowerCase());
        if (targetNote) {
          links.push({
            source: note.id,
            target: targetNote.id
          });
        }
      }
    });

    return { nodes, links };
  }, [notes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in duration-300">
      <div className="relative w-full h-full bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40 bg-muted/20">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Vue Graphe des Connexions</h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Explorez votre Second Cerveau</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted/80">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Graph Container */}
        <div className="flex-1 relative cursor-grab active:cursor-grabbing bg-[radial-gradient(circle_at_center,var(--muted-foreground)/5_1px,transparent_1px)] bg-[size:24px_24px]">
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeRelSize={6}
            nodeColor={() => 'hsl(var(--primary))'}
            linkColor={() => 'hsl(var(--primary) / 0.2)'}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={(node: any) => {
              onSelectNote(node.id);
              onClose();
            }}
            backgroundColor="transparent"
            width={window.innerWidth > 1200 ? window.innerWidth - 128 : window.innerWidth - 32}
            height={window.innerHeight - 150}
          />
        </div>

        {/* Footer info */}
        <div className="p-4 bg-muted/10 border-t border-border/20 flex justify-between items-center px-8">
           <div className="flex gap-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{notes.length} Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/20" />
                <span>{graphData.links.length} Connexions</span>
              </div>
           </div>
           <p className="text-[10px] italic text-muted-foreground/40">Cliquez sur une note pour l'ouvrir</p>
        </div>
      </div>
    </div>
  );
};
