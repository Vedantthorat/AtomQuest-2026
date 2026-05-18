import { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Goal } from '../types';

interface DueDateReminderProps {
  goals: Goal[];
}

interface Reminder {
  goal: Goal;
  daysLeft: number;
  urgency: 'overdue' | 'urgent' | 'upcoming' | 'normal';
}

export default function DueDateReminder({ goals }: DueDateReminderProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const now = new Date();
    const upcoming = goals
      .filter(g => g.deadline && g.status !== 'APPROVED' && g.status !== 'ARCHIVED')
      .map(goal => {
        const deadline = new Date(goal.deadline!);
        const diffTime = deadline.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let urgency: 'overdue' | 'urgent' | 'upcoming' | 'normal';
        if (daysLeft < 0) urgency = 'overdue';
        else if (daysLeft <= 3) urgency = 'urgent';
        else if (daysLeft <= 7) urgency = 'upcoming';
        else urgency = 'normal';
        
        return { goal, daysLeft, urgency };
      })
      .filter(r => r.urgency !== 'normal')
      .sort((a, b) => a.daysLeft - b.daysLeft);

    setReminders(upcoming);
  }, [goals]);

  if (reminders.length === 0) return null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'bg-red-500';
      case 'urgent': return 'bg-orange-500';
      case 'upcoming': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return <AlertTriangle size={16} />;
      case 'urgent': return <Clock size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-3">
        <Bell size={18} />
        Upcoming Deadlines
      </h4>
      <div className="space-y-2">
        {reminders.slice(0, 5).map((reminder) => (
          <div 
            key={reminder.goal.id}
            className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
              reminder.urgency === 'overdue' ? 'border-red-500 bg-red-50' :
              reminder.urgency === 'urgent' ? 'border-orange-500 bg-orange-50' :
              'border-yellow-500 bg-yellow-50'
            }`}
          >
            <span className={`text-white p-1 rounded ${getUrgencyColor(reminder.urgency)}`}>
              {getUrgencyIcon(reminder.urgency)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{reminder.goal.title}</p>
              <p className={`text-xs ${
                reminder.urgency === 'overdue' ? 'text-red-600' :
                reminder.urgency === 'urgent' ? 'text-orange-600' :
                'text-yellow-600'
              }`}>
                {reminder.daysLeft < 0 
                  ? `${Math.abs(reminder.daysLeft)} days overdue` 
                  : `${reminder.daysLeft} days left`}
              </p>
            </div>
          </div>
        ))}
      </div>
      {reminders.length > 5 && (
        <p className="text-sm text-gray-500 text-center mt-2">
          +{reminders.length - 5} more deadlines
        </p>
      )}
    </div>
  );
}
