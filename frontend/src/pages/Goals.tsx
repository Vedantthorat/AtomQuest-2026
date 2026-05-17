import { useState, useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useCycleGuard } from '../hooks/useCycleGuard';
import { goalsApi } from '../services/api';
import { Plus, Save, X, Edit2, Send, Target, Lock, Unlock, CheckCircle, AlertCircle, Clock, Eye, CheckSquare, Upload, Search, Filter, XCircle } from 'lucide-react';
import type { Goal, ThrustArea, UoMType, Quarter, GoalProgressStatus, KPIType, Priority, GoalStatus } from '../types';

const THRUST_AREAS = ['Revenue & Growth', 'Customer Excellence', 'Operational Excellence', 'Innovation & Digital Transformation', 'Talent & Culture', 'Sustainability', 'Compliance & Risk', 'Market Expansion'] as const;
const UOM_TYPES = [
  { value: 'MIN', label: 'Min (Higher is Better)', example: 'Revenue, Sales, Customer Satisfaction' },
  { value: 'MAX', label: 'Max (Lower is Better)', example: 'TAT, Cost, Errors, Defects' },
  { value: 'TIMELINE', label: 'Timeline (Date-based)', example: 'Project Delivery, Milestones' },
  { value: 'ZERO', label: 'Zero (0 = Success)', example: 'Safety Incidents, Complaints' }
] as const;
const PROGRESS_STATUS = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'text-gray-500' },
  { value: 'ON_TRACK', label: 'On Track', color: 'text-green-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'text-blue-500' },
  { value: 'AT_RISK', label: 'At Risk', color: 'text-red-500' }
] as const;

export default function Goals() {
  const { user } = useAuthStore();
  const { goals, addGoal, updateGoal, approveGoal, returnGoal, unlockGoal, validateWeightage, canAddGoal, submitCheckIn, setGoals } = useDataStore();
  const { allowed: canCheckIn, reason: checkInReason } = useCycleGuard('CHECK_IN');
  
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInData, setCheckInData] = useState({ actualValue: 0, status: 'ON_TRACK' as GoalProgressStatus, comment: '' });
  const [validationError, setValidationError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [filterQuarter, setFilterQuarter] = useState<Quarter | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'weightage'>('newest');
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    thrustArea: 'Revenue & Growth' as ThrustArea,
    weightage: 20,
    kpiType: 'QUANTITATIVE' as KPIType,
    uomType: 'MIN' as UoMType,
    targetValue: 100,
    unit: '%',
    quarter: 'Q1' as Quarter,
    year: 2026,
    priority: 'MEDIUM' as Priority,
    startDate: '',
    deadline: ''
  });

  const userGoals = goals.filter((g) => g.ownerId === user?.id || user?.role === 'ADMIN' || user?.role === 'MANAGER');
  
  const filteredGoals = useMemo(() => {
    let filtered = userGoals.filter((goal) => {
      const matchesSearch = searchQuery === '' || 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || goal.status === filterStatus;
      const matchesPriority = filterPriority === 'ALL' || goal.priority === filterPriority;
      const matchesQuarter = filterQuarter === 'ALL' || goal.quarter === filterQuarter;
      return matchesSearch && matchesStatus && matchesPriority && matchesQuarter;
    });
    
    // Sorting
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        case 'weightage':
          return b.weightage - a.weightage;
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return filtered;
  }, [userGoals, searchQuery, filterStatus, filterPriority, filterQuarter, sortBy]);
  
  const totalWeightage = useMemo(() => filteredGoals.reduce((sum, g) => sum + g.weightage, 0), [filteredGoals]);
  const canEdit = user?.role === 'EMPLOYEE' || user?.role === 'ADMIN';

  const handleCreate = () => {
    // Validate weightage
    const validation = validateWeightage(newGoal.weightage);
    if (!validation.valid) {
      setValidationError(validation.message);
      return;
    }
    
    // Check max goals
    const canAdd = canAddGoal(user?.id || '');
    if (!canAdd.canAdd) {
      setValidationError(canAdd.message);
      return;
    }
    
    const goal: Goal = {
      id: `g${Date.now()}`,
      ...newGoal,
      status: 'DRAFT',
      currentValue: 0,
      actualAchievement: 0,
      progressStatus: 'NOT_STARTED',
      ownerId: user?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addGoal(goal);
    setShowNewGoal(false);
    setNewGoal({
      title: '',
      description: '',
      thrustArea: 'Revenue & Growth',
      weightage: 20,
      kpiType: 'QUANTITATIVE',
      uomType: 'MIN',
      targetValue: 100,
      unit: '%',
      quarter: 'Q1',
      year: 2026,
      priority: 'MEDIUM',
      startDate: '',
      deadline: ''
    });
    setValidationError('');
  };

  const handleSubmit = (id: string) => {
    updateGoal(id, { status: 'PENDING' });
  };

  const handleSubmitAll = async () => {
    const draftGoals = userGoals.filter(g => g.status === 'DRAFT');
    if (draftGoals.length === 0) {
      setValidationError('No draft goals to submit');
      return;
    }
    if (totalWeightage !== 100) {
      setValidationError(`Total weightage must be 100%. Current: ${totalWeightage}%`);
      return;
    }
    try {
      await goalsApi.submitAll('Q1', 2026);
      setGoals(goals.map(g => g.status === 'DRAFT' ? { ...g, status: 'PENDING' } : g));
      setValidationError('');
    } catch (error: any) {
      setValidationError(error.response?.data?.error || 'Failed to submit goals');
    }
  };

  const handleUnlock = async (goalId: string) => {
    try {
      await goalsApi.unlock(goalId);
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        updateGoal(goalId, { status: 'APPROVED' });
      }
    } catch (error) {
      console.error('Failed to unlock goal:', error);
    }
  };

  const handleCheckIn = () => {
    if (!canCheckIn) {
      setValidationError(checkInReason || 'Check-in is not allowed at this time');
      return;
    }
    if (selectedGoal) {
      submitCheckIn(selectedGoal.id, selectedGoal.quarter as Quarter, checkInData.actualValue, checkInData.status as GoalProgressStatus, checkInData.comment);
      setShowCheckIn(false);
      setSelectedGoal(null);
    }
  };

  const openCheckIn = (goal: Goal) => {
    setSelectedGoal(goal);
    setCheckInData({
      actualValue: goal.actualAchievement || goal.currentValue,
      status: goal.progressStatus || 'ON_TRACK',
      comment: ''
    });
    setShowCheckIn(true);
  };

  const handleApprove = async (goalId: string) => {
    try {
      const { approvalsApi } = await import('../services/api');
      await approvalsApi.approve(goalId);
      updateGoal(goalId, { status: 'APPROVED', approvedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to approve goal:', error);
    }
  };

  const handleReturn = async (goalId: string) => {
    try {
      const { approvalsApi } = await import('../services/api');
      await approvalsApi.return(goalId, 'Please revise targets to be more specific');
      updateGoal(goalId, { status: 'RETURNED' });
    } catch (error) {
      console.error('Failed to return goal:', error);
    }
  };

  // Calculate progress based on UoM type - BRD Formulas
  const calculateProgress = (goal: Goal): number => {
    const target = goal.targetValue;
    const actual = goal.actualAchievement ?? goal.currentValue ?? 0;
    
    switch (goal.uomType) {
      case 'MIN':
        // MIN = Higher is better (e.g., Revenue, Sales, Customer Satisfaction)
        // Formula: achievement ÷ target × 100, capped at 100%
        if (target === 0) return 0;
        return Math.min((actual / target) * 100, 100);
      
      case 'MAX':
        // MAX = Lower is better (e.g., TAT, Cost, Errors, Defects)
        // Formula: target ÷ achievement × 100, if achievement=0 return 100%
        if (actual === 0) return 100;
        if (target === 0) return 0;
        return Math.min((target / actual) * 100, 100);
      
      case 'TIMELINE':
        // TIMELINE = Date-based completion
        // If completed before deadline → 100%, else partial based on time
        if (goal.completedAt && goal.deadline) {
          const completed = new Date(goal.completedAt);
          const deadline = new Date(goal.deadline);
          if (completed <= deadline) return 100;
        }
        
        // Time-based partial progress
        const now = new Date();
        const start = goal.startDate ? new Date(goal.startDate) : null;
        const deadline = goal.deadline ? new Date(goal.deadline) : null;
        
        if (!start || !deadline) return Math.min(actual, 100);
        
        const totalDuration = deadline.getTime() - start.getTime();
        if (totalDuration <= 0) return 0;
        
        const elapsed = now.getTime() - start.getTime();
        const remaining = deadline.getTime() - now.getTime();
        
        if (remaining < 0) return 0;
        
        return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
      
      case 'ZERO':
        // ZERO = Binary (0 = Success, anything else = Failure)
        // If achievement === 0 → 100%, else 0%
        return actual === 0 ? 100 : 0;
      
      default:
        return 0;
    }
  };

  // Get progress explanation text
  const getProgressExplanation = (goal: Goal): string => {
    const target = goal.targetValue;
    const actual = goal.actualAchievement ?? goal.currentValue ?? 0;
    const progress = calculateProgress(goal);
    
    switch (goal.uomType) {
      case 'MIN':
        return `${actual} ÷ ${target} × 100 = ${progress.toFixed(1)}%`;
      case 'MAX':
        if (actual === 0) return `${target} ÷ 0 = 100% (no incidents = success)`;
        return `${target} ÷ ${actual} × 100 = ${progress.toFixed(1)}%`;
      case 'TIMELINE':
        if (goal.completedAt) return `Completed: ${goal.completedAt}`;
        return `Time-based: ${progress.toFixed(1)}%`;
      case 'ZERO':
        return actual === 0 ? `✓ Zero incidents = 100%` : `${actual} incidents = 0%`;
      default:
        return `${progress}%`;
    }
  };

  const getStatusIcon = (status: GoalProgressStatus) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="text-green-500" size={16} />;
      case 'ON_TRACK': return <CheckSquare className="text-blue-500" size={16} />;
      case 'AT_RISK': return <AlertCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Goal Sheet</h1>
          <p className="text-[var(--muted-foreground)]">Create, track, and manage your goals</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-lg font-bold ${totalWeightage === 100 ? 'text-green-500' : totalWeightage > 100 ? 'text-red-500' : 'text-[var(--foreground)]'}`}>
              Total Weightage: {totalWeightage}%
            </div>
            {totalWeightage !== 100 && (
              <div className="text-xs text-[var(--muted-foreground)]">
                Must equal 100% (currently {totalWeightage}%)
              </div>
            )}
          </div>
          {canEdit && (
            <>
              {userGoals.some(g => g.status === 'DRAFT') && totalWeightage === 100 && (
                <button onClick={handleSubmitAll} className="btn-secondary flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <Upload size={18} /> Submit All for Approval
                </button>
              )}
              <button onClick={() => setShowNewGoal(true)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add Goal
              </button>
            </>
          )}
        </div>
      </div>

      {showNewGoal && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Goal</h2>
          
          {validationError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {validationError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2">Goal Title *</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="input"
                placeholder="Enter goal title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Thrust Area *</label>
              <select
                value={newGoal.thrustArea}
                onChange={(e) => setNewGoal({ ...newGoal, thrustArea: e.target.value as ThrustArea })}
                className="input"
              >
                {THRUST_AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="input"
                rows={2}
                placeholder="Describe the goal and expected outcomes"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Weightage (%) *</label>
              <input
                type="number"
                value={newGoal.weightage}
                onChange={(e) => setNewGoal({ ...newGoal, weightage: parseInt(e.target.value) })}
                className="input"
                min={10}
                max={100}
              />
              <div className="text-xs text-[var(--muted-foreground)] mt-1">Min: 10%, Max: 100%</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Unit of Measurement *</label>
              <select
                value={newGoal.uomType}
                onChange={(e) => setNewGoal({ ...newGoal, uomType: e.target.value as UoMType })}
                className="input"
              >
                {UOM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">
                {UOM_TYPES.find(t => t.value === newGoal.uomType)?.example}
              </div>
            </div>
            
            {newGoal.uomType === 'TIMELINE' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            )}
            
            {newGoal.uomType === 'ZERO' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm">
                <strong>Note:</strong> For Zero-based goals, the target should be 0. Any deviation from 0 will result in 0% progress. Example: Zero safety incidents = 100% success.
              </div>
            )}
            
            {newGoal.uomType === 'MAX' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                <strong>Note:</strong> For Max (lower is better) goals, a lower actual value means higher progress. If actual = 0, progress = 100%. Example: Target 10 defects, actual 5 = 200% (capped at 100%).
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Target Value *</label>
              <input
                type="number"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseFloat(e.target.value) })}
                className="input"
                min={0}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Unit *</label>
              <input
                type="text"
                value={newGoal.unit}
                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                className="input"
                placeholder="%, $, hours, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as Priority })}
                className="input"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => { setShowNewGoal(false); setValidationError(''); }} className="btn-secondary flex items-center gap-2">
              <X size={18} /> Cancel
            </button>
            <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
              <Save size={18} /> Save Goal
            </button>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckIn && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-4">Q1 Check-in: {selectedGoal.title}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Actual Achievement</label>
                <input
                  type="number"
                  value={checkInData.actualValue}
                  onChange={(e) => setCheckInData({ ...checkInData, actualValue: parseFloat(e.target.value) })}
                  className="input"
                />
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  Target: {selectedGoal.targetValue} {selectedGoal.unit}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={checkInData.status}
                  onChange={(e) => setCheckInData({ ...checkInData, status: e.target.value as GoalProgressStatus })}
                  className="input"
                >
                  {PROGRESS_STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                <textarea
                  value={checkInData.comment}
                  onChange={(e) => setCheckInData({ ...checkInData, comment: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Add any notes about progress..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowCheckIn(false); setSelectedGoal(null); }} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCheckIn} className="btn-primary">
                Submit Check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <XCircle size={18} />
              </button>
            )}
          </div>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as GoalStatus | 'ALL')}
            className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="RETURNED">Returned</option>
          </select>
          
          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'ALL')}
            className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg"
          >
            <option value="ALL">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          
          {/* Quarter Filter */}
          <select
            value={filterQuarter}
            onChange={(e) => setFilterQuarter(e.target.value as Quarter | 'ALL')}
            className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg"
          >
            <option value="ALL">All Quarters</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
          
          {/* Results Count */}
          <div className="text-sm text-gray-500">
            {filteredGoals.length} of {userGoals.length} goals
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">{goal.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    goal.progressStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    goal.progressStatus === 'ON_TRACK' ? 'bg-blue-100 text-blue-700' :
                    goal.progressStatus === 'AT_RISK' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {goal.progressStatus === 'NOT_STARTED' ? 'Not Started' : 
                     goal.progressStatus === 'ON_TRACK' ? 'On Track' :
                     goal.progressStatus === 'COMPLETED' ? 'Completed' :
                     goal.progressStatus === 'AT_RISK' ? 'At Risk' : 'Unknown'}
                  </span>
                  {goal.lockedAt && (
                    <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                      <Lock size={12} /> Locked
                    </span>
                  )}
                  <span className={`badge ${
                    goal.status === 'APPROVED' ? 'badge-success' : 
                    goal.status === 'PENDING' ? 'badge-warning' : 
                    goal.status === 'REJECTED' ? 'badge-danger' : 
                    goal.status === 'RETURNED' ? 'badge-info' : 'badge-gray'
                  }`}>
                    {goal.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">{goal.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                  <span>Thrust Area: {goal.thrustArea}</span>
                  <span>UoM: {goal.uomType}</span>
                  <span>Quarter: {goal.quarter} {goal.year}</span>
                </div>
              </div>
              
              {/* Manager Actions */}
              {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && goal.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(goal.id)} className="px-3 py-1 text-sm bg-success text-white rounded-lg hover:bg-green-600">
                    Approve
                  </button>
                  <button onClick={() => handleReturn(goal.id)} className="px-3 py-1 text-sm bg-warning text-white rounded-lg hover:bg-yellow-600">
                    Return
                  </button>
                </div>
              )}
              
              {/* Admin unlock */}
              {user?.role === 'ADMIN' && goal.status === 'APPROVED' && (
                <button onClick={() => handleUnlock(goal.id)} className="p-2 hover:bg-[var(--muted)] rounded-lg" title="Unlock Goal">
                  <Unlock size={16} />
                </button>
              )}
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-[var(--muted)] rounded-lg">
              <div>
                <div className="text-xs text-[var(--muted-foreground)]">Target</div>
                <div className="font-semibold">{goal.targetValue} {goal.unit}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted-foreground)]">Actual Achievement</div>
                <div className="font-semibold">{goal.actualAchievement} {goal.unit}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted-foreground)]">Progress</div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(goal.progressStatus)}
                  <span className="font-semibold">{Math.round(calculateProgress(goal))}%</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[var(--muted-foreground)]">Progress</span>
                <span className="font-medium">{Math.round(calculateProgress(goal))}%</span>
              </div>
              <div className="w-full h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full progress-bar ${
                    goal.progressStatus === 'COMPLETED' ? 'bg-green-500' :
                    goal.progressStatus === 'AT_RISK' ? 'bg-red-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${Math.min(calculateProgress(goal), 100)}%` }}
                />
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1 font-mono bg-[var(--muted)] p-2 rounded">
                {getProgressExplanation(goal)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
                <span>Weightage: <strong className="text-[var(--foreground)]">{goal.weightage}%</strong></span>
                <span>Priority: <strong className="text-[var(--foreground)]">{goal.priority}</strong></span>
                {goal.approvedAt && <span>Approved: {new Date(goal.approvedAt).toLocaleDateString()}</span>}
              </div>
              <div className="flex gap-2">
                {canEdit && !goal.lockedAt && (goal.status === 'DRAFT' || goal.status === 'RETURNED') && (
                  <>
                    <button onClick={() => setEditingGoal(goal.id)} className="p-2 hover:bg-[var(--muted)] rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    {totalWeightage !== 100 && (
                      <button onClick={() => handleSubmit(goal.id)} className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-1">
                        <Send size={14} /> Submit
                      </button>
                    )}
                  </>
                )}
                {goal.status === 'APPROVED' && (
                  <button onClick={() => openCheckIn(goal)} className="px-3 py-1 text-sm bg-success text-white rounded-lg hover:bg-green-600 flex items-center gap-1">
                    <CheckSquare size={14} /> Update Progress
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {userGoals.length === 0 && (
          <div className="empty-state">
            <Target size={48} className="mb-4" />
            <p>No goals yet. Create your first goal to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}