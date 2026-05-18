import { useState } from 'react';
import { Users, Settings, Building, Calendar, Shield, Plus, Search, Edit, Trash2, UserPlus, Activity, Target, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'departments', label: 'Departments', icon: Building },
  { id: 'cycles', label: 'Cycles', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const overview = {
  totalUsers: 156,
  totalGoals: 342,
  pendingApprovals: 18,
  activeCycle: { quarter: 'Q2 2026', startDate: '2026-04-01', endDate: '2026-06-30' },
  avgGoalCompletion: 72,
  activeEmployees: 142,
  departments: 8,
  avgCheckInRate: 89
};

const allUsers = [
  { id: 'u1', name: 'John Smith', email: 'john.smith@company.com', department: 'Sales', role: 'MANAGER', status: 'active', goals: 5, completed: 3, lastActive: '2026-05-17T10:30:00Z' },
  { id: 'u2', name: 'Sarah Johnson', email: 'sarah.j@company.com', department: 'Marketing', role: 'EMPLOYEE', status: 'active', goals: 4, completed: 2, lastActive: '2026-05-17T09:15:00Z' },
  { id: 'u3', name: 'Mike Williams', email: 'mike.w@company.com', department: 'Engineering', role: 'EMPLOYEE', status: 'active', goals: 6, completed: 4, lastActive: '2026-05-16T16:45:00Z' },
  { id: 'u4', name: 'Emily Davis', email: 'emily.d@company.com', department: 'HR', role: 'MANAGER', status: 'active', goals: 3, completed: 2, lastActive: '2026-05-17T08:00:00Z' },
  { id: 'u5', name: 'David Brown', email: 'david.b@company.com', department: 'Finance', role: 'EMPLOYEE', status: 'active', goals: 4, completed: 1, lastActive: '2026-05-15T14:20:00Z' },
  { id: 'u6', name: 'Lisa Anderson', email: 'lisa.a@company.com', department: 'Operations', role: 'EMPLOYEE', status: 'active', goals: 5, completed: 3, lastActive: '2026-05-17T11:00:00Z' },
  { id: 'u7', name: 'Robert Taylor', email: 'robert.t@company.com', department: 'IT', role: 'EMPLOYEE', status: 'inactive', goals: 2, completed: 0, lastActive: '2026-04-20T10:00:00Z' },
  { id: 'u8', name: 'Jennifer White', email: 'jennifer.w@company.com', department: 'Sales', role: 'EMPLOYEE', status: 'active', goals: 4, completed: 3, lastActive: '2026-05-17T12:30:00Z' },
];

const allDepartments = [
  { id: 'd1', name: 'Sales', headName: 'John Smith', employees: 28, goals: 45, completedGoals: 32 },
  { id: 'd2', name: 'Marketing', headName: 'Tom Harris', employees: 15, goals: 28, completedGoals: 18 },
  { id: 'd3', name: 'Engineering', headName: 'Karen Lee', employees: 35, goals: 62, completedGoals: 48 },
  { id: 'd4', name: 'HR', headName: 'Emily Davis', employees: 12, goals: 18, completedGoals: 14 },
  { id: 'd5', name: 'Finance', headName: 'Paul Miller', employees: 18, goals: 24, completedGoals: 16 },
  { id: 'd6', name: 'Operations', headName: 'Nancy Chen', employees: 22, goals: 38, completedGoals: 25 },
  { id: 'd7', name: 'IT', headName: 'James Wilson', employees: 14, goals: 22, completedGoals: 18 },
  { id: 'd8', name: 'Customer Support', headName: 'Maria Garcia', employees: 20, goals: 30, completedGoals: 22 },
];

const allCycles = [
  { id: 'c1', name: 'Q1 2026', startDate: '2026-01-01', endDate: '2026-03-31', status: 'CLOSED', goalsCount: 156, completionRate: 78 },
  { id: 'c2', name: 'Q2 2026', startDate: '2026-04-01', endDate: '2026-06-30', status: 'ACTIVE', goalsCount: 186, completionRate: 45 },
  { id: 'c3', name: 'Q3 2026', startDate: '2026-07-01', endDate: '2026-09-30', status: 'PLANNING', goalsCount: 0, completionRate: 0 },
  { id: 'c4', name: 'Q4 2026', startDate: '2026-10-01', endDate: '2026-12-31', status: 'PLANNING', goalsCount: 0, completionRate: 0 },
];

const settings = {
  system: { companyName: 'AtomQuest Inc.', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY', language: 'English' },
  goals: { defaultCycleLength: 90, minGoalsPerEmployee: 1, maxGoalsPerEmployee: 10, requireManagerApproval: true, autoCloseCompleted: true },
  notifications: { emailAlerts: true, checkInReminders: true, goalDeadlineAlerts: true, weeklyDigest: true },
  security: { twoFactorRequired: false, sessionTimeout: 30, passwordExpiry: 90, ipWhitelist: false }
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(allUsers);
  const [cycles, setCycles] = useState(allCycles);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = (id: string, role: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  const handleCycleStatusChange = (id: string, status: string) => {
    setCycles(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Panel</h1>
        <p className="text-[var(--muted-foreground)]">System configuration and management</p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id ? 'bg-primary-500 text-white' : 'hover:bg-[var(--muted)]'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-500" size={20} />
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">Total Users</span>
              </div>
              <div className="text-3xl font-bold">{overview.totalUsers}</div>
              <div className="text-xs text-green-500 mt-1">+12 this month</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Target className="text-purple-500" size={20} />
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">Total Goals</span>
              </div>
              <div className="text-3xl font-bold">{overview.totalGoals}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">{overview.activeEmployees} active</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-warning" size={20} />
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">Pending Approvals</span>
              </div>
              <div className="text-3xl font-bold text-warning">{overview.pendingApprovals}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">Needs attention</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Calendar className="text-green-500" size={20} />
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">Active Cycle</span>
              </div>
              <div className="text-lg font-bold">{overview.activeCycle.quarter}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">
                {new Date(overview.activeCycle.startDate).toLocaleDateString()} - {new Date(overview.activeCycle.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="text-blue-500" size={18} /> Performance Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--muted-foreground)]">Avg Goal Completion</span>
                    <span className="font-medium">{overview.avgGoalCompletion}%</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${overview.avgGoalCompletion}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--muted-foreground)]">Check-in Rate</span>
                    <span className="font-medium">{overview.avgCheckInRate}%</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${overview.avgCheckInRate}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building className="text-purple-500" size={18} /> Department Overview
              </h3>
              <div className="text-3xl font-bold mb-1">{overview.departments}</div>
              <div className="text-sm text-[var(--muted-foreground)]">Active Departments</div>
              <div className="mt-4 flex gap-2">
                <div className="flex-1 p-2 bg-[var(--muted)] rounded-lg text-center">
                  <div className="text-lg font-bold">{overview.activeEmployees}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Employees</div>
                </div>
                <div className="flex-1 p-2 bg-[var(--muted)] rounded-lg text-center">
                  <div className="text-lg font-bold">186</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Active Goals</div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-warning" size={18} /> Recent Alerts
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <Clock size={14} className="text-warning mt-0.5" />
                  <span>8 goals approaching deadline</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle size={14} className="text-green-500 mt-0.5" />
                  <span>15 goals completed this week</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Users size={14} className="text-blue-500 mt-0.5" />
                  <span>3 new users this month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9"
              />
            </div>
            <button className="btn-primary flex items-center gap-2">
              <UserPlus size={16} /> Add User
            </button>
          </div>

          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--muted)]">
                <tr>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Department</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Goals</th>
                  <th className="text-left p-4">Progress</th>
                  <th className="text-left p-4">Last Active</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-t border-[var(--border)] hover:bg-[var(--muted)]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{user.department}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">{user.completed}/{user.goals}</td>
                    <td className="p-4">
                      <div className="w-24">
                        <div className="w-full bg-[var(--muted)] rounded-full h-1.5 mb-1">
                          <div
                            className={`h-1.5 rounded-full ${user.completed / user.goals >= 0.7 ? 'bg-green-500' : user.completed / user.goals >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${(user.completed / user.goals) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)]">{Math.round((user.completed / user.goals) * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--muted-foreground)]">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="input text-sm py-1"
                      >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-[var(--muted)] rounded" title="Edit"><Edit size={14} /></button>
                        <button className="p-1.5 hover:bg-[var(--muted)] rounded text-red-500" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-[var(--muted-foreground)]">{allDepartments.length} departments</div>
            <button className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Department</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allDepartments.map(dept => (
              <div key={dept.id} className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] hover:border-primary-500/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-lg">{dept.name}</div>
                  <span className="text-xs bg-primary-500/20 text-primary-500 px-2 py-1 rounded-full">{dept.employees} employees</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Department Head</span>
                    <span className="font-medium">{dept.headName}</span>
                  </div>
                  <div className="p-3 bg-[var(--muted)] rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[var(--muted-foreground)]">Goals Progress</span>
                      <span className="text-sm font-medium">{Math.round((dept.completedGoals / dept.goals) * 100)}%</span>
                    </div>
                    <div className="w-full bg-[var(--border)] rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(dept.completedGoals / dept.goals) * 100}%` }} />
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">{dept.completedGoals} of {dept.goals} goals completed</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-sm bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] flex items-center justify-center gap-1"><Edit size={14} /> Edit</button>
                    <button className="flex-1 py-2 text-sm bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] flex items-center justify-center gap-1"><Users size={14} /> View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cycles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-[var(--muted-foreground)]">{cycles.length} cycles</div>
            <button className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Cycle</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cycles.map(cycle => (
              <div key={cycle.id} className={`bg-[var(--card)] rounded-xl p-6 border ${cycle.status === 'ACTIVE' ? 'border-green-500/50' : cycle.status === 'PLANNING' ? 'border-yellow-500/50' : 'border-[var(--border)]'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{cycle.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${cycle.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : cycle.status === 'PLANNING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-500'}`}>
                      {cycle.status}
                    </span>
                  </div>
                  <select
                    value={cycle.status}
                    onChange={(e) => handleCycleStatusChange(cycle.id, e.target.value)}
                    className="input w-auto text-sm"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)] mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[var(--muted)] rounded-lg">
                    <div className="text-2xl font-bold">{cycle.goalsCount}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Total Goals</div>
                  </div>
                  <div className="p-3 bg-[var(--muted)] rounded-lg">
                    <div className="text-2xl font-bold">{cycle.completionRate}%</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Completion</div>
                  </div>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-2 mt-4">
                  <div
                    className={`h-2 rounded-full ${cycle.completionRate >= 70 ? 'bg-green-500' : cycle.completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${cycle.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Settings className="text-primary-500" size={20} /> System Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input type="text" defaultValue={settings.system.companyName} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <select defaultValue={settings.system.timezone} className="input">
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Format</label>
                  <select defaultValue={settings.system.dateFormat} className="input">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select defaultValue={settings.system.language} className="input">
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
                <div className="p-4 bg-[var(--muted)] rounded-lg">
                  <div className="text-sm font-medium mb-2">System Version</div>
                  <div className="text-lg font-bold">AtomQuest v2.0.0</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Last updated: May 2026</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Target className="text-purple-500" size={20} /> Goal Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Default Cycle Length (days)</label>
                  <input type="number" defaultValue={settings.goals.defaultCycleLength} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Goals Per Employee</label>
                  <input type="number" defaultValue={settings.goals.minGoalsPerEmployee} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Goals Per Employee</label>
                  <input type="number" defaultValue={settings.goals.maxGoalsPerEmployee} className="input" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                  <div>
                    <div className="font-medium">Manager Approval Required</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Goals need manager approval</div>
                  </div>
                  <input type="checkbox" defaultChecked={settings.goals.requireManagerApproval} className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                  <div>
                    <div className="font-medium">Auto-close Completed Goals</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Automatically close 100% goals</div>
                  </div>
                  <input type="checkbox" defaultChecked={settings.goals.autoCloseCompleted} className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="text-blue-500" size={20} /> Notification Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive email notifications' },
                { key: 'checkInReminders', label: 'Check-in Reminders', desc: 'Daily reminder for check-ins' },
                { key: 'goalDeadlineAlerts', label: 'Goal Deadline Alerts', desc: 'Alerts before goal deadlines' },
                { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly progress summary' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{desc}</div>
                  </div>
                  <input type="checkbox" defaultChecked={settings.notifications[key as keyof typeof settings.notifications]} className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="text-green-500" size={20} /> Security Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
                  <input type="number" defaultValue={settings.security.sessionTimeout} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password Expiry (days)</label>
                  <input type="number" defaultValue={settings.security.passwordExpiry} className="input" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                  <div>
                    <div className="font-medium">Two-Factor Auth Required</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Enforce 2FA for all users</div>
                  </div>
                  <input type="checkbox" defaultChecked={settings.security.twoFactorRequired} className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                  <div>
                    <div className="font-medium">IP Whitelist</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Restrict access by IP</div>
                  </div>
                  <input type="checkbox" defaultChecked={settings.security.ipWhitelist} className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary">Save Settings</button>
          </div>
        </div>
      )}
    </div>
  );
}
