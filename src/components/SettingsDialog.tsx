import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Settings2, Type, Code2, Palette, GitBranch, Folder, ArrowUp, ArrowDown, Plus, Trash2, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
    vaults: string[];
    currentVault: string;
  };
  onUpdateSettings: (newSettings: any) => void;
}

export function SettingsDialog({ isOpen, onClose, settings, onUpdateSettings }: SettingsDialogProps) {
  const getNumericValue = (val: string) => {
    return parseFloat(val.replace('rem', '')) || 1;
  };

  const codeSize = getNumericValue(settings.codeFontSize);
  const titleSize = getNumericValue(settings.titleFontSize);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] h-[600px] p-0 gap-0 overflow-hidden flex flex-row rounded-md border-border shadow-2xl bg-background [&>button]:hidden">
        <Tabs defaultValue="appearance" className="flex w-full h-full">
          {/* Sidebar */}
          <div className="w-[280px] border-r border-border bg-muted/10 flex flex-col">
            <DialogHeader className="p-6 border-b border-border/50 bg-background text-left">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded bg-primary/10 text-primary">
                  <Settings2 className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl font-bold">Paramètres</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Personnalisation de l'espace de travail
              </DialogDescription>
            </DialogHeader>

            <TabsList className="flex flex-col h-full bg-transparent p-4 gap-2 justify-start items-stretch">
              <TabsTrigger 
                value="appearance" 
                className="justify-start gap-3 px-4 py-2.5 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                <Palette className="w-4 h-4" /> 
                <span className="font-semibold text-sm">Apparence</span>
              </TabsTrigger>
              <TabsTrigger 
                value="vaults" 
                className="justify-start gap-3 px-4 py-2.5 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                <Folder className="w-4 h-4" /> 
                <span className="font-semibold text-sm">Coffres Forts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sync" 
                className="justify-start gap-3 px-4 py-2.5 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                <GitBranch className="w-4 h-4" /> 
                <span className="font-semibold text-sm">Dépôts Git</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-background relative h-full">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="absolute top-4 right-4 h-8 w-8 rounded-sm hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <TabsContent value="appearance" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div>
                  <h3 className="text-lg font-bold mb-6">Personnalisation Visuelle</h3>
                  
                  <div className="space-y-8 max-w-xl">
                    {/* Code Font Size */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Code2 className="w-4 h-4 text-muted-foreground" />
                          <span>Taille police du Code</span>
                        </div>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-sm border">
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
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-sm border">
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
                        <span>Thème</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                          className={cn(
                            "justify-start gap-3 h-12 rounded-sm border-border hover:bg-muted/50 transition-colors",
                            settings.theme === 'dark' && "border-primary text-primary bg-primary/5 hover:bg-primary/10"
                          )}
                        >
                          <div className="w-4 h-4 rounded-full bg-slate-700" />
                          Indigo Slate
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => onUpdateSettings({ ...settings, theme: 'obsidian-dark' })}
                          className={cn(
                            "justify-start gap-3 h-12 rounded-sm border-border hover:bg-muted/50 transition-colors",
                            settings.theme === 'obsidian-dark' && "border-primary text-primary bg-primary/5 hover:bg-primary/10"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700",
                            settings.theme === 'obsidian-dark' && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          )} />
                          Obsidian Dark
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => onUpdateSettings({ ...settings, theme: 'midnight-neon' })}
                          className={cn(
                            "justify-start gap-3 h-12 rounded-sm border-border hover:bg-muted/50 transition-colors",
                            settings.theme === 'midnight-neon' && "border-primary text-primary bg-primary/5 hover:bg-primary/10"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full bg-pink-600 border border-indigo-900",
                            settings.theme === 'midnight-neon' && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          )} />
                          Midnight Neon
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => onUpdateSettings({ ...settings, theme: 'amber-brown' })}
                          className={cn(
                            "justify-start gap-3 h-12 rounded-sm border-border hover:bg-muted/50 transition-colors",
                            settings.theme === 'amber-brown' && "border-primary text-primary bg-primary/5 hover:bg-primary/10"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full bg-amber-800 border border-amber-950",
                            settings.theme === 'amber-brown' && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          )} />
                          Amber Brown
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vaults" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Gestion des Coffres</h3>
                    <Button 
                      onClick={async () => {
                        if (window.require) {
                          const { ipcRenderer } = window.require('electron');
                          const path = await ipcRenderer.invoke('select-directory');
                          if (path && !settings.vaults.includes(path)) {
                            onUpdateSettings({ 
                              ...settings, 
                              vaults: [...settings.vaults, path],
                              currentVault: path
                            });
                          }
                        }
                      }}
                      className="rounded-sm gap-2 bg-primary text-primary-foreground font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Nouveau coffre
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {settings.vaults.map((vault) => (
                      <div 
                        key={vault}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-sm border transition-all cursor-pointer group",
                          settings.currentVault === vault 
                            ? "bg-primary/5 border-primary shadow-sm" 
                            : "bg-background border-border hover:border-border/80 hover:bg-muted/30"
                        )}
                        onClick={() => onUpdateSettings({ ...settings, currentVault: vault })}
                      >
                        <div className={cn(
                          "p-2.5 rounded-sm",
                          settings.currentVault === vault ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          <Folder className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{vault.split('/').pop()}</div>
                          <div className="text-xs text-muted-foreground truncate opacity-80 mt-0.5">{vault}</div>
                        </div>
                        {settings.vaults.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 rounded-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newVaults = settings.vaults.filter(v => v !== vault);
                              onUpdateSettings({ 
                                ...settings, 
                                vaults: newVaults,
                                currentVault: settings.currentVault === vault ? newVaults[0] : settings.currentVault
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sync" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0">
                 <div>
                  <h3 className="text-lg font-bold mb-6">Synchronisation Git</h3>
                  
                  <div className="space-y-6 max-w-xl">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Emplacement du dépôt local</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={settings.gitRepoPath} 
                          placeholder="Sélectionnez un dossier à synchroniser..." 
                          className="flex-1 h-10 rounded-sm" 
                          readOnly 
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 shrink-0 rounded-sm"
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
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL Distante (Remote)</Label>
                      <Input 
                        value={settings.gitRemoteUrl} 
                        onChange={(e) => onUpdateSettings({ ...settings, gitRemoteUrl: e.target.value })}
                        placeholder="https://github.com/utilisateur/mon-depot.git" 
                        className="h-10 rounded-sm" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-sm">
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Synchronisation Automatique</Label>
                        <p className="text-xs text-muted-foreground">Committer et pousser à chaque modification</p>
                      </div>
                      <Switch 
                        checked={settings.gitAutoSync} 
                        onCheckedChange={(val) => onUpdateSettings({ ...settings, gitAutoSync: val })} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        className="gap-2 h-10 rounded-sm font-semibold"
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
                        <ArrowDown className="w-4 h-4 text-blue-500" />
                        PULL (Récupérer)
                      </Button>
                      <Button 
                        variant="outline" 
                         className="gap-2 h-10 rounded-sm font-semibold"
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
                        <ArrowUp className="w-4 h-4 text-emerald-500" />
                        PUSH (Pousser)
                      </Button>
                    </div>
                    
                    {!settings.gitRepoPath && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm">
                        <p className="text-sm font-medium text-amber-500/90 text-center">
                          Sélectionnez un dépôt local pour activer les fonctionnalités Git.
                        </p>
                      </div>
                    )}
                  </div>
                 </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
