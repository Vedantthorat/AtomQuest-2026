import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import Escalations from './pages/Escalations';
import AuditTrail from './pages/AuditTrail';
import AdminPanel from './pages/AdminPanel';
import SharedGoals from './pages/SharedGoals';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';
import TeamChat from './pages/TeamChat';
import Badges from './pages/Badges';
import Automation from './pages/Automation';
import Layout from './components/layout/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
<Route path="/" element={<Dashboard />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/escalations" element={<Escalations />} />
                <Route path="/audit" element={<AuditTrail />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/shared-goals" element={<SharedGoals />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/chat" element={<TeamChat />} />
                <Route path="/badges" element={<Badges />} />
                <Route path="/automation" element={<Automation />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;