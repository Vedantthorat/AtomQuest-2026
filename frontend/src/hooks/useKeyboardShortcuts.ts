import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] = []) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable;
    
    // Allow Ctrl+/ to toggle help even in inputs
    if (e.key === '/' && e.ctrlKey) {
      e.preventDefault();
      setShowHelp(prev => !prev);
      return;
    }

    // Don't trigger shortcuts in inputs (except specific ones)
    if (isInput && !e.ctrlKey && !e.altKey) return;

    // Find matching shortcut
    const shortcut = shortcuts.find(s => {
      const keyMatch = s.key.toLowerCase() === e.key.toLowerCase();
      const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
      const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = s.alt ? e.altKey : !e.altKey;
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (shortcut) {
      e.preventDefault();
      shortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Default shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    { key: 'g', description: 'Go to Goals', action: () => window.location.href = '/goals' },
    { key: 'd', description: 'Go to Dashboard', action: () => window.location.href = '/' },
    { key: 'a', description: 'Go to Analytics', action: () => window.location.href = '/analytics' },
    { key: 'n', description: 'Create new goal', action: () => window.location.href = '/goals?action=new' },
    { key: '?', description: 'Show keyboard shortcuts', action: () => setShowHelp(prev => !prev) },
    { key: 'Escape', description: 'Close modal/dialog', action: () => {
      const modals = document.querySelectorAll('[role="dialog"]');
      if (modals.length > 0) {
        (modals[modals.length - 1] as HTMLElement)?.click();
      }
    }},
  ];

  const allShortcuts = [...defaultShortcuts, ...shortcuts];

  return {
    showHelp,
    setShowHelp,
    shortcuts: allShortcuts
  };
}

export default useKeyboardShortcuts;