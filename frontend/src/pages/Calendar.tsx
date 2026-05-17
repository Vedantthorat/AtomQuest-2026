import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, RefreshCw, Plus, Trash2, Bell, Clock, X, AlertCircle, Link, Target, Star, CheckCircle } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  type: 'goal' | 'meeting' | 'reminder' | 'deadline' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedGoalId?: string;
  alarm?: {
    enabled: boolean;
    minutesBefore: number;
  };
}

interface RelatedEvent {
  id: string;
  title: string;
  type: string;
  date: string;
}

const sampleEvents: CalendarEvent[] = [
  { id: '1', title: 'Q1 Review Meeting', description: 'Quarterly performance review', date: '2026-05-20', time: '10:00', type: 'meeting', priority: 'high', alarm: { enabled: true, minutesBefore: 30 } },
  { id: '2', title: 'Goal Deadline: Sales Target', description: 'Complete 20% sales increase', date: '2026-05-25', type: 'deadline', priority: 'critical', alarm: { enabled: true, minutesBefore: 1440 } },
  { id: '3', title: 'Team Standup', description: 'Daily team sync', date: '2026-05-17', time: '09:00', type: 'meeting', priority: 'low' },
  { id: '4', title: 'Code Review', description: 'Review new feature implementation', date: '2026-05-18', time: '14:00', type: 'meeting', priority: 'medium' },
  { id: '5', title: 'Backup Reminder', description: 'Weekly data backup', date: '2026-05-19', type: 'reminder', priority: 'low', alarm: { enabled: true, minutesBefore: 60 } },
  { id: '6', title: 'Product Launch', description: 'Launch new feature', date: '2026-05-22', type: 'deadline', priority: 'high', alarm: { enabled: true, minutesBefore: 60 } },
  { id: '7', title: 'Training Session', description: 'New employee onboarding', date: '2026-05-21', time: '11:00', type: 'meeting', priority: 'medium' },
  { id: '8', title: 'Performance Review', description: 'Annual performance evaluation', date: '2026-05-28', type: 'meeting', priority: 'high', alarm: { enabled: true, minutesBefore: 1440 } },
];

const relatedEvents: RelatedEvent[] = [
  { id: 'r1', title: 'Sprint Planning', type: 'meeting', date: '2026-05-19' },
  { id: 'r2', title: 'Design Review', type: 'meeting', date: '2026-05-20' },
  { id: 'r3', title: 'API Deadline', type: 'deadline', date: '2026-05-22' },
  { id: 'r4', title: 'Testing Phase', type: 'goal', date: '2026-05-23' },
  { id: 'r5', title: 'Deployment', type: 'deadline', date: '2026-05-24' },
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState<CalendarEvent | null>(null);
  const [showRelated, setShowRelated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'personal' as const,
    priority: 'medium' as const,
    alarmEnabled: false,
    alarmMinutes: 30
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1);
      days.push({ day: prevDate.getDate(), isCurrentMonth: false, date: prevDate });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time || undefined,
      type: newEvent.type,
      priority: newEvent.priority,
      alarm: newEvent.alarmEnabled ? { enabled: true, minutesBefore: newEvent.alarmMinutes } : undefined
    };

    setEvents([...events, event]);
    setShowAddEvent(false);
    setNewEvent({ title: '', description: '', date: '', time: '', type: 'personal', priority: 'medium', alarmEnabled: false, alarmMinutes: 30 });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm('Delete this event?')) return;
    setEvents(events.filter(e => e.id !== eventId));
    setShowEventDetails(null);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'goal': return 'bg-purple-500';
      case 'meeting': return 'bg-blue-500';
      case 'reminder': return 'bg-orange-500';
      case 'deadline': return 'bg-red-500';
      case 'personal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-purple-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Calendar</h1>
            <p className="text-[var(--muted-foreground)]">Manage events, deadlines, and reminders</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="px-3 py-1.5 text-sm bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] flex items-center gap-2">
            <RefreshCw size={14} /> Today
          </button>
          <button onClick={() => setShowAddEvent(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Event
          </button>
          <button onClick={() => setShowRelated(!showRelated)} className={`btn-secondary flex items-center gap-2 ${showRelated ? 'bg-primary-500 text-white' : ''}`}>
            <Link size={16} /> Related
          </button>
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <button onClick={prevMonth} className="p-2 hover:bg-[var(--muted)] rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-[var(--muted)] rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-[var(--border)]">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-[var(--muted-foreground)] bg-[var(--muted)]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const eventsForDay = getEventsForDate(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            const hasAlarm = eventsForDay.some(e => e.alarm?.enabled);

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(day.date.toISOString().split('T')[0])}
                className={`min-h-[120px] p-2 border-b border-r border-[var(--border)] ${!day.isCurrentMonth ? 'bg-[var(--muted)]/50' : ''} cursor-pointer hover:bg-[var(--muted)]`}
              >
                <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
                  isToday ? 'w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center' : 'text-[var(--foreground)]'
                }`}>
                  {day.day}
                  {hasAlarm && <Bell size={12} className="text-orange-500" />}
                </div>
                <div className="space-y-1">
                  {eventsForDay.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); setShowEventDetails(event); }}
                      className={`text-xs p-1 rounded truncate text-white cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                      title={event.title}
                    >
                      {event.time && <span className="opacity-75 mr-1">{event.time}</span>}
                      {event.title}
                    </div>
                  ))}
                  {eventsForDay.length > 3 && (
                    <div className="text-xs text-[var(--muted-foreground)]">
                      +{eventsForDay.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showRelated && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Link size={18} className="text-purple-500" /> Related Events
          </h3>
          <div className="space-y-2">
            {relatedEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                <div className="flex items-center gap-3">
                  {event.type === 'meeting' ? <CheckCircle size={16} className="text-blue-500" /> : 
                   event.type === 'deadline' ? <AlertCircle size={16} className="text-red-500" /> :
                   <Target size={16} className="text-purple-500" />}
                  <span className="text-[var(--foreground)]">{event.title}</span>
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">{new Date(event.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-sm text-[var(--muted-foreground)]">Goals</span>
          </div>
          <div className="text-xl font-bold text-[var(--foreground)]">{events.filter(e => e.type === 'goal').length}</div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-sm text-[var(--muted-foreground)]">Meetings</span>
          </div>
          <div className="text-xl font-bold text-[var(--foreground)]">{events.filter(e => e.type === 'meeting').length}</div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-sm text-[var(--muted-foreground)]">Reminders</span>
          </div>
          <div className="text-xl font-bold text-[var(--foreground)]">{events.filter(e => e.type === 'reminder').length}</div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-sm text-[var(--muted-foreground)]">Deadlines</span>
          </div>
          <div className="text-xl font-bold text-[var(--foreground)]">{events.filter(e => e.type === 'deadline').length}</div>
        </div>
      </div>

      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">Add New Event</h3>
              <button onClick={() => setShowAddEvent(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--muted-foreground)]">Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="input w-full"
                  placeholder="Event title"
                />
              </div>
              
              <div>
                <label className="text-sm text-[var(--muted-foreground)]">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="input w-full"
                  placeholder="Event description"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)]">Date *</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)]">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)]">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="personal">Personal</option>
                    <option value="meeting">Meeting</option>
                    <option value="reminder">Reminder</option>
                    <option value="deadline">Deadline</option>
                    <option value="goal">Goal</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)]">Priority</label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-[var(--muted)] rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEvent.alarmEnabled}
                    onChange={(e) => setNewEvent({ ...newEvent, alarmEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <Bell size={16} className="text-orange-500" />
                  <span className="text-[var(--foreground)]">Set Alarm</span>
                </label>
                {newEvent.alarmEnabled && (
                  <select
                    value={newEvent.alarmMinutes}
                    onChange={(e) => setNewEvent({ ...newEvent, alarmMinutes: parseInt(e.target.value) })}
                    className="input w-auto"
                  >
                    <option value={15}>15 min before</option>
                    <option value={30}>30 min before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowAddEvent(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAddEvent} className="btn-primary flex-1">Add Event</button>
            </div>
          </div>
        </div>
      )}

      {showEventDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${getEventTypeColor(showEventDetails.type)} flex items-center justify-center text-white`}>
                  {showEventDetails.type === 'meeting' ? <CheckCircle size={20} /> :
                   showEventDetails.type === 'deadline' ? <AlertCircle size={20} /> :
                   showEventDetails.type === 'reminder' ? <Bell size={20} /> :
                   <Target size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">{showEventDetails.title}</h3>
                  <span className={`text-sm ${getPriorityColor(showEventDetails.priority)}`}>{showEventDetails.priority.toUpperCase()}</span>
                </div>
              </div>
              <button onClick={() => setShowEventDetails(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {showEventDetails.description && (
                <p className="text-[var(--muted-foreground)]">{showEventDetails.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 p-3 bg-[var(--muted)] rounded-lg">
                <div>
                  <div className="text-xs text-[var(--muted-foreground)]">Date</div>
                  <div className="text-[var(--foreground)]">{new Date(showEventDetails.date).toLocaleDateString()}</div>
                </div>
                {showEventDetails.time && (
                  <div>
                    <div className="text-xs text-[var(--muted-foreground)]">Time</div>
                    <div className="text-[var(--foreground)]">{showEventDetails.time}</div>
                  </div>
                )}
              </div>
              
              {showEventDetails.alarm && (
                <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <Bell size={16} className="text-orange-500" />
                  <span className="text-sm text-[var(--foreground)]">
                    Alarm: {showEventDetails.alarm.minutesBefore >= 60 
                      ? `${Math.round(showEventDetails.alarm.minutesBefore / 60)} hour(s) before`
                      : `${showEventDetails.alarm.minutesBefore} minutes before`}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-2">
              <button onClick={() => handleDeleteEvent(showEventDetails.id)} className="btn-secondary text-red-500 flex items-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
              <button onClick={() => setShowEventDetails(null)} className="btn-primary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="font-semibold text-[var(--foreground)] mb-3">Event Types Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-sm text-[var(--foreground)]">Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-sm text-[var(--foreground)]">Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-sm text-[var(--foreground)]">Reminder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-sm text-[var(--foreground)]">Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-sm text-[var(--foreground)]">Personal</span>
          </div>
        </div>
      </div>
    </div>
  );
}