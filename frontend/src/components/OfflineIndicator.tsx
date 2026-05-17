import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Clock } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000); // Simulate sync time
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate pending changes count (in real app, this would come from sync queue)
    const interval = setInterval(() => {
      if (!isOnline) {
        setPendingChanges(prev => Math.min(prev + Math.floor(Math.random() * 3), 10));
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const getStatus = () => {
    if (!isOnline) return { color: '#ef4444', icon: WifiOff, label: 'Offline', bg: 'bg-red-500/10' };
    if (isSyncing) return { color: '#f59e0b', icon: Cloud, label: 'Syncing', bg: 'bg-yellow-500/10' };
    if (pendingChanges > 0) return { color: '#3b82f6', icon: Cloud, label: `${pendingChanges} pending`, bg: 'bg-blue-500/10' };
    return { color: '#22c55e', icon: Wifi, label: 'Synced', bg: 'bg-green-500/10' };
  };

  const status = getStatus();

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div 
        className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${status.bg}`}
        style={{ 
          borderColor: `${status.color}30`,
          boxShadow: `0 2px 10px ${status.color}20`
        }}
      >
        <status.icon size={14} style={{ color: status.color }} />
        <span className="text-xs font-medium" style={{ color: status.color }}>
          {status.label}
        </span>
        {isSyncing && (
          <div className="w-3 h-3 rounded-full border-2" style={{ 
            borderColor: status.color,
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite'
          }}></div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}