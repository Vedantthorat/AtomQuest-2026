import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: Array<{ key: string; description: string }>;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose, shortcuts = [] }: KeyboardShortcutsHelpProps) {
  const defaultShortcuts = [
    { key: 'G', description: 'Go to Goals page' },
    { key: 'D', description: 'Go to Dashboard' },
    { key: 'A', description: 'Go to Analytics' },
    { key: 'N', description: 'Create new goal' },
    { key: '?', description: 'Toggle this help panel' },
    { key: 'Esc', description: 'Close modal or dialog' },
    { key: 'Ctrl+Enter', description: 'Submit form' },
    { key: 'Ctrl+S', description: 'Save changes' },
  ];

  const allShortcuts = [...defaultShortcuts, ...shortcuts];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between" style={{
          background: 'linear-gradient(90deg, var(--primary-color)20 0%, transparent 100%)'
        }}>
          <div className="flex items-center gap-2">
            <Keyboard className="text-[var(--primary-color)]" size={20} />
            <h2 className="text-lg font-bold text-[var(--foreground)]">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {allShortcuts.map((shortcut, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--muted)]"
              >
                <span className="text-sm text-[var(--muted-foreground)]">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-mono rounded-lg bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            Press <kbd className="px-1 py-0.5 text-xs font-mono rounded bg-[var(--muted)]">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}