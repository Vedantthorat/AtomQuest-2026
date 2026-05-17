import { useQuery } from '@tanstack/react-query';
import { sharedGoalsApi } from '../services/api';
import { Link, Target } from 'lucide-react';

export default function SharedGoals() {
  const { data: sharedGoals } = useQuery({
    queryKey: ['shared-goals'],
    queryFn: () => sharedGoalsApi.getAll().then(r => r.data)
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Shared Goals (KPIs)</h1>
        <p className="text-[var(--muted-foreground)]">Cross-functional team goals and KPIs</p>
      </div>

      <div className="grid gap-4">
        {sharedGoals?.map((sg: any) => (
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

            {sg.goals && sg.goals.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <div className="text-sm font-medium mb-2">Linked Individual Goals</div>
                <div className="space-y-2">
                  {sg.goals.map((g: any) => (
                    <div key={g.id} className="flex items-center justify-between text-sm p-2 bg-[var(--muted)] rounded">
                      <span>{g.title}</span>
                      <span className={`badge ${g.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                        {g.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {(!sharedGoals || sharedGoals.length === 0) && (
          <div className="empty-state">
            <Target size={48} className="mb-4" />
            <p>No shared goals defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}