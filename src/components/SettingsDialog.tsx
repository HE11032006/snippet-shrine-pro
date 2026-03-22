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
import { Settings2, Type, Code2, Palette, GitBranch, Folder, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    codeFontSize: string;
    titleFontSize: string;
    theme: string;
    gitRepoPath: string;
    gitAutoSync: boolean;
    gitRemoteUrl: string;
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

        <div className="py-2">
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 rounded-xl p-1">
              <TabsTrigger value="appearance" className="rounded-lg gap-2 text-xs font-bold">
                <Palette className="w-3.5 h-3.5" />
                Apparence
              </TabsTrigger>
              <TabsTrigger value="sync" className="rounded-lg gap-2 text-xs font-bold">
                <GitBranch className="w-3.5 h-3.5" />
                Synchronisation Git
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6 pt-2">
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

              <div className="space-y-4">
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
                      Midnight (Bientôt)
                    </Button>
                  </div>
              </div>
            </TabsContent>

            <TabsContent value="sync" className="space-y-6 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Local Repository</Label>
                <div className="flex gap-2">
                  <Input 
                    value={settings.gitRepoPath} 
                    placeholder="Choisir un dossier..." 
                    className="flex-1 input-modern text-xs" 
                    readOnly 
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl shrink-0"
                    onClick={async () => {
                      if (window.require) {
                        const { ipcRenderer } = window.require('electron');
                        const path = await ipcRenderer.invoke('select-directory');
                        if (path) onUpdateSettings({ ...settings, gitRepoPath: path });
                      }
                    }}
                  >
                    <Folder className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Remote URL (HTTPS/SSH)</Label>
                <Input 
                  value={settings.gitRemoteUrl} 
                  onChange={(e) => onUpdateSettings({ ...settings, gitRemoteUrl: e.target.value })}
                  placeholder="https://github.com/user/repo.git" 
                  className="input-modern text-xs" 
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Auto-Sync</Label>
                  <p className="text-[10px] text-muted-foreground italic">Committer à chaque modification</p>
                </div>
                <Switch 
                  checked={settings.gitAutoSync} 
                  onCheckedChange={(val) => onUpdateSettings({ ...settings, gitAutoSync: val })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="gap-2 rounded-xl text-xs font-bold"
                  disabled={!settings.gitRepoPath}
                  onClick={async () => {
                     if (window.require) {
                        const { ipcRenderer } = window.require('electron');
                        const res = await ipcRenderer.invoke('git-command', { 
                          command: 'git pull origin main', 
                          repoPath: settings.gitRepoPath 
                        });
                        if (res.success) toast({ title: 'Pull réussi' });
                        else toast({ title: 'Erreur Pull', description: res.error, variant: 'destructive' });
                     }
                  }}
                >
                  <ArrowDown className="w-3.5 h-3.5 text-blue-500" />
                  PULL
                </Button>
                <Button 
                  variant="outline" 
                   className="gap-2 rounded-xl text-xs font-bold"
                   disabled={!settings.gitRepoPath}
                   onClick={async () => {
                     if (window.require) {
                        const { ipcRenderer } = window.require('electron');
                        const res = await ipcRenderer.invoke('git-command', { 
                          command: 'git push origin main', 
                          repoPath: settings.gitRepoPath 
                        });
                        if (res.success) toast({ title: 'Push réussi' });
                        else toast({ title: 'Erreur Push', description: res.error, variant: 'destructive' });
                     }
                  }}
                >
                  <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                  PUSH
                </Button>
              </div>
              
              {!settings.gitRepoPath && (
                <p className="text-[10px] text-center text-amber-500 font-medium">Sélectionnez un dépôt local pour activer Git.</p>
              )}
            </TabsContent>
          </Tabs>
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
