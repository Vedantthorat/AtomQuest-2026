import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  X,
  Filter,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import type { Goal, User as UserType } from '../types';

interface ActionRequiredInboxProps {
  goals: Goal[];
  currentUser: UserType | null;
  onDismiss?: (id: string, type: string) => void;
}

export default function ActionRequiredInbox({ goals, currentUser, onDismiss }: ActionRequiredInboxProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'escalation'>('all');

  const actions = useMemo(() => {
    const result: Array<{
      id: string;
      type: 'pending_approval' | 'checkin_overdue' | 'escalation' | 'returned';
      priority: number;
      title: string;
      description: string;
      dueDate?: string;
      link: string;
      icon: any;
      iconBg: string;
    }> = [];

    const now = new Date();
    const currentQuarter = ['Q1', 'Q2', 'Q3', 'Q4'][Math.floor(now.getMonth() / 3)];

    goals.forEach(goal => {
      // Pending approvals for managers/admins
      if (currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') {
        if (goal.status === 'PENDING') {
          result.push({
            id: `approve-${goal.id}`,
            type: 'pending_approval',
            priority: 1,
            title: goal.title,
            description: `Awaiting approval from ${goal.owner?.name || 'employee'}`,
            dueDate: goal.createdAt ? new Date(new Date(goal.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() : undefined,
            link: `/goals?action=approve&id=${goal.id}`,
            icon: CheckSquare,
            iconBg: 'bg-yellow-500'
          });
        }
      }

      // Check-in overdue (for employee's own goals)
      if (goal.ownerId === currentUser?.id && goal.status === 'APPROVED') {
        const quarterCheckInMap: Record<string, string | undefined> = {
          'Q1': goal.q1Actual === undefined ? 'Q1' : undefined,
          'Q2': goal.q2Actual === undefined ? 'Q2' : undefined,
          'Q3': goal.q3Actual === undefined ? 'Q3' : undefined,
          'Q4': goal.q4Actual === undefined ? 'Q4' : undefined
        };
        
        const pendingQuarter = Object.values(quarterCheckInMap).find(q => q) as string | undefined;
        if (pendingQuarter) {
          const quarterIndex = ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(pendingQuarter);
          const currentQuarterIndex = ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(currentQuarter);
          
          if (quarterIndex <= currentQuarterIndex) {
            result.push({
              id: `checkin-${goal.id}-${pendingQuarter}`,
              type: 'checkin_overdue',
              priority: 2,
              title: goal.title,
              description: `${pendingQuarter} check-in due`,
              dueDate: 'Overdue',
              link: `/goals?action=checkin&id=${goal.id}`,
              icon: Clock,
              iconBg: 'bg-red-500'
            });
          }
        }
      }

      // Escalations (for managers)
      if ((currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && (goal as any).escalationLevel) {
        result.push({
          id: `escalation-${goal.id}`,
          type: 'escalation',
          priority: 3,
          title: goal.title,
          description: `Escalated to ${(goal as any).escalationLevel} level`,
          link: `/goals?action=escalation&id=${goal.id}`,
          icon: AlertTriangle,
          iconBg: 'bg-orange-500'
        });
      }

      // Returned goals (needs revision)
      if (goal.ownerId === currentUser?.id && goal.status === 'RETURNED') {
        result.push({
          id: `returned-${goal.id}`,
          type: 'returned',
          priority: 4,
          title: goal.title,
          description: `Returned by manager: ${(goal as any).managerFeedback || 'Needs revision'}`,
          link: `/goals?action=edit&id=${goal.id}`,
          icon: XCircle,
          iconBg: 'bg-purple-500'
        });
      }
    });

    // Sort by priority
    result.sort((a, b) => a.priority - b.priority);
    
    // Filter out dismissed
    return result.filter(a => !dismissed.has(a.id));
  }, [goals, currentUser]);

  const filteredActions = useMemo(() => {
    if (filter === 'all') return actions;
    return actions.filter(a => {
      if (filter === 'pending') return a.type === 'pending_approval';
      if (filter === 'overdue') return a.type === 'checkin_overdue';
      if (filter === 'escalation') return a.type === 'escalation';
      return true;
    });
  }, [actions, filter]);

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    onDismiss?.(id, 'dismiss');
  };

  const handleAction = (link: string) => {
    navigate(link);
  };

  const pendingCount = actions.filter(a => a.type === 'pending_approval').length;
  const overdueCount = actions.filter(a => a.type === 'checkin_overdue').length;
  const escalationCount = actions.filter(a => a.type === 'escalation').length;

  if (actions.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 text-center">
        <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
        <p className="text-[var(--foreground)] font-medium">All caught up!</p>
        <p className="text-sm text-[var(--muted-foreground)]">No pending actions</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={18} />
            Action Required
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {actions.length}
            </span>
          </h3>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 flex-wrap">
          {pendingCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center gap-1">
              <CheckSquare size={12} /> {pendingCount} pending approval
            </span>
          )}
          {overdueCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500 flex items-center gap-1">
              <Clock size={12} /> {overdueCount} overdue
            </span>
          )}
          {escalationCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 flex items-center gap-1">
              <AlertTriangle size={12} /> {escalationCount} escalation
            </span>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="px-4 py-2 border-b border-[var(--border)] flex gap-2">
        {(['all', 'pending', 'overdue', 'escalation'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2 py-1 rounded capitalize transition-colors ${
              filter === f 
                ? 'bg-[var(--primary-color)] text-white' 
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredActions.map(action => (
          <div 
            key={action.id}
            className="p-4 border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.iconBg}`}>
                <action.icon className="text-white" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[var(--foreground)] truncate">
                    {action.title}
                  </p>
                  {action.dueDate === 'Overdue' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted-foreground)] truncate">
                  {action.description}
                </p>
                {action.dueDate && action.dueDate !== 'Overdue' && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Due: {action.dueDate}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAction(action.link)}
                  className="p-2 rounded-lg hover:bg-[var(--primary-color)]/10 text-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-all"
                  title="Take action"
                >
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => handleDismiss(action.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border)] text-center">
        <button
          onClick={() => navigate('/goals')}
          className="text-sm text-[var(--primary-color)] hover:underline"
        >
          View all goals →
        </button>
      </div>
    </div>
  );
}