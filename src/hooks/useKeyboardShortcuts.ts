import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onNewNote?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onSearch?: () => void;
  onDuplicate?: () => void;
  onPalette?: () => void;
  onZen?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    const target = e.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    // Escape - always works
    if (e.key === 'Escape' && handlers.onCancel) {
      e.preventDefault();
      handlers.onCancel();
      return;
    }

    // Ctrl/Cmd + S - Save (works even in inputs)
    if (isCtrlOrMeta && e.key === 's') {
      e.preventDefault();
      handlers.onSave?.();
      return;
    }

    // Don't trigger other shortcuts when typing in inputs
    if (isInputFocused) return;

    // Ctrl/Cmd + N - New note
    if (isCtrlOrMeta && e.key === 'n') {
      e.preventDefault();
      handlers.onNewNote?.();
      return;
    }

    // Ctrl/Cmd + F - Focus search
    if (isCtrlOrMeta && e.key === 'f') {
      e.preventDefault();
      handlers.onSearch?.();
      return;
    }

    // Ctrl/Cmd + Shift + J - Command Palette
    if (isCtrlOrMeta && e.shiftKey && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      handlers.onPalette?.();
      return;
    }

    // Ctrl/Cmd + K - Zen Mode
    if (isCtrlOrMeta && e.key === 'k') {
      e.preventDefault();
      handlers.onZen?.();
      return;
    }
  }, [handlers, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
