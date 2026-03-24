import React, { useState } from 'react';
import { Note, NoteFormData } from '@/types/note';
import { X, Sparkles, Beaker, ArrowRight, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AlchemyCauldronProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveMutant: (data: NoteFormData) => void;
}

export const AlchemyCauldron: React.FC<AlchemyCauldronProps> = ({ notes, isOpen, onClose, apiKey, onSaveMutant }) => {
  const [note1Id, setNote1Id] = useState<string>('');
  const [note2Id, setNote2Id] = useState<string>('');
  const [isFusing, setIsFusing] = useState(false);
  const [result, setResult] = useState<{ title: string; code: string; language: string; description: string } | null>(null);

  if (!isOpen) return null;

  const note1 = notes.find(n => n.id === note1Id);
  const note2 = notes.find(n => n.id === note2Id);

  const handleFusion = async () => {
    if (!note1 || !note2) return toast({ title: "Erreur", description: "Sélectionnez deux composants à fusionner", variant: "destructive" });
    if (!apiKey) {
      return toast({ 
        title: "Clé API manquante", 
        description: "Veuillez configurer votre clé Google Gemini dans les paramètres de l'application.", 
        variant: "destructive" 
      });
    }

    setIsFusing(true);
    setResult(null);

    const prompt = `Agis en tant qu'Alchimiste du Code et développeur de génie chaotique. Je vais te donner deux snippets de code différents. Ta seule mission est de les FUSIONNER pour créer un troisième composant hybride, un "mutant" organique qui réunit les fonctionnalités (ou l'esthétique) des deux. Ne donne AUCUNE introduction ni conclusion, renvoie UNIQUEMENT un objet JSON valide contenant:
{
  "title": "Un titre cyberpunk/alchimique pour ce nouveau composant",
  "description": "Une brève explication organique de 2 phrases sur ce que fait ce mutant",
  "language": "Le langage de programmation",
  "code": "Le code complet et fonctionnel"
}

Composant 1:
Titre: ${note1.title}
Code:
${note1.code}

Composant 2:
Titre: ${note2.title}
Code:
${note2.code}
`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      if (!response.ok) throw new Error("Erreur de l'API Gemini");
      
      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      
      const jsonResult = JSON.parse(textResponse);
      setResult(jsonResult);
      
      toast({ title: "Fusion Réussie", description: "Le mutant est en vie !" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Échec de l'Alchimie", description: err.message, variant: "destructive" });
    } finally {
      setIsFusing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col pt-12 animate-in fade-in zoom-in duration-500">
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 h-10 w-10 hover:bg-destructive/20 text-muted-foreground hover:text-white rounded-full z-10 p-0">
        <X className="w-5 h-5 mx-auto" />
      </Button>
      
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 uppercase tracking-widest flex items-center justify-center gap-3">
          <Beaker className="w-8 h-8 text-pink-500" />
          Le Chaudron Alchimique
          <Sparkles className="w-8 h-8 text-amber-500" />
        </h2>
        <p className="text-muted-foreground text-sm font-mono mt-2 uppercase tracking-[0.2em] opacity-80">Fusion de code organique via IA</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 lg:p-8 gap-8 overflow-hidden relative z-10">
        {/* Partie Sélection */}
        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl border-purple-500/20 bg-card/40 flex-1 flex flex-col">
             <h3 className="font-bold text-center mb-4 text-purple-400">Composant Alpha</h3>
             <Select value={note1Id} onValueChange={setNote1Id}>
              <SelectTrigger className="w-full h-12 bg-background/50 border-purple-500/20 rounded-xl">
                <SelectValue placeholder="Sélectionnez le composant maître..." />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {notes.map(n => <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>)}
              </SelectContent>
            </Select>
            {note1 && (
              <div className="mt-4 flex-1 h-0 overflow-y-auto custom-scrollbar bg-background/30 rounded-xl p-4 border border-border/50 font-mono text-xs opacity-80">
                {note1.code.substring(0, 500)}...
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl border-amber-500/20 bg-card/40 flex-1 flex flex-col">
             <h3 className="font-bold text-center mb-4 text-amber-400">Composant Omega</h3>
             <Select value={note2Id} onValueChange={setNote2Id}>
              <SelectTrigger className="w-full h-12 bg-background/50 border-amber-500/20 rounded-xl">
                <SelectValue placeholder="Sélectionnez le réactif catalyseur..." />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {notes.filter(n => n.id !== note1Id).map(n => <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>)}
              </SelectContent>
            </Select>
            {note2 && (
              <div className="mt-4 flex-1 h-0 overflow-y-auto custom-scrollbar bg-background/30 rounded-xl p-4 border border-border/50 font-mono text-xs opacity-80">
                {note2.code.substring(0, 500)}...
              </div>
            )}
          </div>
        </div>

        {/* Action au centre */}
        <div className="w-full lg:w-[10%] flex lg:flex-col items-center justify-center gap-4">
          <div className="w-1 h-24 bg-gradient-to-b from-purple-500/20 to-transparent hidden lg:block" />
          <Button 
            size="lg"
            disabled={!note1Id || !note2Id || isFusing}
            className={`h-24 w-24 rounded-full p-0 shadow-[0_0_40px_rgba(236,72,153,0.3)] hover:shadow-[0_0_60px_rgba(236,72,153,0.5)] transition-all duration-500 border-2 border-pink-500/50 hover:scale-110 ${isFusing ? 'animate-spin bg-pink-500/20' : 'bg-gradient-to-tr from-purple-600 to-pink-500'}`}
            onClick={handleFusion}
          >
            {isFusing ? <Loader2 className="w-10 h-10 text-white animate-pulse" /> : <Sparkles className="w-10 h-10 text-white" />}
          </Button>
          <div className="w-1 h-24 bg-gradient-to-t from-amber-500/20 to-transparent hidden lg:block" />
        </div>

        {/* Résultat */}
        <div className="w-full lg:w-[50%] glass-panel rounded-3xl border-pink-500/20 bg-card/40 relative overflow-hidden flex flex-col">
          {!result && !isFusing && (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 font-mono text-sm uppercase tracking-[0.3em]">
              [ En attente de Mutation ]
            </div>
          )}
          {isFusing && (
            <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center border-2 border-pink-500/50 bg-black/60 rounded-3xl z-20 backdrop-blur-sm animate-pulse">
               <div className="text-pink-500 font-mono text-xl uppercase tracking-widest text-center">
                 Fusionnement...<br/>
                 <span className="text-xs text-muted-foreground mt-2 block">calcul gestalt algorithmique</span>
               </div>
            </div>
          )}
          {result && (
            <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-8 duration-500 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black text-pink-400 mb-2">{result.title}</h3>
                  <p className="text-sm text-muted-foreground italic mb-4">{result.description}</p>
                </div>
                <Button 
                  onClick={() => {
                    onSaveMutant({
                      title: result.title,
                      description: result.description,
                      code: result.code,
                      language: result.language,
                      category: 'Mutants (Chaudron)',
                      tags: ['mutant', 'ia', 'fusion']
                    });
                    onClose();
                  }}
                  className="bg-pink-600 hover:bg-pink-700 font-bold tracking-wide"
                >
                  <Save className="w-4 h-4 mr-2" /> Capturer ce Mutant
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto bg-[#0a0a0c] rounded-xl border border-pink-500/30 custom-scrollbar">
                <SyntaxHighlighter
                  language={result.language}
                  style={oneDark}
                  customStyle={{ background: 'transparent', margin: 0, padding: '1.5rem', fontSize: '0.85rem' }}
                >
                  {result.code}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Background Decor */}
      {isFusing && (
         <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-pulse" />
      )}
    </div>
  );
};
