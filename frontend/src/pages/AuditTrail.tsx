import { useState } from 'react';
import { useDataStore } from '../stores/dataStore';
import { ClipboardList, ChevronDown, ChevronUp, Search } from 'lucide-react';

export default function AuditTrail() {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { auditEvents } = useDataStore();

  const filteredEvents = auditEvents.filter((event) => {
    if (filter !== 'all' && event.entityType !== filter) return false;
    if (search && !event.action.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <ClipboardList className="text-primary-500" /> Audit Trail
        </h1>
        <p className="text-[var(--muted-foreground)]">Immutable log of all system actions</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions..."
            className="input pl-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Entities</option>
          <option value="goal">Goals</option>
          <option value="user">Users</option>
          <option value="department">Departments</option>
          <option value="cycle">Cycles</option>
        </select>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
        {filteredEvents.map((event) => (
          <div key={event.id}>
            <div
              className="p-4 cursor-pointer hover:bg-[var(--muted)] flex items-center justify-between"
              onClick={() => setExpanded(expanded === event.id ? null : event.id)}
            >
              <div className="flex items-center gap-4">
                <span className="font-medium capitalize text-[var(--foreground)]">
                  {event.action.replace(/_/g, ' ')}
                </span>
                <span className="text-xs bg-[var(--muted)] px-2 py-1 rounded">{event.entityType}</span>
                <span className="text-sm text-[var(--muted-foreground)]">#{event.entityId.slice(0, 8)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                <span>{new Date(event.timestamp).toLocaleString()}</span>
                {expanded === event.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            {expanded === event.id && (
              <div className="px-4 pb-4 bg-[var(--muted)]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {event.oldValue && (
                    <div>
                      <div className="text-[var(--muted-foreground)] mb-2">Old Value</div>
                      <pre className="bg-[var(--card)] p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(event.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {event.newValue && (
                    <div>
                      <div className="text-[var(--muted-foreground)] mb-2">New Value</div>
                      <pre className="bg-[var(--card)] p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(event.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <div className="p-8 text-center text-[var(--muted-foreground)]">
            No audit events found
          </div>
        )}
      </div>
    </div>
  );
}