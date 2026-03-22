import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import CodeBlock from '@tiptap/extension-code-block';
import CodeMirror from '@uiw/react-codemirror';
import { vim } from '@replit/codemirror-vim';
import { langs } from '@uiw/codemirror-extensions-langs';
import { oneDark } from '@codemirror/theme-one-dark';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Code2, Trash2 } from 'lucide-react';
import { useState, useCallback } from 'react';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'cpp', label: 'C++' },
  { value: 'markdown', label: 'Markdown' },
];

const CodeMirrorNodeView = ({ node, editor, getPos, updateAttributes, deleteNode }: NodeViewProps) => {
  const language = node.attrs.language || 'javascript';
  const [isVimMode, setIsVimMode] = useState(() => localStorage.getItem('shrine-vim-mode') === 'true');

  const handleLanguageChange = (value: string) => {
    updateAttributes({ language: value });
  };

  const handleVimModeToggle = (checked: boolean) => {
    setIsVimMode(checked);
    localStorage.setItem('shrine-vim-mode', String(checked));
  };

  const handleCodeChange = useCallback((value: string) => {
    const pos = getPos();
    if (typeof pos !== 'number') return;
    
    // Au lieu de tr.replaceWith qui peut causer des problèmes de curseur si on tape vite,
    // On met à jour le texte du noeud sans bloquer la vue CodeMirror.
    const tr = editor.state.tr;
    if (value) {
      tr.replaceWith(pos + 1, pos + node.nodeSize - 1, editor.schema.text(value));
    } else {
      tr.delete(pos + 1, pos + node.nodeSize - 1);
    }
    // Set meta to prevent TipTap from resetting focus to the Editor when updating
    tr.setMeta('preventUpdate', true);
    editor.view.dispatch(tr);
  }, [editor, getPos, node.nodeSize]);

  const getExtensions = () => {
    const exts = [];
    if (isVimMode) {
      exts.push(vim({ status: true }));
    }
    try {
      if (langs[language as keyof typeof langs]) {
        exts.push(langs[language as keyof typeof langs]());
      }
    } catch { /* ignore */ }
    return exts;
  };

  return (
    <NodeViewWrapper className="mt-6 mb-6 animate-slide-up group" contentEditable={false}>
      {/* Barre d'outils du bloc de code */}
      <div className="flex items-center justify-between mx-1 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold flex items-center gap-1.5 text-primary">
            <Code2 className="w-4 h-4" />
            CodeSnippet
          </span>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[120px] h-7 text-xs bg-muted/30 border-dashed rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5">
            <Label className="text-[10px] text-muted-foreground cursor-pointer">NeoVim</Label>
            <Switch checked={isVimMode} onCheckedChange={handleVimModeToggle} className="scale-50 data-[state=checked]:bg-primary" />
          </div>
          <button 
            type="button" 
            onClick={deleteNode} 
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
            title="Supprimer le bloc"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Éditeur CodeMirror */}
      <div className="rounded-xl overflow-hidden border border-border/50 shadow-inner group-focus-within:border-primary/50 group-focus-within:ring-1 group-focus-within:ring-primary/20 transition-all">
        <CodeMirror
          value={node.textContent}
          height="auto"
          minHeight="100px"
          theme={oneDark}
          extensions={getExtensions()}
          onChange={handleCodeChange}
          className="text-sm font-mono [&_.cm-editor]:outline-none"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            bracketMatching: true,
            autocompletion: true,
          }}
        />
      </div>
    </NodeViewWrapper>
  );
};

export const CustomCodeBlock = CodeBlock.extend({
  addAttributes() {
    return {
      language: {
        default: 'javascript',
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => {
          return {
            'data-language': attributes.language,
          }
        },
      },
    }
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(CodeMirrorNodeView);
  },
});
