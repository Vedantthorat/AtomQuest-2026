import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { Target, CheckCircle, Clock, TrendingUp, Users, BarChart3, AlertTriangle, Sparkles, ChevronDown, ChevronUp, Shield, UserCog, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiApi } from '../services/api';

interface GoalHealthAnalysis {
  summary: string;
  atRiskGoals: string[];
  misalignedGoals: string[];
  recommendations: string[];
}

const roleConfig = {
  EMPLOYEE: { color: 'emerald', icon: Briefcase, label: 'Employee' },
  MANAGER: { color: 'blue', icon: UserCog, label: 'Manager' },
  ADMIN: { color: 'purple', icon: Shield, label: 'Admin' }
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { goals, getDashboardStats, getPendingApprovals, notifications, setGoals } = useDataStore();
  const [aiInsights, setAiInsights] = useState<GoalHealthAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(true);

  const stats = getDashboardStats();
  const pendingApprovals = getPendingApprovals(user?.id || '');
  const unreadCount = notifications.filter((n) => !n.read).length;
  const role = user?.role || 'EMPLOYEE';

  useEffect(() => {
    const fetchAIInsights = async () => {
      if (role === 'EMPLOYEE' && goals.length > 0) {
        setAiLoading(true);
        try {
          const response = await aiApi.analyzeGoals();
          setAiInsights(response.data);
        } catch (error) {
          console.warn('Failed to fetch AI insights:', error);
        } finally {
          setAiLoading(false);
        }
      }
    };
    fetchAIInsights();
  }, [role, goals.length]);

  const currentRoleConfig = roleConfig[role as keyof typeof roleConfig] || roleConfig.EMPLOYEE;

  return (
    <div className="space-y-6">
      {/* Role-based Welcome Banner */}
      <div className={`bg-gradient-to-r from-${currentRoleConfig.color}-500/10 to-${currentRoleConfig.color}-600/10 rounded-xl border border-${currentRoleConfig.color}-500/20 p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 bg-${currentRoleConfig.color}-500/20 rounded-xl flex items-center justify-center`}>
              <currentRoleConfig.icon className={`text-${currentRoleConfig.color}-500`} size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-[var(--muted-foreground)]">
                {role === 'EMPLOYEE' && 'Focus on your goals and track your progress'}
                {role === 'MANAGER' && 'Manage your team and approve goals'}
                {role === 'ADMIN' && 'Full system access and administrative controls'}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 bg-${currentRoleConfig.color}-500/20 rounded-lg`}>
            <span className={`text-${currentRoleConfig.color}-500 font-semibold`}>{currentRoleConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] card-hover">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-${currentRoleConfig.color}-500/10 rounded-lg flex items-center justify-center`}>
              <Target className={`text-${currentRoleConfig.color}-500`} size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{stats.totalGoals}</div>
              <div className="text-sm text-[var(--muted-foreground)]">Active Goals</div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-success" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{stats.approvedGoals}</div>
              <div className="text-sm text-[var(--muted-foreground)]">Approved</div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="text-warning" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{stats.pendingGoals}</div>
              <div className="text-sm text-[var(--muted-foreground)]">Pending</div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">{Math.round(stats.avgProgress)}%</div>
              <div className="text-sm text-[var(--muted-foreground)]">Avg Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific Quick Actions */}
      {role === 'MANAGER' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin?tab=team" className="bg-[var(--card)] rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="text-blue-500" size={24} />
              </div>
              <div>
                <div className="font-semibold text-[var(--foreground)]">Manage Team</div>
                <div className="text-sm text-[var(--muted-foreground)]">View & manage team goals</div>
              </div>
            </div>
          </Link>
          <Link to="/escalations" className="bg-[var(--card)] rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-orange-500" size={24} />
              </div>
              <div>
                <div className="font-semibold text-[var(--foreground)]">Escalations</div>
                <div className="text-sm text-[var(--muted-foreground)]">Handle team escalations</div>
              </div>
            </div>
          </Link>
          <Link to="/shared-goals" className="bg-[var(--card)] rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-purple-500" size={24} />
              </div>
              <div>
                <div className="font-semibold text-[var(--foreground)]">Shared Goals</div>
                <div className="text-sm text-[var(--muted-foreground)]">Cross-team objectives</div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/admin" className="bg-[var(--card)] rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Shield className="text-purple-500" size={24} />
              </div>
              <div>
                <div className="font-semibold text-[var(--foreground)]">Admin Panel</div>
                <div className="text-sm text-[var(--muted-foreground)]">System settings</div>
              </div>
            </div>
          </Link>
          <Link to="/admin?tab=team" className="bg-[var(--card)] rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="text-blue-500" size={24} />
              </div>
              <div>
                <div className="font-semibold text-[var(--foreground)]">Team Management</div>
                <div className="text-sm text-[var(--muted-foreground)]">Manage all teams</div>
              </div>
            </div>
          </Link>
          <Link to="/audit" className="bg-[var(--card)] rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-amber-500" size={24} />
              </div>
              <div>
                <div className="font-semibold text-[var(--foreground)]">Audit Trail</div>
                <div className="text-sm text-[var(--muted-foreground)]">View all activities</div>
              </div>
            </div>
          </Link>
          <Link to="/escalations" className="bg-[var(--card)] rounded-xl p-6 border border-red-500/20 hover:border-red-500/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <div className="font-semibold text-[var(--foreground)]">Escalations</div>
                <div className="text-sm text-[var(--muted-foreground)]">System escalations</div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* AI Insights Card */}
      {role === 'EMPLOYEE' && (
        <div className="bg-gradient-to-r from-purple/10 to-blue/10 rounded-xl border border-purple/20 p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setAiExpanded(!aiExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple/20 rounded-lg flex items-center justify-center">
                <Sparkles className="text-purple" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">AI Insights</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Goal health analysis powered by Claude</p>
              </div>
            </div>
            {aiExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {aiExpanded && (
            <div className="mt-4">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <div className="w-4 h-4 border-2 border-purple border-t-transparent rounded-full animate-spin" />
                  Analyzing your goals...
                </div>
              ) : aiInsights ? (
                <div className="space-y-4">
                  <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
                    <p className="text-[var(--foreground)]">{aiInsights.summary}</p>
                  </div>
                  
                  {aiInsights.atRiskGoals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-500 mb-2">At Risk Goals</h4>
                      <ul className="space-y-1">
                        {aiInsights.atRiskGoals.map((goal, i) => (
                          <li key={i} className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                            <AlertTriangle size={14} className="text-red-500" /> {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiInsights.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-600 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {aiInsights.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-500" /> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">Create some goals to get AI-powered insights!</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Goals */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">My Goals</h2>
            <Link to="/goals" className="text-sm text-primary-500 hover:underline">View all</Link>
          </div>
          <div className="p-4 space-y-3">
            {goals.slice(0, 4).map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                <div>
                  <div className="font-medium text-[var(--foreground)]">{goal.title}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`badge ${goal.status === 'APPROVED' ? 'badge-success' : goal.status === 'PENDING' ? 'badge-warning' : 'badge-info'}`}>
                    {goal.status}
                  </span>
                </div>
              </div>
            ))}
            {goals.length === 0 && (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                No goals yet. <Link to="/goals" className="text-primary-500">Create your first goal</Link>
              </div>
            )}
          </div>
        </div>

        {/* Pending Approvals (Manager/Admin only) */}
        {(role === 'MANAGER' || role === 'ADMIN') && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">Pending Approvals</h2>
              <span className="badge badge-warning">{pendingApprovals.length}</span>
            </div>
            <div className="p-4 space-y-3">
              {pendingApprovals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                  <div>
                    <div className="font-medium text-[var(--foreground)]">{goal.title}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {goal.weightage}%
                    </div>
                  </div>
                  <Link
                    to={`/goals?approve=${goal.id}`}
                    className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Review
                  </Link>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  No pending approvals
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--foreground)]">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <Link
              to="/goals?new=true"
              className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              <Target className="text-primary-500" size={20} />
              <span className="text-sm font-medium">New Goal</span>
            </Link>
            <Link
              to="/ai-assistant"
              className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              <span className="text-purple">✨</span>
              <span className="text-sm font-medium">AI Assistant</span>
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              <BarChart3 className="text-success" size={20} />
              <span className="text-sm font-medium">Analytics</span>
            </Link>
            {role === 'MANAGER' && (
              <Link
                to="/escalations"
                className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] transition-colors"
              >
                <AlertTriangle className="text-warning" size={20} />
                <span className="text-sm font-medium">Escalations</span>
              </Link>
            )}
          </div>
        </div>

        {/* Role-specific cards */}
        {role === 'ADMIN' && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--foreground)]">Admin Panel</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <Link
                to="/admin?tab=users"
                className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] transition-colors"
              >
                <Users className="text-primary-500" size={20} />
                <span className="text-sm font-medium">User Management</span>
              </Link>
              <Link
                to="/admin?tab=cycles"
                className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] transition-colors"
              >
                <Clock className="text-warning" size={20} />
                <span className="text-sm font-medium">Cycle Config</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}