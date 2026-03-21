import React from 'react';
import { 
  FileCode2, 
  SquareCode, 
  Braces, 
  Terminal, 
  FileJson, 
  FileType, 
  Palette,
  Layout,
  Globe,
  Database,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageIconProps {
  language: string;
  className?: string;
}

export function LanguageIcon({ language, className }: LanguageIconProps) {
  const lang = language.toLowerCase();

  // Mapping of common languages to representative icons
  if (['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(lang)) {
    return <FileCode2 className={cn("text-amber-400", className)} />;
  }
  if (['python', 'py'].includes(lang)) {
    return <Terminal className={cn("text-blue-400", className)} />;
  }
  if (['html', 'xml', 'svg'].includes(lang)) {
    return <Layout className={cn("text-orange-500", className)} />;
  }
  if (['css', 'scss', 'less', 'tailwind'].includes(lang)) {
    return <Palette className={cn("text-blue-500", className)} />;
  }
  if (['json', 'yaml', 'yml'].includes(lang)) {
    return <FileJson className={cn("text-emerald-400", className)} />;
  }
  if (['sql', 'postgresql', 'mysql', 'mongodb', 'prisma'].includes(lang)) {
    return <Database className={cn("text-indigo-400", className)} />;
  }
  if (['markdown', 'md'].includes(lang)) {
    return <FileType className={cn("text-slate-400", className)} />;
  }
  if (['bash', 'sh', 'zsh', 'terminal', 'cmd'].includes(lang)) {
    return <Terminal className={cn("text-emerald-500", className)} />;
  }
  if (['php'].includes(lang)) {
    return <Globe className={cn("text-indigo-500", className)} />;
  }
  if (['c', 'cpp', 'c++', 'csharp', 'c#', 'java', 'go', 'rust', 'swift'].includes(lang)) {
    return <SquareCode className={cn("text-blue-600", className)} />;
  }
  if (['text', 'plaintext'].includes(lang)) {
    return <Type className={cn("text-slate-500", className)} />;
  }

  // Default fallback
  return <Braces className={cn("text-muted-foreground", className)} />;
}
