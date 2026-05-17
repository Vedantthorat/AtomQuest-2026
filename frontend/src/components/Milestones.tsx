import { useState } from 'react';
import { Plus, Calendar, CheckCircle, Circle, Trash2, Edit2 } from 'lucide-react';
import type { Milestone } from '../types';

interface MilestonesProps {
  goalId: string;
  milestones: Milestone[];
  onAddMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateMilestone: (id: string, updates: Partial<Milestone>) => void;
  onDeleteMilestone: (id: string) => void;
  onToggleComplete: (id: string) => void;
  readOnly?: boolean;
}

export default function Milestones({ 
  goalId, 
  milestones, 
  onAddMilestone, 
  onUpdateMilestone, 
  onDeleteMilestone,
  onToggleComplete,
  readOnly = false 
}: MilestonesProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', targetDate: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!newMilestone.title || !newMilestone.targetDate) return;
    onAddMilestone({
      goalId,
      title: newMilestone.title,
      targetDate: newMilestone.targetDate,
      description: newMilestone.description,
      isCompleted: false,
      order: milestones.length
    });
    setNewMilestone({ title: '', targetDate: '', description: '' });
    setShowAdd(false);
  };

  const progress = milestones.length > 0 
    ? Math.round((milestones.filter(m => m.isCompleted).length / milestones.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
          <Calendar size={18} />
          Milestones
        </h4>
        {!readOnly && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <Plus size={16} /> Add Milestone
          </button>
        )}
      </div>

      {milestones.length > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {showAdd && (
        <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)] space-y-3">
          <input
            type="text"
            placeholder="Milestone title"
            value={newMilestone.title}
            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
          />
          <input
            type="date"
            value={newMilestone.targetDate}
            onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary text-sm py-1">
              Add
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm py-1">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sortedMilestones.map((milestone) => (
          <div 
            key={milestone.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              milestone.isCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-[var(--card)] border-[var(--border)]'
            }`}
          >
            <button
              onClick={() => !readOnly && onToggleComplete(milestone.id)}
              className={`flex-shrink-0 ${milestone.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'}`}
              disabled={readOnly}
            >
              {milestone.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${milestone.isCompleted ? 'line-through text-gray-500' : ''}`}>
                {milestone.title}
              </p>
              <p className="text-xs text-gray-500">
                Due: {new Date(milestone.targetDate).toLocaleDateString()}
              </p>
            </div>
            {!readOnly && (
              <button
                onClick={() => onDeleteMilestone(milestone.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {milestones.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No milestones yet</p>
      )}
    </div>
  );
}