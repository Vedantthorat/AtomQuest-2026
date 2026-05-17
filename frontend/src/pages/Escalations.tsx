import { useEscalationStore } from '../stores/escalationStore';
import { useAuthStore } from '../stores/authStore';
import { REASON_LABELS, LEVEL_LABELS, STATUS_LABELS, LEVEL_COLORS, STATUS_COLORS, EscalationLevel, EscalationReason, EscalationStatus } from '../types/escalation';
import { AlertTriangle, CheckCircle, Clock, ArrowRight, Bell, XCircle, Filter, User, Calendar, Tag, MessageSquare, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface EscalationDetailModalProps {
  escalation: any;
  onClose: () => void;
  onResolve: (id: string, note: string) => void;
  onAddNote: (id: string, note: string) => void;
}

function EscalationDetailModal({ escalation, onClose, onResolve, onAddNote }: EscalationDetailModalProps) {
  const [note, setNote] = useState('');
  const [resolveNote, setResolveNote] = useState('');

  const getPriorityBadge = (daysOverdue: number) => {
    if (daysOverdue >= 30) return { label: 'Critical', color: 'bg-red-500' };
    if (daysOverdue >= 14) return { label: 'High', color: 'bg-orange-500' };
    if (daysOverdue >= 7) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-green-500' };
  };

  const priority = getPriorityBadge(escalation.daysOverdue);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-warning" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">Escalation Details</h3>
              <p className="text-sm text-[var(--muted-foreground)]">ID: {escalation.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <XCircle size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[var(--muted)] rounded-lg">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Employee</div>
            <div className="font-medium text-[var(--foreground)]">{escalation.employeeName}</div>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Status</div>
            <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[escalation.status as EscalationStatus]}`}>
              {STATUS_LABELS[escalation.status as EscalationStatus]}
            </span>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Level</div>
            <span className={`text-xs px-2 py-1 rounded text-white ${LEVEL_COLORS[escalation.level as EscalationLevel]}`}>
              {LEVEL_LABELS[escalation.level as EscalationLevel]}
            </span>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Days Overdue</div>
            <div className="font-medium text-[var(--foreground)]">{escalation.daysOverdue} days</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-[var(--muted-foreground)]" />
            <span className="font-medium text-[var(--foreground)]">Reason</span>
          </div>
          <p className="text-[var(--muted-foreground)] bg-[var(--muted)] p-3 rounded-lg">
            {REASON_LABELS[escalation.reason as EscalationReason]}
          </p>
        </div>

        {escalation.goalTitle && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-[var(--muted-foreground)]" />
              <span className="font-medium text-[var(--foreground)]">Related Goal</span>
            </div>
            <p className="text-[var(--foreground)] bg-[var(--muted)] p-3 rounded-lg">
              {escalation.goalTitle}
            </p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-[var(--muted-foreground)]" />
            <span className="font-medium text-[var(--foreground)]">Notes</span>
          </div>
          {escalation.notes && (
            <p className="text-[var(--muted-foreground)] bg-[var(--muted)] p-3 rounded-lg mb-3">
              {escalation.notes}
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
            />
            <button 
              onClick={() => { onAddNote(escalation.id, note); setNote(''); }}
              className="btn-primary"
            >
              Add
            </button>
          </div>
        </div>

        {escalation.status === 'OPEN' && (
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <h4 className="font-medium text-[var(--foreground)] mb-3">Resolve Escalation</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={resolveNote}
                onChange={e => setResolveNote(e.target.value)}
                placeholder="Resolution notes..."
                className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
              />
              <button 
                onClick={() => onResolve(escalation.id, resolveNote)}
                className="btn-success"
              >
                Resolve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Escalations() {
  const { user } = useAuthStore();
  const { escalations, stats, resolveEscalation, dismissEscalation, addNote } = useEscalationStore();
  const [selectedEscalation, setSelectedEscalation] = useState<any | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const canResolve = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const filteredEscalations = escalations.filter(e => {
    if (filterLevel !== 'all' && e.level !== filterLevel) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <AlertTriangle className="text-warning" /> Escalation Engine
        </h1>
        <p className="text-[var(--muted-foreground)]">Manage and resolve goal-related escalations</p>
      </div>

      <div className="flex gap-4">
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="text-warning" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.open}</div>
              <div className="text-sm text-[var(--muted-foreground)]">Open</div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <Clock className="text-primary-500" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <div className="text-sm text-[var(--muted-foreground)]">In Progress</div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-success" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <div className="text-sm text-[var(--muted-foreground)]">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Escalation Flow</h2>
          <div className="flex gap-2">
            <select 
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option value="all">All Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-center gap-8 py-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="text-warning" size={20} />
            </div>
            <div className="text-sm">Created</div>
          </div>
          <ArrowRight className="text-[var(--muted-foreground)]" />
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="text-primary-500" size={20} />
            </div>
            <div className="text-sm">Under Review</div>
          </div>
          <ArrowRight className="text-[var(--muted-foreground)]" />
          <div className="text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="text-success" size={20} />
            </div>
            <div className="text-sm">Resolved</div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold">Escalation Queue</h2>
          <div className="text-sm text-[var(--muted-foreground)]">{filteredEscalations.length} escalations</div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {filteredEscalations.map((escalation: any) => (
            <div 
              key={escalation.id} 
              className="p-4 hover:bg-[var(--muted)] cursor-pointer transition-colors"
              onClick={() => setSelectedEscalation(escalation)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{escalation.employeeName}</span>
                    <span className={`text-xs px-2 py-1 rounded text-white ${LEVEL_COLORS[escalation.level as EscalationLevel]}`}>
                      {LEVEL_LABELS[escalation.level as EscalationLevel]}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[escalation.status as EscalationStatus]}`}>
                      {STATUS_LABELS[escalation.status as EscalationStatus]}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">{REASON_LABELS[escalation.reason as EscalationReason]}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-2">
                    {escalation.daysOverdue} days overdue
                  </div>
                  {escalation.notes && (
                    <div className="text-xs text-[var(--muted-foreground)] mt-1 bg-[var(--muted)] p-2 rounded">
                      {escalation.notes}
                    </div>
                  )}
                </div>
                {canResolve && escalation.status === 'OPEN' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => addNote(escalation.id, 'Reminder sent')}
                      className="p-1.5 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                      title="Send Reminder"
                    >
                      <Bell size={16} />
                    </button>
                    <button
                      onClick={() => resolveEscalation(escalation.id, 'Resolved via admin')}
                      className="px-3 py-1 text-sm bg-success text-white rounded-lg hover:bg-green-600"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => dismissEscalation(escalation.id)}
                      className="p-1.5 rounded bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                      title="Dismiss"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredEscalations.length === 0 && (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              No escalations - all employees are on track!
            </div>
          )}
        </div>
      </div>
      {selectedEscalation && (
        <EscalationDetailModal
          escalation={selectedEscalation}
          onClose={() => setSelectedEscalation(null)}
          onResolve={(id, note) => { resolveEscalation(id, note); setSelectedEscalation(null); }}
          onAddNote={(id, note) => { addNote(id, note); setSelectedEscalation(null); }}
        />
      )}
    </div>
  );
}