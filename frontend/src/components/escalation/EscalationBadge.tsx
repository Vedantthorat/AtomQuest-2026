// FILE: src/components/escalation/EscalationBadge.tsx

import { useEscalationStore } from '../../stores/escalationStore';
import { AlertTriangle } from 'lucide-react';

export default function EscalationBadge() {
  const { stats } = useEscalationStore();
  const openCount = stats.open + stats.inProgress;

  if (openCount === 0) return null;

  return (
    <div className="relative inline-flex">
      <AlertTriangle className="text-red-500" size={18} />
      <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
        {openCount > 9 ? '9+' : openCount}
      </span>
    </div>
  );
}

export { EscalationBadge };