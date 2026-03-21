import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Settings2, Type, Code2, Palette } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    codeFontSize: string;
    titleFontSize: string;
    theme: string;
  };
  onUpdateSettings: (newSettings: any) => void;
}

export function SettingsDialog({ isOpen, onClose, settings, onUpdateSettings }: SettingsDialogProps) {
  // Convert string rem/px to numeric values for sliders
  const getNumericValue = (val: string) => {
    return parseFloat(val.replace('rem', '')) || 1;
  };

  const codeSize = getNumericValue(settings.codeFontSize);
  const titleSize = getNumericValue(settings.titleFontSize);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-panel border-border/40 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings2 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold">Paramètres d'Excellence</DialogTitle>
          </div>
          <DialogDescription>
            Personnalisez votre espace de travail pour une productivité maximale.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-8">
          {/* Code Font Size */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                <span>Taille police du Code</span>
              </div>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded border">
                {settings.codeFontSize}
              </span>
            </div>
            <Slider
              value={[codeSize]}
              min={0.7}
              max={1.5}
              step={0.05}
              onValueChange={([val]) => onUpdateSettings({ ...settings, codeFontSize: `${val}rem` })}
              className="py-2"
            />
          </div>

          {/* Title Font Size */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Type className="w-4 h-4 text-muted-foreground" />
                <span>Taille police des Titres</span>
              </div>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded border">
                {settings.titleFontSize}
              </span>
            </div>
            <Slider
              value={[titleSize]}
              min={1}
              max={2.5}
              step={0.1}
              onValueChange={([val]) => onUpdateSettings({ ...settings, titleFontSize: `${val}rem` })}
              className="py-2"
            />
          </div>

          {/* Theme Placeholder */}
          <div className="space-y-4 pt-2">
             <div className="flex items-center gap-2 text-sm font-semibold">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span>Style du Thème</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start gap-2 h-9 border-primary/20 bg-primary/5 text-primary">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  Indigo Slate
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-9 opacity-50 grayscale cursor-not-allowed">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  Rose (Bientôt)
                </Button>
              </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
            Terminer et Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
