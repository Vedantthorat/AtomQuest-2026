import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Download } from 'lucide-react';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  chartType?: string;
}

export default function ChartModal({ isOpen, onClose, title, children, chartType }: ChartModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalRef}
        className={`relative bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full' : 'w-full max-w-5xl max-h-[90vh]'
        }`}
        style={{
          transform: isFullscreen ? 'scale(1)' : 'scale(0.95)',
          opacity: isFullscreen ? 1 : 0.95
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]" style={{
          background: 'linear-gradient(90deg, var(--primary-color) 0%, transparent 100%)',
          opacity: 0.1
        }}>
          <div className="flex items-center gap-3">
            <Maximize2 className="text-[var(--primary-color)]" size={20} />
            <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
            {chartType && (
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                {chartType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-auto ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'max-h-[calc(90vh-80px)]'}`}>
          {children}
        </div>

        {/* Footer hint */}
        <div className="p-3 border-t border-[var(--border)] text-center text-xs text-[var(--muted-foreground)]">
          Press ESC or click outside to close • Hover on chart elements for details
        </div>
      </div>
    </div>
  );
}