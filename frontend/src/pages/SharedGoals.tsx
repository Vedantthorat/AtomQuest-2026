import React from 'react';
import { Link, Target } from 'lucide-react';

const sampleSharedGoals = [
  { id: 'sg1', title: 'Q2 Revenue Target', description: 'Increase quarterly revenue by 25% through targeted campaigns and client acquisition', department: 'Sales', currentValue: 1875000, targetValue: 2500000, unit: 'USD', weightage: 40 },
  { id: 'sg2', title: 'Customer Satisfaction Score', description: 'Achieve 95% customer satisfaction rating across all touchpoints', department: 'Operations', currentValue: 91, targetValue: 95, unit: '%', weightage: 25 },
  { id: 'sg3', title: 'Product Launch Readiness', description: 'Complete development and testing for v2.0 release', department: 'Engineering', currentValue: 75, targetValue: 100, unit: '%', weightage: 35 },
  { id: 'sg4', title: 'Employee Retention Rate', description: 'Maintain 95% employee retention rate through engagement initiatives', department: 'HR', currentValue: 92, targetValue: 95, unit: '%', weightage: 30 },
  { id: 'sg5', title: 'Market Share Growth', description: 'Increase market share by 15% in target segments', department: 'Marketing', currentValue: 8, targetValue: 15, unit: '%', weightage: 35 },
  { id: 'sg6', title: 'Reduce Operational Costs', description: 'Achieve 20% reduction in operational expenses through process automation', department: 'Finance', currentValue: 14, targetValue: 20, unit: '%', weightage: 45 },
  { id: 'sg7', title: 'Digital Transformation Initiative', description: 'Migrate 80% of legacy systems to cloud infrastructure', department: 'Engineering', currentValue: 52, targetValue: 80, unit: '%', weightage: 50 },
  { id: 'sg8', title: 'Carbon Neutral Goal', description: 'Achieve carbon neutrality across all manufacturing facilities', department: 'Operations', currentValue: 45, targetValue: 100, unit: '%', weightage: 40 },
  { id: 'sg9', title: 'Brand Awareness Score', description: 'Increase brand awareness score from 65 to 85 in key markets', department: 'Marketing', currentValue: 72, targetValue: 85, unit: 'score', weightage: 35 },
  { id: 'sg10', title: 'Innovation Pipeline', description: 'Deliver 10 new product innovations to market', department: 'R&D', currentValue: 6, targetValue: 10, unit: 'products', weightage: 40 },
];

export default function SharedGoals() {
  const [sharedGoals, setSharedGoals] = React.useState(sampleSharedGoals);

  React.useEffect(() => {
    fetch('/api/shared-goals')
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setSharedGoals(data); })
      .catch(() => {
        setSharedGoals(sampleSharedGoals);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Shared Goals (KPIs)</h1>
        <p className="text-[var(--muted-foreground)]">Cross-functional team goals and KPIs</p>
      </div>

      <div className="grid gap-4">
        {sharedGoals.map((sg: any) => (
          <div key={sg.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Link size={16} className="text-purple" />
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">{sg.title}</h3>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{sg.description}</p>
              </div>
              <span className="text-sm bg-purple/10 text-purple px-3 py-1 rounded-full">{sg.department}</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[var(--muted-foreground)]">Progress</span>
                <span className="font-medium">
                  {((sg.currentValue / sg.targetValue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple rounded-full"
                  style={{ width: `${Math.min((sg.currentValue / sg.targetValue) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
              <span>Target: {sg.targetValue.toLocaleString()} {sg.unit}</span>
              <span>Weightage: {sg.weightage}%</span>
            </div>
          </div>
        ))}
        {sharedGoals.length === 0 && (
          <div className="empty-state">
            <Target size={48} className="mb-4" />
            <p>No shared goals defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
