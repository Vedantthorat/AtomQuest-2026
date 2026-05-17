// FILE: src/components/DemoLoginCards.tsx

import { useNavigate } from 'react-router-dom';
import { User, Shield, Crown, ArrowRight } from 'lucide-react';

interface DemoLoginCardsProps {
  onLogin?: (email: string, password: string) => void;
}

const demoUsers = [
  {
    role: 'Employee',
    name: 'Priya Sharma',
    department: 'Sales Department',
    email: 'priya@atomberg.com',
    password: 'Emp@123',
    icon: User,
    color: 'bg-blue-500',
    description: 'Create goals, submit check-ins, view progress',
  },
  {
    role: 'Manager',
    name: 'Vikram Nair',
    department: 'Engineering Manager',
    email: 'vikram@atomberg.com',
    password: 'Mgr@123',
    icon: Shield,
    color: 'bg-purple-500',
    description: 'Approve goals, view team, manage escalations',
  },
  {
    role: 'Admin',
    name: 'HR Admin',
    department: 'Admin Panel',
    email: 'admin@atomberg.com',
    password: 'Admin@123',
    icon: Crown,
    color: 'bg-amber-500',
    description: 'Full access, audit trail, system config',
  },
];

export default function DemoLoginCards({ onLogin }: DemoLoginCardsProps) {
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    if (onLogin) {
      onLogin(email, password);
    } else {
      // Default login logic - store in localStorage
      const user = demoUsers.find(u => u.email === email);
      if (user) {
        localStorage.setItem('atomtrack_user', JSON.stringify({
          id: user.email === 'priya@atomberg.com' ? 'u3' :
              user.email === 'vikram@atomberg.com' ? 'u5' : 'u1',
          email: user.email,
          name: user.name,
          role: user.role === 'Employee' ? 'EMPLOYEE' : 
                user.role === 'Manager' ? 'MANAGER' : 'ADMIN',
          department: user.department,
        }));
        navigate('/');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Quick Login with Demo Accounts</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Click any card to instantly log in as that user
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demoUsers.map((user) => (
          <button
            key={user.role}
            onClick={() => handleLogin(user.email, user.password)}
            className="group relative bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 text-left hover:border-primary-500/50 transition-all duration-200 hover:shadow-lg"
          >
            {/* Icon */}
            <div className={`w-12 h-12 ${user.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <user.icon className="text-white" size={24} />
            </div>

            {/* Info */}
            <h4 className="font-semibold text-lg mb-1">{user.name}</h4>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">{user.department}</p>

            {/* Credentials */}
            <div className="text-xs text-[var(--muted-foreground)] space-y-1 mb-4">
              <div className="flex items-center gap-1">
                <span className="font-medium">{user.email}</span>
              </div>
            </div>

            {/* Role Badge */}
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.color} text-white`}>
              {user.role}
            </div>

            {/* Hover Arrow */}
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="text-primary-500" size={20} />
            </div>
          </button>
        ))}
      </div>

      {/* Credentials Reference */}
      <div className="bg-[var(--muted)] rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">Demo Credentials Reference</h4>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[var(--muted-foreground)]">Employee:</span>
            <div className="font-mono">Emp@123</div>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Manager:</span>
            <div className="font-mono">Mgr@123</div>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Admin:</span>
            <div className="font-mono">Admin@123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DemoLoginCards };