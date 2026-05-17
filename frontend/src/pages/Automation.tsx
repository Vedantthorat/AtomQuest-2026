import { useState, useEffect } from 'react';
import { Settings, Plus, Play, Pause, Trash2, Edit, Copy, Zap, Clock, Target, CheckCircle, AlertTriangle, MessageSquare, Calendar, ArrowRight, MoreVertical, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  conditions: { field: string; operator: string; value: string }[];
  actions: { type: string; config: Record<string, any> }[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

const TRIGGER_OPTIONS = [
  { value: 'GOAL_CREATED', label: 'Goal Created', description: 'When a new goal is created', icon: Target },
  { value: 'GOAL_APPROVED', label: 'Goal Approved', description: 'When a goal is approved', icon: CheckCircle },
  { value: 'GOAL_REJECTED', label: 'Goal Rejected', description: 'When a goal is rejected', icon: AlertTriangle },
  { value: 'CHECKIN_SUBMITTED', label: 'Check-in Submitted', description: 'When a check-in is submitted', icon: Calendar },
  { value: 'ESCALATION_CREATED', label: 'Escalation Created', description: 'When an escalation is created', icon: AlertTriangle },
  { value: 'DUE_DATE_APPROACHING', label: 'Due Date Approaching', description: 'When goal deadline is near', icon: Clock }
];

const ACTION_OPTIONS = [
  { value: 'SEND_NOTIFICATION', label: 'Send Notification', description: 'Send email/SMS/push notification', icon: MessageSquare },
  { value: 'SEND_REMINDER', label: 'Send Reminder', description: 'Send reminder to complete task', icon: Clock },
  { value: 'UPDATE_STATUS', label: 'Update Status', description: 'Change goal or task status', icon: ToggleLeft },
  { value: 'ASSIGN_TASK', label: 'Assign Task', description: 'Assign task to team member', icon: Target }
];

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' }
];

export default function Automation() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Notify on Goal Approval',
      trigger: 'GOAL_APPROVED',
      conditions: [{ field: 'thrustArea', operator: 'equals', value: 'Revenue' }],
      actions: [{ type: 'SEND_NOTIFICATION', config: { channel: 'email' } }],
      isActive: true,
      createdAt: '2026-01-10T10:00:00Z',
      lastTriggered: '2026-05-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Check-in Reminder',
      trigger: 'CHECKIN_SUBMITTED',
      conditions: [],
      actions: [{ type: 'SEND_REMINDER', config: { daysBefore: 7 } }],
      isActive: true,
      createdAt: '2026-02-05T10:00:00Z',
      lastTriggered: '2026-05-10T09:00:00Z'
    },
    {
      id: '3',
      name: 'Escalation Alert',
      trigger: 'ESCALATION_CREATED',
      conditions: [{ field: 'priority', operator: 'equals', value: 'HIGH' }],
      actions: [{ type: 'SEND_NOTIFICATION', config: { channel: 'sms' } }],
      isActive: false,
      createdAt: '2026-03-01T10:00:00Z'
    },
    {
      id: '4',
      name: 'Due Date Warning',
      trigger: 'DUE_DATE_APPROACHING',
      conditions: [{ field: 'daysRemaining', operator: 'less_than', value: '7' }],
      actions: [{ type: 'SEND_REMINDER', config: { channel: 'push' } }],
      isActive: true,
      createdAt: '2026-03-20T10:00:00Z',
      lastTriggered: '2026-05-16T08:00:00Z'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/automation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/automation/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchWorkflows();
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/automation/${workflowId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const getTriggerIcon = (trigger: string) => {
    const option = TRIGGER_OPTIONS.find(t => t.value === trigger);
    return option ? option.icon : Settings;
  };

  const getActionIcon = (type: string) => {
    const option = ACTION_OPTIONS.find(a => a.value === type);
    return option ? option.icon : Settings;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="text-amber-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Workflow Automation</h1>
            <p className="text-[var(--muted-foreground)]">Automate tasks with custom triggers and actions</p>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Total Workflows</span>
            <Settings className="text-purple-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)] mt-2">{workflows.length}</div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Active</span>
            <Play className="text-green-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-green-500 mt-2">{workflows.filter(w => w.isActive).length}</div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Paused</span>
            <Pause className="text-orange-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-orange-500 mt-2">{workflows.filter(w => !w.isActive).length}</div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Triggered Today</span>
            <Zap className="text-amber-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-amber-500 mt-2">0</div>
        </div>
      </div>

      {workflows.length > 0 ? (
        <div className="space-y-4">
          {workflows.map(workflow => {
            const TriggerIcon = getTriggerIcon(workflow.trigger);
            
            return (
              <div key={workflow.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${workflow.isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                      <Zap size={20} className={workflow.isActive ? 'text-green-500' : 'text-gray-500'} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">{workflow.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Created {new Date(workflow.createdAt).toLocaleDateString()}
                        {workflow.lastTriggered && ` • Last triggered ${new Date(workflow.lastTriggered).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWorkflow(workflow.id, workflow.isActive)}
                      className={`p-2 rounded-lg ${workflow.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}
                      title={workflow.isActive ? 'Pause' : 'Activate'}
                    >
                      {workflow.isActive ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button
                      onClick={() => setSelectedWorkflow(workflow)}
                      className="p-2 hover:bg-[var(--muted)] rounded-lg"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="p-2 hover:bg-[var(--muted)] rounded-lg text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-lg">
                    <TriggerIcon size={14} className="text-blue-500" />
                    <span className="text-sm text-blue-500">
                      {TRIGGER_OPTIONS.find(t => t.value === workflow.trigger)?.label || workflow.trigger}
                    </span>
                  </div>
                  
                  <ArrowRight size={16} className="text-[var(--muted-foreground)]" />
                  
                  {workflow.actions.map((action, index) => {
                    const ActionIcon = getActionIcon(action.type);
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-lg">
                          <ActionIcon size={14} className="text-purple-500" />
                          <span className="text-sm text-purple-500">
                            {ACTION_OPTIONS.find(a => a.value === action.type)?.label || action.type}
                          </span>
                        </div>
                        {index < workflow.actions.length - 1 && (
                          <span className="text-[var(--muted-foreground)]">+</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {workflow.conditions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <div className="text-xs text-[var(--muted-foreground)] mb-1">Conditions:</div>
                    <div className="flex flex-wrap gap-2">
                      {workflow.conditions.map((cond, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-[var(--muted)] rounded">
                          {cond.field} {cond.operator} {cond.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 text-center">
          <Zap size={48} className="mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Workflows Created</h3>
          <p className="text-[var(--muted-foreground)] mb-4">Create automated workflows to streamline your processes</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            Create Your First Workflow
          </button>
        </div>
      )}

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="font-semibold text-[var(--foreground)] mb-4">Available Triggers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRIGGER_OPTIONS.map(trigger => (
            <div key={trigger.value} className="p-4 bg-[var(--muted)] rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <trigger.icon size={20} className="text-blue-500" />
                <span className="font-medium text-[var(--foreground)]">{trigger.label}</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{trigger.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="font-semibold text-[var(--foreground)] mb-4">Available Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTION_OPTIONS.map(action => (
            <div key={action.value} className="p-4 bg-[var(--muted)] rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <action.icon size={20} className="text-purple-500" />
                <span className="font-medium text-[var(--foreground)]">{action.label}</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">Create Workflow</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[var(--muted)] rounded-lg">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-[var(--muted-foreground)]">Workflow Name</label>
                <input type="text" placeholder="e.g., Notify on Goal Approval" className="input w-full mt-1" />
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-2 block">When this happens (Trigger)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TRIGGER_OPTIONS.map(trigger => (
                    <label key={trigger.value} className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg cursor-pointer hover:bg-[var(--border)]">
                      <input type="radio" name="trigger" value={trigger.value} className="rounded" />
                      <trigger.icon size={18} className="text-blue-500" />
                      <span className="text-[var(--foreground)]">{trigger.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-2 block">Conditions (Optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select className="input flex-1">
                      <option value="">Select field</option>
                      <option value="status">Status</option>
                      <option value="thrustArea">Thrust Area</option>
                      <option value="weightage">Weightage</option>
                      <option value="priority">Priority</option>
                    </select>
                    <select className="input flex-1">
                      {OPERATORS.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                    <input type="text" placeholder="Value" className="input flex-1" />
                  </div>
                  <button className="text-sm text-primary-500">+ Add Condition</button>
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-2 block">Do this (Actions)</label>
                <div className="space-y-2">
                  {ACTION_OPTIONS.map(action => (
                    <label key={action.value} className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg cursor-pointer hover:bg-[var(--border)]">
                      <input type="checkbox" className="rounded" />
                      <action.icon size={18} className="text-purple-500" />
                      <div>
                        <span className="text-[var(--foreground)]">{action.label}</span>
                        <p className="text-xs text-[var(--muted-foreground)]">{action.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => setShowCreateModal(false)} className="btn-primary flex-1">Create Workflow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}