import { useState, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { User, Mail, Building, Shield, Calendar, Edit2, Save, X, Camera, Award, Target, Clock, TrendingUp, MessageSquare, FileText, Upload } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const { goals, activities } = useDataStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const userGoals = goals.filter(g => g.ownerId === user?.id);
  const completedGoals = userGoals.filter(g => g.status === 'APPROVED').length;
  const avgProgress = userGoals.length > 0 
    ? Math.round(userGoals.reduce((sum, g) => sum + (g.currentValue / g.targetValue) * 100, 0) / userGoals.length)
    : 0;

  const userActivities = activities.filter(a => a.userId === user?.id);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">My Profile</h1>
          <p className="text-[var(--muted-foreground)]">Manage your account information and view your progress</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
            <Edit2 size={18} /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-start gap-6">
          <div className="relative group">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full object-cover" />
            ) : (
              <div className="w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center text-white text-4xl">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors cursor-pointer"
            >
              <Camera size={18} />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Department</label>
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save size={18} /> Save Changes
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn-secondary flex items-center gap-2">
                    <X size={18} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">{user?.name}</h2>
                <p className="text-[var(--muted-foreground)]">{user?.role} - {user?.department}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <Target className="text-primary-500" size={20} />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Total Goals</span>
          </div>
          <div className="text-3xl font-bold">{userGoals.length}</div>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Award className="text-success" size={20} />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Completed</span>
          </div>
          <div className="text-3xl font-bold text-success">{completedGoals}</div>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-warning" size={20} />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Avg Progress</span>
          </div>
          <div className="text-3xl font-bold text-warning">{avgProgress}%</div>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple/10 rounded-lg flex items-center justify-center">
              <Clock className="text-purple" size={20} />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">Active Since</span>
          </div>
          <div className="text-xl font-bold">Jan 2026</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-[var(--muted)] rounded-lg">
              <Mail className="text-primary-500" size={20} />
              <div>
                <div className="text-sm text-[var(--muted-foreground)]">Email</div>
                <div className="font-medium">{user?.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-[var(--muted)] rounded-lg">
              <Building className="text-success" size={20} />
              <div>
                <div className="text-sm text-[var(--muted-foreground)]">Department</div>
                <div className="font-medium">{user?.department}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-[var(--muted)] rounded-lg">
              <Shield className="text-purple" size={20} />
              <div>
                <div className="text-sm text-[var(--muted-foreground)]">Role</div>
                <div className="font-medium">{user?.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-[var(--muted)] rounded-lg">
              <Calendar className="text-warning" size={20} />
              <div>
                <div className="text-sm text-[var(--muted-foreground)]">Member Since</div>
                <div className="font-medium">January 2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h3 className="text-lg font-semibold mb-4">Goals Progress</h3>
          <div className="space-y-4">
            {userGoals.map(goal => (
              <div key={goal.id} className="p-4 bg-[var(--muted)] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{goal.title}</span>
                  <span className={`badge ${goal.status === 'APPROVED' ? 'badge-success' : goal.status === 'PENDING' ? 'badge-warning' : 'badge-info'}`}>
                    {goal.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                  </span>
                </div>
              </div>
            ))}
            {userGoals.length === 0 && (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                No goals yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="text-primary-500" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {userActivities.slice(0, 8).map(activity => (
            <div key={activity.id} className="flex items-center gap-4 p-3 bg-[var(--muted)] rounded-lg">
              <div className="w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center">
                <FileText className="text-primary-500" size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm">{activity.description}</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {userActivities.length === 0 && (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Skills & Certifications */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="text-warning" /> Skills & Certifications
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--muted)] rounded-lg text-center">
            <div className="text-2xl mb-2">☁️</div>
            <div className="font-medium">AWS Certified</div>
            <div className="text-xs text-[var(--muted-foreground)]">Solutions Architect</div>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg text-center">
            <div className="text-2xl mb-2">⚛️</div>
            <div className="font-medium">React Expert</div>
            <div className="text-xs text-[var(--muted-foreground)]">Frontend Dev</div>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg text-center">
            <div className="text-2xl mb-2">🗄️</div>
            <div className="font-medium">Database Design</div>
            <div className="text-xs text-[var(--muted-foreground)]">SQL & NoSQL</div>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg text-center">
            <div className="text-2xl mb-2">🔒</div>
            <div className="font-medium">Security+</div>
            <div className="text-xs text-[var(--muted-foreground)]">Cybersecurity</div>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Data Analytics</div>
            <div className="text-xs text-[var(--muted-foreground)]">BI Tools</div>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg text-center">
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-medium">AI/ML Basics</div>
            <div className="text-xs text-[var(--muted-foreground)]">Machine Learning</div>
          </div>
        </div>
      </div>
    </div>
  );
}