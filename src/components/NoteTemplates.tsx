import { FileCode, Bug, Lightbulb, BookOpen, Wrench, Zap, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteFormData } from '@/types/note';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export interface NoteTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  data: Partial<NoteFormData>;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'snippet',
    name: 'Snippet de code',
    icon: <FileCode className="w-4 h-4" />,
    description: 'Code réutilisable',
    data: {
      title: '',
      description: '## Utilisation\n\nDécrivez comment utiliser ce snippet.\n\n## Exemple\n\nAjoutez un exemple concret.',
      code: '// Votre code ici',
      tags: ['snippet'],
    },
  },
  {
    id: 'bug-fix',
    name: 'Correction de bug',
    icon: <Bug className="w-4 h-4" />,
    description: 'Documentation de bug fix',
    data: {
      title: 'Fix: ',
      description: '## Problème\n\nDécrivez le bug rencontré.\n\n## Cause\n\nExpliquez la cause du problème.\n\n## Solution\n\nDétaillez la correction appliquée.',
      code: '// Code corrigé',
      tags: ['bugfix', 'debug'],
    },
  },
  {
    id: 'concept',
    name: 'Concept/Théorie',
    icon: <Lightbulb className="w-4 h-4" />,
    description: 'Explication de concept',
    data: {
      title: '',
      description: '## Définition\n\nQu\'est-ce que c\'est ?\n\n## Points clés\n\n- Point 1\n- Point 2\n- Point 3\n\n## Exemple pratique\n\nIllustration concrète du concept.',
      code: '',
      tags: ['concept', 'théorie'],
    },
  },
  {
    id: 'tutorial',
    name: 'Mini-tutoriel',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Guide pas à pas',
    data: {
      title: 'Comment ',
      description: '## Objectif\n\nCe que vous allez apprendre.\n\n## Prérequis\n\n- Prérequis 1\n- Prérequis 2\n\n## Étapes\n\n### 1. Première étape\n\nDescription...\n\n### 2. Deuxième étape\n\nDescription...\n\n## Résultat\n\nCe que vous devriez obtenir.',
      code: '// Code du tutoriel',
      tags: ['tutoriel', 'guide'],
    },
  },
  {
    id: 'utility',
    name: 'Fonction utilitaire',
    icon: <Wrench className="w-4 h-4" />,
    description: 'Helper ou utility function',
    data: {
      title: '',
      description: '## Description\n\nQue fait cette fonction ?\n\n## Paramètres\n\n| Paramètre | Type | Description |\n|-----------|------|-------------|\n| param1 | string | Description |\n\n## Retour\n\nType et description de la valeur retournée.',
      code: 'function utilityFunction(param1) {\n  // Implementation\n  return result;\n}',
      tags: ['utility', 'helper'],
    },
  },
  {
    id: 'quick-note',
    name: 'Note rapide',
    icon: <Zap className="w-4 h-4" />,
    description: 'Note simple et rapide',
    data: {
      title: '',
      description: '',
      code: '',
      tags: [],
    },
  },
];

interface NoteTemplatesProps {
  onSelectTemplate: (template: NoteTemplate) => void;
}

export function NoteTemplates({ onSelectTemplate }: NoteTemplatesProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-xl gap-2">
          <LayoutTemplate className="w-4 h-4" />
          Templates
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Choisir un modèle
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NOTE_TEMPLATES.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="flex items-start gap-3 py-2.5 cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
              {template.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-muted-foreground">{template.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
