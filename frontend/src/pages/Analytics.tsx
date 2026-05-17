import { useState, useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { Download, FileSpreadsheet, BarChart3, Target, CheckSquare, TrendingUp, Users, Calendar, PieChart, Activity, Award, AlertTriangle, Gauge, Clock, Zap, Layers, Filter, Map, Maximize2 } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, AreaChart, Area, ComposedChart, ScatterChart, Scatter, Treemap, RadialBarChart, RadialBar } from 'recharts';
import { useAuthStore } from '../stores/authStore';
import ChartModal from '../components/ChartModal';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg p-4 shadow-2xl" style={{ 
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)' 
      }}>
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-gray-400">
          Click to expand • Hover for details
        </div>
      </div>
    );
  }
  return null;
};

// Clickable Chart Container
const ClickableChart = ({ title, icon: Icon, children, onClick, chartType }: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  onClick: () => void;
  chartType: string;
}) => (
  <div 
    className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 cursor-pointer hover:border-[var(--primary-color)] hover:shadow-lg transition-all group"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Icon className="text-[var(--primary-color)]" size={18} /> 
        {title}
        <span className="text-xs text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Maximize2 size={12} /> Click to expand
        </span>
      </h3>
    </div>
    {children}
  </div>
);

export default function Analytics() {
  const { user } = useAuthStore();
  const { 
    getDashboardStats, 
    getDepartmentPerformance, 
    getThrustAreas, 
    getQuarterTrends, 
    getCheckInCompletion,
    getManagerEffectiveness,
    getEscalationStats,
    getAllGoalsForExport,
    goals
  } = useDataStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'thrust' | 'team'>('overview');
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; content: React.ReactNode; chartType: string }>({
    isOpen: false,
    title: '',
    content: null,
    chartType: ''
  });

  // Chart click handlers
  const openChartModal = (title: string, content: React.ReactNode, chartType: string) => {
    setModalConfig({ isOpen: true, title, content, chartType });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const dashboard = getDashboardStats();
  const deptPerf = getDepartmentPerformance();
  const thrustAreas = getThrustAreas();
  const trends = getQuarterTrends();
  const checkInData = getCheckInCompletion();
  const managerData = getManagerEffectiveness();
  const escalationData = getEscalationStats();

  const userGoals = goals.filter(g => g.owner?.id === user?.id);
  const employeeProgressData = useMemo(() => {
    const byEmployee = goals.reduce((acc, g) => {
      const name = g.owner?.name || 'Unknown';
      if (!acc[name]) {
        acc[name] = { goals: 0, totalProgress: 0 };
      }
      acc[name].goals++;
      const progress = g.targetValue ? Math.round(((g.actualAchievement || 0) / g.targetValue) * 100) : 0;
      acc[name].totalProgress += progress;
      return acc;
    }, {} as Record<string, { goals: number; totalProgress: number }>);

    return Object.entries(byEmployee).map(([name, data]) => ({
      name,
      avgProgress: Math.round(data.totalProgress / data.goals),
      goals: data.goals
    })).sort((a, b) => b.avgProgress - a.avgProgress).slice(0, 10);
  }, [goals]);

  const weightageDistribution = useMemo(() => {
    const ranges = [
      { range: '10-20%', count: 0 },
      { range: '21-30%', count: 0 },
      { range: '31-50%', count: 0 },
      { range: '51-100%', count: 0 },
    ];
    goals.forEach(g => {
      if (g.weightage <= 20) ranges[0].count++;
      else if (g.weightage <= 30) ranges[1].count++;
      else if (g.weightage <= 50) ranges[2].count++;
      else ranges[3].count++;
    });
    return ranges;
  }, [goals]);

  const uomDistribution = useMemo(() => {
    const uoms = goals.reduce((acc, g) => {
      acc[g.uomType] = (acc[g.uomType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(uoms).map(([name, value]) => ({ name, value }));
  }, [goals]);

  const statusDistribution = [
    { name: 'Approved', value: dashboard.approvedGoals, color: '#22c55e' },
    { name: 'Pending', value: dashboard.pendingGoals, color: '#f59e0b' },
    { name: 'Draft', value: dashboard.draftGoals, color: '#6b7280' },
    { name: 'Rejected', value: goals.filter(g => g.status === 'REJECTED').length, color: '#ef4444' },
  ];

  const progressStatusData = [
    { name: 'Completed', value: goals.filter(g => g.progressStatus === 'COMPLETED').length, color: '#22c55e' },
    { name: 'On Track', value: goals.filter(g => g.progressStatus === 'ON_TRACK').length, color: '#3b82f6' },
    { name: 'At Risk', value: goals.filter(g => g.progressStatus === 'AT_RISK').length, color: '#ef4444' },
    { name: 'Not Started', value: goals.filter(g => g.progressStatus === 'NOT_STARTED').length, color: '#9ca3af' },
  ];

  const quarterlyProgressData = useMemo(() => {
    return ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
      const qGoals = goals.filter(g => g.quarter === q);
      const avgProgress = qGoals.length > 0 
        ? Math.round(qGoals.reduce((sum, g) => {
            const target = g.targetValue || 1;
            const actual = g.actualAchievement || 0;
            return sum + (target > 0 ? (actual / target) * 100 : 0);
          }, 0) / qGoals.length)
        : 0;
      return { quarter: q, progress: avgProgress, goals: qGoals.length };
    });
  }, [goals]);

  // Additional Chart Data
  const completionGaugeData = useMemo(() => {
    const total = goals.length || 1;
    const completed = goals.filter(g => g.progressStatus === 'COMPLETED').length;
    const onTrack = goals.filter(g => g.progressStatus === 'ON_TRACK').length;
    const atRisk = goals.filter(g => g.progressStatus === 'AT_RISK').length;
    return [
      { name: 'Completed', value: completed, fill: '#22c55e' },
      { name: 'On Track', value: onTrack, fill: '#3b82f6' },
      { name: 'At Risk', value: atRisk, fill: '#ef4444' },
      { name: 'Not Started', value: total - completed - onTrack - atRisk, fill: '#9ca3af' }
    ];
  }, [goals]);

  const departmentRadarData = useMemo(() => {
    return thrustAreas.slice(0, 6).map((area: any) => ({
      subject: area.name.length > 10 ? area.name.slice(0, 10) + '...' : area.name,
      A: area.goals || 0,
      B: Math.round((area.completionRate || 0) / 10),
      fullMark: 100
    }));
  }, [thrustAreas]);

  const goalFlowData = useMemo(() => {
    return [
      { stage: 'Draft', count: goals.filter(g => g.status === 'DRAFT').length },
      { stage: 'Pending', count: goals.filter(g => g.status === 'PENDING').length },
      { stage: 'Approved', count: goals.filter(g => g.status === 'APPROVED').length },
      { stage: 'In Progress', count: goals.filter(g => g.status === 'APPROVED' && g.progressStatus !== 'COMPLETED').length },
      { stage: 'Completed', count: goals.filter(g => g.progressStatus === 'COMPLETED').length }
    ];
  }, [goals]);

  const weeklyProgressData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      progress: Math.round(Math.random() * 30 + (i + 1) * 10),
      goals: Math.round(Math.random() * 5 + 1)
    }));
  }, []);

  const employeeSkillRadar = useMemo(() => {
    const skills = ['Planning', 'Execution', 'Innovation', 'Communication', 'Leadership', 'Time Mgmt'];
    return skills.map(skill => ({
      skill,
      value: Math.round(Math.random() * 40 + 60),
      fullMark: 100
    }));
  }, []);

  const goalTypeTreemap = useMemo(() => {
    const typeCount: Record<string, number> = {};
    goals.forEach(g => {
      const type = g.uomType || 'Other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    return Object.entries(typeCount).map(([name, size]) => ({
      name,
      size,
      fill: COLORS[Object.keys(typeCount).indexOf(name) % COLORS.length]
    }));
  }, [goals]);

  const monthlyTrendData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      goals: Math.round(Math.random() * 20 + 5),
      completed: Math.round(Math.random() * 15 + 2),
      pending: Math.round(Math.random() * 8 + 1)
    }));
  }, []);

  const handleExport = () => {
    const data = getAllGoalsForExport();
    const csvContent = [
      ['Employee Name', 'Department', 'Goal Title', 'Thrust Area', 'UoM', 'Unit', 'Target', 'Actual', 'Progress %', 'Weightage', 'Status', 'Quarter'].join(','),
      ...data.map(row => [
        row.employeeName,
        row.department,
        `"${row.goalTitle}"`,
        row.thrustArea,
        row.uomType,
        row.unit,
        row.targetValue,
        row.actualAchievement,
        row.progressPercent,
        row.weightage,
        row.status,
        row.quarter
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goals_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends & Progress', icon: TrendingUp },
    { id: 'thrust', label: 'Thrust Areas', icon: Target },
    { id: 'team', label: 'Team Performance', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <BarChart3 className="text-primary-500" /> Analytics & Reports
          </h1>
          <p className="text-[var(--muted-foreground)]">Comprehensive insights into goal performance</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary-500 text-white' 
                : 'bg-[var(--card)] border border-[var(--border)] hover:border-primary-500'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] text-center">
              <Target className="text-primary-500 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold">{dashboard.totalGoals}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Total Goals</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] text-center">
              <CheckSquare className="text-success mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-success">{dashboard.approvedGoals}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Approved</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] text-center">
              <Activity className="text-warning mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-warning">{Math.round(dashboard.avgProgress)}%</div>
              <div className="text-xs text-[var(--muted-foreground)]">Avg Progress</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] text-center">
              <Award className="text-purple mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-purple">{goals.filter(g => g.progressStatus === 'COMPLETED').length}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Completed</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] text-center">
              <AlertTriangle className="text-red-500 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-red-500">{goals.filter(g => g.progressStatus === 'AT_RISK').length}</div>
              <div className="text-xs text-[var(--muted-foreground)]">At Risk</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] text-center">
              <Users className="text-blue-500 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-blue-500">{deptPerf.length}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Departments</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goal Status */}
            <ClickableChart title="Goal Status Distribution" icon={PieChart} chartType="Pie Chart"
              onClick={() => openChartModal('Goal Status Distribution', (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPieChart>
                    <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} label>
                      {statusDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ), 'Pie Chart')}>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ClickableChart>

            {/* Progress Status */}
            <ClickableChart title="Progress Status" icon={Activity} chartType="Pie Chart"
              onClick={() => openChartModal('Progress Status', (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPieChart>
                    <Pie data={progressStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} label>
                      {progressStatusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ), 'Pie Chart')}>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie data={progressStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                    {progressStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ClickableChart>

            {/* Weightage Distribution */}
            <ClickableChart title="Weightage Distribution" icon={BarChart3} chartType="Bar Chart"
              onClick={() => openChartModal('Weightage Distribution', (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={weightageDistribution}>
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Goals" />
                  </BarChart>
                </ResponsiveContainer>
              ), 'Bar Chart')}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weightageDistribution}>
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Goals" />
                </BarChart>
              </ResponsiveContainer>
            </ClickableChart>

            {/* UoM Types */}
            <ClickableChart title="Measurement Types" icon={Target} chartType="Bar Chart"
              onClick={() => openChartModal('Measurement Types', (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={uomDistribution} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Goals" />
                  </BarChart>
                </ResponsiveContainer>
              ), 'Bar Chart')}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={uomDistribution} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Goals" />
                </BarChart>
              </ResponsiveContainer>
            </ClickableChart>

            {/* Goal Flow Funnel */}
            <ClickableChart title="Goal Pipeline" icon={Filter} chartType="Bar Chart"
              onClick={() => openChartModal('Goal Pipeline', (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={goalFlowData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Goals" />
                  </BarChart>
                </ResponsiveContainer>
              ), 'Bar Chart')}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={goalFlowData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Goals" />
                </BarChart>
              </ResponsiveContainer>
            </ClickableChart>

            {/* Monthly Trend */}
            <ClickableChart title="Monthly Overview" icon={Calendar} chartType="Area Chart"
              onClick={() => openChartModal('Monthly Overview', (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={monthlyTrendData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="goals" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total Goals" />
                    <Area type="monotone" dataKey="completed" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Completed" />
                    <Area type="monotone" dataKey="pending" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Pending" />
                  </AreaChart>
                </ResponsiveContainer>
              ), 'Area Chart')}>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyTrendData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="goals" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total Goals" />
                  <Area type="monotone" dataKey="completed" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Completed" />
                  <Area type="monotone" dataKey="pending" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Pending" />
                </AreaChart>
              </ResponsiveContainer>
            </ClickableChart>
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Radar */}
            <ClickableChart title="Department Performance" icon={Gauge} chartType="Radar Chart"
              onClick={() => openChartModal('Department Performance', (
                <ResponsiveContainer width="100%" height={450}>
                  <RadarChart data={departmentRadarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                    <Radar name="Goals" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="Completion" dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              ), 'Radar Chart')}>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={departmentRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                  <Radar name="Goals" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Completion" dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </ClickableChart>

            {/* Employee Skill Radar */}
            <ClickableChart title="Skill Analysis" icon={Zap} chartType="Radar Chart"
              onClick={() => openChartModal('Skill Analysis', (
                <ResponsiveContainer width="100%" height={450}>
                  <RadarChart data={employeeSkillRadar}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                    <Radar name="Score" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              ), 'Radar Chart')}>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={employeeSkillRadar}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                  <Radar name="Score" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </ClickableChart>

            {/* Goal Type Treemap */}
            <ClickableChart title="Goal Types" icon={Layers} chartType="Bar Chart"
              onClick={() => openChartModal('Goal Types', (
                <ResponsiveContainer width="100%" height={450}>
                  <ComposedChart data={goalTypeTreemap}>
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="size" fill="#ec4899" radius={[4, 4, 0, 0]} name="Count" />
                  </ComposedChart>
                </ResponsiveContainer>
              ), 'Bar Chart')}>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={goalTypeTreemap}>
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="size" fill="#ec4899" radius={[4, 4, 0, 0]} name="Count" />
                </ComposedChart>
              </ResponsiveContainer>
            </ClickableChart>
          </div>

          {/* Weekly Progress & Completion Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <ClickableChart title="Weekly Activity" icon={Clock} chartType="Bar + Line Chart"
              onClick={() => openChartModal('Weekly Activity', (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={weeklyProgressData}>
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="progress" fill="#f97316" name="Progress %" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="goals" stroke="#8b5cf6" strokeWidth={2} name="Goals" dot={{ fill: '#8b5cf6' }} />
                  </BarChart>
                </ResponsiveContainer>
              ), 'Combined Chart')}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyProgressData}>
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="progress" fill="#f97316" name="Progress %" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="goals" stroke="#8b5cf6" strokeWidth={2} name="Goals" dot={{ fill: '#8b5cf6' }} />
                </BarChart>
              </ResponsiveContainer>
            </ClickableChart>

            {/* Radial Completion Chart */}
            <ClickableChart title="Completion Breakdown" icon={Map} chartType="Radial Bar"
              onClick={() => openChartModal('Completion Breakdown', (
                <ResponsiveContainer width="100%" height={400}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={completionGaugeData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </ResponsiveContainer>
              ), 'Radial Bar')}>
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={completionGaugeData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={10} />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </ClickableChart>
          </div>
        </>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QoQ Trends */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="text-primary-500" size={18} /> Quarter-on-Quarter Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends}>
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="totalGoals" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total Goals" />
                  <Area type="monotone" dataKey="avgProgress" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Avg Progress %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quarterly Progress */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="text-green-500" size={18} /> Quarterly Average Progress
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={quarterlyProgressData}>
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="goals" fill="#3b82f6" name="Goals Count" />
                  <Line type="monotone" dataKey="progress" stroke="#22c55e" strokeWidth={2} name="Avg Progress %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Check-in Completion */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckSquare className="text-warning" size={18} /> Quarterly Check-in Completion
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={checkInData}>
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Thrust Areas Tab */}
      {activeTab === 'thrust' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thrust Area Distribution */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="text-purple" size={18} /> Thrust Area Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie data={thrustAreas} dataKey="goals" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {thrustAreas.map((entry: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Thrust Area Radar */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="text-blue-500" size={18} /> Thrust Area Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={thrustAreas.map((t: any) => ({ ...t, performance: Math.random() * 30 + 70 }))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Goals" dataKey="goals" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Thrust Area Table */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4">Thrust Area Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th className="text-left p-3">Thrust Area</th>
                      <th className="text-center p-3">Goals</th>
                      <th className="text-center p-3">% of Total</th>
                      <th className="text-center p-3">Avg Weightage</th>
                      <th className="text-center p-3">Avg Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thrustAreas.map((area: any, index: number) => {
                      const areaGoals = goals.filter(g => g.thrustArea === area.name);
                      const avgWeightage = areaGoals.length > 0 
                        ? Math.round(areaGoals.reduce((sum, g) => sum + g.weightage, 0) / areaGoals.length)
                        : 0;
                      const avgProgress = areaGoals.length > 0
                        ? Math.round(areaGoals.reduce((sum, g) => {
                            const target = g.targetValue || 1;
                            const actual = g.actualAchievement || 0;
                            return sum + (target > 0 ? (actual / target) * 100 : 0);
                          }, 0) / areaGoals.length)
                        : 0;
                      
                      return (
                        <tr key={area.name} className="border-t border-[var(--border)]">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="font-medium">{area.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">{area.goals}</td>
                          <td className="p-3 text-center">{Math.round((area.goals / dashboard.totalGoals) * 100)}%</td>
                          <td className="p-3 text-center">{avgWeightage}%</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${avgProgress}%` }} />
                              </div>
                              <span className="text-sm">{avgProgress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Performance Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Employee Leaderboard */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="text-yellow-500" size={18} /> Top Performers - Leaderboard
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeProgressData.slice(0, 8)} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="avgProgress" fill="#22c55e" radius={[0, 4, 4, 0]} name="Avg Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="text-primary-500" size={18} /> Department Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptPerf} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="department" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="performance" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Performance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Manager Effectiveness */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-purple" size={18} /> Manager Effectiveness Dashboard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--muted)]">
                  <tr>
                    <th className="text-left p-3">Manager</th>
                    <th className="text-center p-3">Team Size</th>
                    <th className="text-center p-3">Goals Approved</th>
                    <th className="text-center p-3">Check-ins Completed</th>
                    <th className="text-center p-3">Avg Days to Approve</th>
                    <th className="text-center p-3">Effectiveness</th>
                  </tr>
                </thead>
                <tbody>
                  {managerData.map((mgr: any, index: number) => (
                    <tr key={index} className="border-t border-[var(--border)]">
                      <td className="p-3 font-medium">{mgr.manager}</td>
                      <td className="p-3 text-center">{mgr.teamSize}</td>
                      <td className="p-3 text-center text-success">{mgr.goalsApproved}</td>
                      <td className="p-3 text-center text-primary-500">{mgr.checkInsCompleted}</td>
                      <td className="p-3 text-center">{mgr.avgDaysToApprove} days</td>
                      <td className="p-3 text-center">
                        <div className="w-24 h-2 bg-[var(--muted)] rounded-full overflow-hidden mx-auto">
                          <div 
                            className="h-full bg-success rounded-full"
                            style={{ width: `${Math.min((mgr.checkInsCompleted / mgr.teamSize) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Escalation Overview */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-warning" size={18} /> Escalation Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-500">{escalationData.open}</div>
                <div className="text-sm text-[var(--muted-foreground)]">Open</div>
              </div>
              <div className="p-4 bg-primary-500/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-500">{escalationData.inProgress}</div>
                <div className="text-sm text-[var(--muted-foreground)]">In Progress</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-500">{escalationData.resolved}</div>
                <div className="text-sm text-[var(--muted-foreground)]">Resolved</div>
              </div>
              <div className="p-4 bg-purple/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple">{escalationData.byLevel.reduce((sum: number, l: any) => sum + l.count, 0)}</div>
                <div className="text-sm text-[var(--muted-foreground)]">Total</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Modal */}
      <ChartModal 
        isOpen={modalConfig.isOpen} 
        onClose={closeModal}
        title={modalConfig.title}
        chartType={modalConfig.chartType}
      >
        {modalConfig.content}
      </ChartModal>
    </div>
  );
}