import { useState, useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { Download, FileSpreadsheet, Printer, Calendar, Filter, Users, Target, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import type { Goal, Quarter, GoalProgressStatus } from '../types';

export default function Reports() {
  const { user } = useAuthStore();
  const { goals } = useDataStore();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q1');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const departments = [...new Set(goals.map(g => g.owner?.department).filter(Boolean))];

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      if (selectedDepartment !== 'all' && goal.owner?.department !== selectedDepartment) return false;
      if (selectedQuarter && goal.quarter !== selectedQuarter) return false;
      if (selectedStatus !== 'all' && goal.status !== selectedStatus) return false;
      return true;
    });
  }, [goals, selectedDepartment, selectedQuarter, selectedStatus]);

  const summaryStats = useMemo(() => {
    const total = filteredGoals.length;
    const approved = filteredGoals.filter(g => g.status === 'APPROVED').length;
    const pending = filteredGoals.filter(g => g.status === 'PENDING').length;
    const draft = filteredGoals.filter(g => g.status === 'DRAFT').length;
    const completed = filteredGoals.filter(g => g.progressStatus === 'COMPLETED').length;
    const atRisk = filteredGoals.filter(g => g.progressStatus === 'AT_RISK').length;
    
    const avgProgress = total > 0 
      ? Math.round(filteredGoals.reduce((sum, g) => {
          const target = g.targetValue || 1;
          const actual = g.actualAchievement || 0;
          return sum + (target > 0 ? (actual / target) * 100 : 0);
        }, 0) / total)
      : 0;

    const avgWeightage = total > 0
      ? Math.round(filteredGoals.reduce((sum, g) => sum + g.weightage, 0) / total)
      : 0;

    return { total, approved, pending, draft, completed, atRisk, avgProgress, avgWeightage };
  }, [filteredGoals]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return '✅ Approved';
      case 'PENDING': return '⏳ Pending';
      case 'DRAFT': return '📝 Draft';
      case 'REJECTED': return '❌ Rejected';
      case 'RETURNED': return '🔙 Returned';
      default: return status;
    }
  };

  const getProgressBadge = (status: GoalProgressStatus) => {
    switch (status) {
      case 'COMPLETED': return '✅ Completed';
      case 'ON_TRACK': return '🟢 On Track';
      case 'AT_RISK': return '🔴 At Risk';
      case 'NOT_STARTED': return '⚪ Not Started';
      default: return status;
    }
  };

  const handleExport = () => {
    const reportData = filteredGoals.map(goal => ({
      'Employee Name': goal.owner?.name || 'Unknown',
      'Employee Email': goal.owner?.email || '',
      'Department': goal.owner?.department || 'Unknown',
      'Goal Title': goal.title,
      'Goal Description': goal.description?.substring(0, 100) + (goal.description?.length > 100 ? '...' : ''),
      'Thrust Area': goal.thrustArea,
      'Weightage (%)': goal.weightage,
      'Unit of Measurement': goal.uomType,
      'Measurement Unit': goal.unit,
      'Planned Target': goal.targetValue,
      'Actual Achievement': goal.actualAchievement || 0,
      'Progress (%)': Math.round(((goal.actualAchievement || 0) / (goal.targetValue || 1)) * 100),
      'Goal Status': getStatusBadge(goal.status),
      'Progress Status': getProgressBadge(goal.progressStatus),
      'Priority': goal.priority,
      'Quarter': goal.quarter,
      'Year': goal.year,
      'Created Date': new Date(goal.createdAt).toLocaleDateString(),
      'Last Updated': new Date(goal.updatedAt).toLocaleDateString(),
      'Approved By': goal.approvedByUser?.name || '-',
      'Approved Date': goal.approvedAt ? new Date(goal.approvedAt).toLocaleDateString() : '-',
      'Is Locked': goal.lockedAt ? 'Yes' : 'No',
      'Q1 Actual': goal.q1Actual || '-',
      'Q2 Actual': goal.q2Actual || '-',
      'Q3 Actual': goal.q3Actual || '-',
      'Q4 Actual': goal.q4Actual || '-',
    }));

    const headers = Object.keys(reportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => headers.map(h => {
        const value = row[h as keyof typeof row];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Goal_Report_${selectedQuarter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const reportData = filteredGoals.map(goal => ({
      'Employee Name': goal.owner?.name || 'Unknown',
      'Employee Email': goal.owner?.email || '',
      'Department': goal.owner?.department || 'Unknown',
      'Goal Title': goal.title,
      'Description': goal.description?.substring(0, 100),
      'Thrust Area': goal.thrustArea,
      'Weightage (%)': goal.weightage,
      'Target': goal.targetValue,
      'Actual': goal.actualAchievement || 0,
      'Progress (%)': Math.round(((goal.actualAchievement || 0) / (goal.targetValue || 1)) * 100),
      'Status': goal.status,
      'Priority': goal.priority,
      'Quarter': goal.quarter,
      'Year': goal.year,
      'Created': new Date(goal.createdAt).toLocaleDateString(),
      'Approved By': goal.approvedByUser?.name || '-',
    }));

    const worksheetData = [
      Object.keys(reportData[0] || {}),
      ...reportData.map(row => Object.values(row))
    ];

    let excelContent = worksheetData.map(row => row.join('\t')).join('\n');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Goal_Report_${selectedQuarter}_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const printContent = document.getElementById('report-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f5f5f5; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .summary-item { background: #f9f9f9; padding: 15px; border-radius: 5px; }
        h1 { color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      </style>
    `;

    let tableRows = '';
    filteredGoals.slice(0, 100).forEach(goal => {
      tableRows += `
        <tr>
          <td>${goal.owner?.name || 'Unknown'}</td>
          <td>${goal.title}</td>
          <td>${goal.thrustArea}</td>
          <td>${goal.weightage}%</td>
          <td>${goal.targetValue}</td>
          <td>${goal.actualAchievement || 0}</td>
          <td>${goal.status}</td>
          <td>${goal.quarter}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          ${styles}
          <title>AtomQuest Goal Report - ${selectedQuarter}</title>
        </head>
        <body>
          <div class="header">
            <h1>AtomQuest Goal Report</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary">
            <div class="summary-item"><strong>Total Goals:</strong> ${summaryStats.total}</div>
            <div class="summary-item"><strong>Approved:</strong> ${summaryStats.approved}</div>
            <div class="summary-item"><strong>Pending:</strong> ${summaryStats.pending}</div>
            <div class="summary-item"><strong>Completed:</strong> ${summaryStats.completed}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Goal Title</th>
                <th>Thrust Area</th>
                <th>Weightage</th>
                <th>Target</th>
                <th>Actual</th>
                <th>Status</th>
                <th>Quarter</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Achievement Reports</h1>
          <p className="text-[var(--muted-foreground)]">View and export goal achievement data</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={18} /> CSV
          </button>
          <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2">
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} />
            <span className="font-medium">Filters:</span>
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value as Quarter)}
            className="input w-auto"
          >
            <option value="Q1">Q1 2026</option>
            <option value="Q2">Q2 2026</option>
            <option value="Q3">Q3 2026</option>
            <option value="Q4">Q4 2026</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="DRAFT">Draft</option>
          </select>

          <div className="ml-auto text-sm text-[var(--muted-foreground)]">
            Showing {filteredGoals.length} of {goals.length} goals
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold">{summaryStats.total}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Total Goals</div>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold text-green-500">{summaryStats.approved}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Approved</div>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold text-yellow-500">{summaryStats.pending}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Pending</div>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold text-blue-500">{summaryStats.completed}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Completed</div>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold text-red-500">{summaryStats.atRisk}</div>
          <div className="text-xs text-[var(--muted-foreground)]">At Risk</div>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold">{summaryStats.avgProgress}%</div>
          <div className="text-xs text-[var(--muted-foreground)]">Avg Progress</div>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold">{summaryStats.avgWeightage}%</div>
          <div className="text-xs text-[var(--muted-foreground)]">Avg Weightage</div>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] text-center">
          <div className="text-2xl font-bold">{summaryStats.draft}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Draft</div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold">Goal Details</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="text-left p-3 whitespace-nowrap">Employee</th>
                <th className="text-left p-3">Goal</th>
                <th className="text-left p-3">Thrust Area</th>
                <th className="text-center p-3">Weight</th>
                <th className="text-center p-3">Target</th>
                <th className="text-center p-3">Actual</th>
                <th className="text-center p-3">Progress</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.map((goal) => {
                const progress = Math.round(((goal.actualAchievement || 0) / (goal.targetValue || 1)) * 100);
                return (
                  <tr key={goal.id} className="border-t border-[var(--border)] hover:bg-[var(--muted)]">
                    <td className="p-3">
                      <div className="font-medium">{goal.owner?.name || 'Unknown'}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{goal.owner?.department}</div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="truncate font-medium" title={goal.title}>{goal.title}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{goal.quarter}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs bg-purple/10 text-purple px-2 py-1 rounded">
                        {goal.thrustArea}
                      </span>
                    </td>
                    <td className="p-3 text-center">{goal.weightage}%</td>
                    <td className="p-3 text-center">{goal.targetValue} {goal.unit}</td>
                    <td className="p-3 text-center">{goal.actualAchievement || 0} {goal.unit}</td>
                    <td className="p-3 text-center">
                      <div className="w-20 h-2 bg-[var(--border)] rounded-full overflow-hidden mx-auto">
                        <div 
                          className={`h-full rounded-full ${
                            goal.progressStatus === 'COMPLETED' ? 'bg-green-500' :
                            goal.progressStatus === 'AT_RISK' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-center mt-1">{progress}%</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        goal.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        goal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        goal.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {goal.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        goal.progressStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        goal.progressStatus === 'ON_TRACK' ? 'bg-blue-100 text-blue-700' :
                        goal.progressStatus === 'AT_RISK' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {goal.progressStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredGoals.length === 0 && (
          <div className="p-8 text-center text-[var(--muted-foreground)]">
            No goals found matching your filters
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="font-semibold mb-2">📖 How to Use This Report</h3>
        <div className="text-sm text-[var(--muted-foreground)] space-y-2">
          <p>• <strong>Filters:</strong> Use the dropdowns above to filter by department, quarter, or status</p>
          <p>• <strong>Export:</strong> Click "Export CSV" to download the full report for Excel/Google Sheets</p>
          <p>• <strong>Print:</strong> Click "Print" to print or save as PDF</p>
          <p>• <strong>Progress:</strong> Shows actual achievement vs. planned target as percentage</p>
          <p>• <strong>Status:</strong> Goal approval status (Approved/Pending/Draft/Rejected)</p>
          <p>• <strong>Progress:</strong> Current tracking status (Completed/On Track/At Risk/Not Started)</p>
        </div>
      </div>
    </div>
  );
}