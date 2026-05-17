import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useDataStore } from '../../stores/dataStore';
import VoiceNotificationPanel from '../VoiceNotification';
import Chatbot from '../Chatbot';
import {
  Target,
  Home,
  BarChart3,
  AlertTriangle,
  ClipboardList,
  Settings,
  Users,
  Sparkles,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Link,
  User,
  Shield,
  UserCog,
  Briefcase,
  Calendar,
  MessageSquare,
  Trophy,
  Zap
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/', roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] },
  { icon: Target, label: 'My Goals', path: '/goals', roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] },
  { icon: Calendar, label: 'Calendar', path: '/calendar', roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] },
  { icon: Sparkles, label: 'AI Assistant', path: '/ai-assistant', roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] },
  { icon: Link, label: 'Shared Goals', path: '/shared-goals', roles: ['MANAGER', 'ADMIN'] },
  { icon: AlertTriangle, label: 'Escalations', path: '/escalations', roles: ['MANAGER', 'ADMIN'] },
  { icon: MessageSquare, label: 'Team Chat', path: '/chat', roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] },
  { icon: Trophy, label: 'Badges', path: '/badges', roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] },
  { icon: Zap, label: 'Automation', path: '/automation', roles: ['ADMIN'] },
  { icon: ClipboardList, label: 'Audit Trail', path: '/audit', roles: ['ADMIN'] },
  { icon: Users, label: 'Team', path: '/admin?tab=team', roles: ['MANAGER', 'ADMIN'] },
  { icon: Settings, label: 'Admin', path: '/admin', roles: ['ADMIN'] },
];

const roleLabels: Record<string, string> = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  ADMIN: 'Admin'
};

const roleConfig = {
  EMPLOYEE: { 
    color: 'emerald', 
    bg: 'bg-emerald-500', 
    gradient: 'from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: Briefcase 
  },
  MANAGER: { 
    color: 'blue', 
    bg: 'bg-blue-500', 
    gradient: 'from-blue-500 to-blue-600',
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: UserCog 
  },
  ADMIN: { 
    color: 'purple', 
    bg: 'bg-purple-500', 
    gradient: 'from-purple-500 to-purple-600',
    badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: Shield 
  }
};

const RoleIconComponent = ({ role, size = 20, className = '' }: { role: string; size?: number; className?: string }) => {
  switch (role) {
    case 'EMPLOYEE':
      return <Briefcase size={size} className={className} />;
    case 'MANAGER':
      return <UserCog size={size} className={className} />;
    case 'ADMIN':
      return <Shield size={size} className={className} />;
    default:
      return <Briefcase size={size} className={className} />;
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { notifications, markNotificationRead, markAllNotificationsRead } = useDataStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  const currentRole = user?.role || 'EMPLOYEE';
  const roleStyle = roleConfig[currentRole as keyof typeof roleConfig] || roleConfig.EMPLOYEE;
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentRole));
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Mobile sidebar toggle */}
      <button
        className={`lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border border-gray-100'
        }`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} className={isDark ? 'text-slate-300' : 'text-gray-600'} /> : <Menu size={20} className={isDark ? 'text-slate-300' : 'text-gray-600'} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-[280px] border-r z-40 transition-all duration-300 lg:translate-x-0 ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-5">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-2xl object-contain" />
            <div>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>AtomQuest</span>
              <div className={`text-xs px-2.5 py-0.5 rounded-full ${roleStyle.badge} border font-medium inline-flex items-center mt-0.5`}>
                {roleLabels[currentRole]}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto">
            {filteredMenuItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? `bg-gradient-to-r ${roleStyle.gradient} text-white shadow-lg`
                    : isDark 
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon size={20} className="transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User mini card */}
          <div className={`mt-4 p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-slate-700" />
              ) : (
                <div className={`w-10 h-10 ${roleStyle.bg} rounded-xl flex items-center justify-center text-white font-semibold`}>
                  {user?.name?.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{user?.name}</div>
                <div className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{user?.department}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-[280px] min-h-screen">
        {/* Header */}
        <header className={`sticky top-0 z-30 border-b px-6 py-4 ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className={`flex items-center gap-2 px-4 py-2.5 ${roleStyle.bg} text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all`}
                >
                  <RoleIconComponent role={currentRole} size={18} />
                  {roleLabels[currentRole]}
                  <ChevronDown size={16} className={`transition-transform ${showRoleSwitcher ? 'rotate-180' : ''}`} />
                </button>
                {showRoleSwitcher && (
                  <div className={`absolute top-full mt-3 left-0 rounded-xl shadow-xl overflow-hidden min-w-[180px] animate-scaleIn ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border border-gray-100'
                  }`}>
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setShowRoleSwitcher(false)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <RoleIconComponent role={key} size={16} className={`text-${roleConfig[key as keyof typeof roleConfig].color}-500`} />
                        <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
                  isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
                    isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className={`absolute top-full mt-3 right-0 rounded-xl shadow-xl w-80 max-h-96 overflow-hidden animate-scaleIn ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border border-gray-100'
                  }`}>
                    <div className={`p-4 border-b flex justify-between items-center ${
                      isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-gray-50'
                    }`}>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllNotificationsRead()}
                          className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          <Bell size={32} className="mx-auto mb-2 opacity-50" />
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-4 cursor-pointer transition-colors ${
                              !n.read 
                                ? (isDark ? 'bg-blue-900/10' : 'bg-blue-50')
                                : (isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50')
                            } ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}
                          >
                            <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{n.title}</div>
                            <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'} line-clamp-2`}>{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                  }`}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-slate-700" />
                  ) : (
                    <div className={`w-9 h-9 ${roleStyle.bg} rounded-xl flex items-center justify-center text-white font-semibold`}>
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <span className={`font-medium hidden sm:inline ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{user?.name}</span>
                  <ChevronDown size={16} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
                </button>
                {showUserMenu && (
                  <div className={`absolute top-full mt-3 right-0 rounded-xl shadow-xl w-72 overflow-hidden z-50 animate-scaleIn ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border border-gray-100'
                  }`}>
                    <div className={`p-4 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-gray-50'}`}>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{user?.name}</div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{user?.email}</div>
                      <div className={`text-xs px-2.5 py-0.5 rounded-full ${roleStyle.badge} border font-medium inline-flex items-center mt-2`}>
                        {roleLabels[currentRole]}
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleProfile}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl transition-colors ${
                          isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <User size={18} />
                        Profile
                      </button>
                      <button
                        onClick={handleSettings}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl transition-colors ${
                          isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Settings size={18} />
                        Settings
                      </button>
                      <button
                        onClick={toggleTheme}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl transition-colors ${
                          isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <hr className={`my-2 ${isDark ? 'border-slate-700' : 'border-gray-100'}`} />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-30 lg:hidden ${isDark ? 'bg-slate-900/50' : 'bg-white/50'}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Voice Notification Panel */}
      <VoiceNotificationPanel />

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}