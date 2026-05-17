import { useState, useEffect } from 'react';
import { Shield, Key, Smartphone, Monitor, LogOut, Bell, Lock, Eye, Download, Upload, Link, Calendar, MessageSquare, Globe, Palette, Database, Users, AlertTriangle, CheckCircle, Clock, Fingerprint, Mail, Settings as SettingsIcon, Save, RefreshCw, Trash2, X, Copy } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
  location?: string;
  browser?: string;
}

interface NotificationSettings {
  email: { enabled: boolean; types: string[] };
  push: { enabled: boolean; types: string[] };
  sms: { enabled: boolean; types: string[] };
  digest: { enabled: boolean; frequency: string };
}

export default function Settings() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('security');
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', deviceInfo: 'Chrome on Windows 11', ipAddress: '192.168.1.100', lastActive: '2026-05-17T10:30:00Z', createdAt: '2026-05-01T08:00:00Z', location: 'New York, US', browser: 'Chrome 114' },
    { id: '2', deviceInfo: 'Safari on iPhone 14', ipAddress: '192.168.1.101', lastActive: '2026-05-16T15:45:00Z', createdAt: '2026-04-15T10:00:00Z', location: 'New York, US', browser: 'Safari 17' },
    { id: '3', deviceInfo: 'Firefox on macOS', ipAddress: '192.168.1.102', lastActive: '2026-05-10T09:20:00Z', createdAt: '2026-03-20T14:00:00Z', location: 'San Francisco, US', browser: 'Firefox 113' },
  ]);
  const [sendingCode2FA, setSendingCode2FA] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: { enabled: true, types: ['goal_created', 'goal_approved', 'goal_rejected', 'checkin_reminder', 'escalation'] },
    push: { enabled: true, types: ['goal_created', 'goal_approved'] },
    sms: { enabled: false, types: ['goal_approved', 'goal_rejected'] },
    digest: { enabled: true, frequency: 'weekly' }
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    compactMode: false,
    showAnimations: true,
    autoSave: true,
    weekStart: 'sunday'
  });

  const [integrations, setIntegrations] = useState({
    slack: { enabled: false, webhookUrl: '', channel: '#general' },
    teams: { enabled: false, webhookUrl: '', channel: 'General' },
    googleCalendar: { enabled: false, connected: false },
    zapier: { enabled: false, apiKey: '' }
  });

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sessions/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const send2FACode = async () => {
    setSendingCode2FA(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sessions/send-2fa-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: user?.email })
      });
      
      if (response.ok) {
        setCodeSent(true);
        setTimeout(() => setCodeSent(false), 300000);
      }
    } catch (error) {
      console.error('Error sending 2FA code:', error);
    } finally {
      setSendingCode2FA(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sessions/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, code: verificationCode })
      });

      if (response.ok) {
        alert('2FA enabled successfully!');
        setVerificationCode('');
        setCodeSent(false);
      } else {
        alert('Invalid code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowDeleteConfirm(true);
  };

  const confirmRevokeSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/sessions/sessions/${sessionToDelete}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSessions();
    } catch (error) {
      console.error('Error revoking session:', error);
    } finally {
      setShowDeleteConfirm(false);
      setSessionToDelete(null);
    }
  };

  const revokeAllSessions = async () => {
    if (!confirm('Are you sure you want to revoke all sessions except this one? You will be logged out of all other devices.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/sessions/revoke-all-sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error revoking all sessions:', error);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(notifications)
      });
      alert('Notification settings saved!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const savePreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });
      alert('Preferences saved!');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const exportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/export-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `atomquest-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getDeviceIcon = (deviceInfo?: string) => {
    if (!deviceInfo) return <Monitor size={18} />;
    const device = deviceInfo.toLowerCase();
    if (device.includes('mobile') || device.includes('phone')) return <Smartphone size={18} />;
    return <Monitor size={18} />;
  };

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'sessions', label: 'Sessions & Devices', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="text-purple-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
          <p className="text-[var(--muted-foreground)]">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'sessions') loadSessions();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Fingerprint className="text-primary-500" size={20} />
                  Two-Factor Authentication
                </h3>
                <p className="text-[var(--muted-foreground)] mb-4">
                  Add an extra layer of security to your account by enabling 2FA. When enabled, you'll need to enter a verification code sent to your email in addition to your password.
                </p>
                <div className="p-4 bg-[var(--muted)] rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="text-primary-500" size={24} />
                      <div>
                        <div className="font-medium text-[var(--foreground)]">Email-based 2FA</div>
                        <div className="text-sm text-[var(--muted-foreground)]">Receive 6-digit codes via email</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-500 flex items-center gap-1">
                        <CheckCircle size={16} /> Enabled
                      </span>
                    </div>
                  </div>

                  {!codeSent ? (
                    <button
                      onClick={send2FACode}
                      disabled={sendingCode2FA}
                      className="btn-primary w-full"
                    >
                      {sendingCode2FA ? 'Sending Code...' : 'Enable 2FA'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-green-500">Code sent to {user?.email}</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          className="input flex-1"
                          maxLength={6}
                        />
                        <button onClick={verify2FA} disabled={loading} className="btn-primary">
                          {loading ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                      <button onClick={send2FACode} className="text-sm text-primary-500 hover:underline">
                        Resend Code
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Lock className="text-primary-500" size={20} />
                  Password
                </h3>
                <p className="text-[var(--muted-foreground)] mb-4">
                  Change your password to keep your account secure. We recommend using a strong, unique password.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">Current Password</label>
                    <input type="password" className="input w-full" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">New Password</label>
                    <input type="password" className="input w-full" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">Confirm New Password</label>
                    <input type="password" className="input w-full" placeholder="Confirm new password" />
                  </div>
                  <button className="btn-primary">Update Password</button>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Key className="text-primary-500" size={20} />
                  API Keys
                </h3>
                <p className="text-[var(--muted-foreground)] mb-4">
                  Manage API keys for external integrations. Keep your keys secure and never share them.
                </p>
                <button className="btn-secondary flex items-center gap-2">
                  <Key size={16} /> Generate New API Key
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Active Sessions</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Manage your active login sessions across devices</p>
                </div>
                <button
                  onClick={revokeAllSessions}
                  className="text-red-500 hover:text-red-600 text-sm flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Revoke All Others
                </button>
              </div>
              
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                          {getDeviceIcon(session.deviceInfo)}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--foreground)]">
                            {session.deviceInfo || 'Unknown Device'}
                          </div>
                          <div className="text-sm text-[var(--muted-foreground)]">
                            {session.ipAddress || 'Unknown IP'} • {session.location || 'Unknown location'}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                            <Clock size={12} />
                            Last active: {formatDate(session.lastActive)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => revokeSession(session.id)}
                        className="text-red-500 hover:text-red-600 text-sm flex items-center gap-2"
                      >
                        <X size={16} /> Revoke
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  <Monitor size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No active sessions</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'goal_created', label: 'Goal Created', desc: 'When a new goal is created' },
                    { key: 'goal_approved', label: 'Goal Approved', desc: 'When your goal is approved' },
                    { key: 'goal_rejected', label: 'Goal Rejected', desc: 'When your goal is rejected' },
                    { key: 'checkin_reminder', label: 'Check-in Reminder', desc: 'Quarterly check-in reminders' },
                    { key: 'escalation', label: 'Escalations', desc: 'Goal escalation notifications' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                      <div>
                        <div className="font-medium text-[var(--foreground)]">{item.label}</div>
                        <div className="text-sm text-[var(--muted-foreground)]">{item.desc}</div>
                      </div>
                      <button 
                        className={`w-12 h-6 rounded-full transition-colors ${notifications.email.types.includes(item.key) ? 'bg-primary-500' : 'bg-gray-400'}`}
                        onClick={() => {
                          const types = notifications.email.types.includes(item.key)
                            ? notifications.email.types.filter(t => t !== item.key)
                            : [...notifications.email.types, item.key];
                          setNotifications({ ...notifications, email: { ...notifications.email, types } });
                        }}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications.email.types.includes(item.key) ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Digest Settings</h3>
                <div className="p-4 bg-[var(--muted)] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="text-primary-500" size={24} />
                      <div>
                        <div className="font-medium text-[var(--foreground)]">Weekly Digest</div>
                        <div className="text-sm text-[var(--muted-foreground)]">Receive a summary of your goals</div>
                      </div>
                    </div>
                    <button 
                      className={`w-12 h-6 rounded-full transition-colors ${notifications.digest.enabled ? 'bg-primary-500' : 'bg-gray-400'}`}
                      onClick={() => setNotifications({ ...notifications, digest: { ...notifications.digest, enabled: !notifications.digest.enabled } })}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications.digest.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                  {notifications.digest.enabled && (
                    <div className="mt-4">
                      <label className="text-sm text-[var(--muted-foreground)]">Frequency</label>
                      <select 
                        className="input w-full mt-1"
                        value={notifications.digest.frequency}
                        onChange={(e) => setNotifications({ ...notifications, digest: { ...notifications.digest, frequency: e.target.value } })}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={saveNotificationSettings} className="btn-primary">
                Save Notification Settings
              </button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">Theme</label>
                    <div className="flex gap-2 mt-2">
                      {['light', 'dark', 'system'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => setPreferences({ ...preferences, theme })}
                          className={`px-4 py-2 rounded-lg capitalize ${preferences.theme === theme ? 'bg-primary-500 text-white' : 'bg-[var(--muted)]'}`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                    <div>
                      <div className="font-medium text-[var(--foreground)]">Compact Mode</div>
                      <div className="text-sm text-[var(--muted-foreground)]">Use smaller spacing and elements</div>
                    </div>
                    <button 
                      className={`w-12 h-6 rounded-full transition-colors ${preferences.compactMode ? 'bg-primary-500' : 'bg-gray-400'}`}
                      onClick={() => setPreferences({ ...preferences, compactMode: !preferences.compactMode })}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${preferences.compactMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                    <div>
                      <div className="font-medium text-[var(--foreground)]">Show Animations</div>
                      <div className="text-sm text-[var(--muted-foreground)]">Enable UI animations and transitions</div>
                    </div>
                    <button 
                      className={`w-12 h-6 rounded-full transition-colors ${preferences.showAnimations ? 'bg-primary-500' : 'bg-gray-400'}`}
                      onClick={() => setPreferences({ ...preferences, showAnimations: !preferences.showAnimations })}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${preferences.showAnimations ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Regional</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">Language</label>
                    <select 
                      className="input w-full mt-1"
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">Date Format</label>
                    <select 
                      className="input w-full mt-1"
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)]">Week Starts On</label>
                    <select 
                      className="input w-full mt-1"
                      value={preferences.weekStart}
                      onChange={(e) => setPreferences({ ...preferences, weekStart: e.target.value })}
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  </div>
                </div>
              </div>

              <button onClick={savePreferences} className="btn-primary">
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">External Integrations</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#4A154B] flex items-center justify-center text-white font-bold">S</div>
                        <div>
                          <div className="font-medium text-[var(--foreground)]">Slack</div>
                          <div className="text-sm text-[var(--muted-foreground)]">Send notifications to Slack</div>
                        </div>
                      </div>
                      <button 
                        className={`w-12 h-6 rounded-full transition-colors ${integrations.slack.enabled ? 'bg-primary-500' : 'bg-gray-400'}`}
                        onClick={() => setIntegrations({ ...integrations, slack: { ...integrations.slack, enabled: !integrations.slack.enabled } })}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${integrations.slack.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                      </button>
                    </div>
                    {integrations.slack.enabled && (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Webhook URL"
                          className="input w-full"
                          value={integrations.slack.webhookUrl}
                          onChange={(e) => setIntegrations({ ...integrations, slack: { ...integrations.slack, webhookUrl: e.target.value } })}
                        />
                        <input 
                          type="text" 
                          placeholder="Channel (e.g., #general)"
                          className="input w-full"
                          value={integrations.slack.channel}
                          onChange={(e) => setIntegrations({ ...integrations, slack: { ...integrations.slack, channel: e.target.value } })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#6264A7] flex items-center justify-center text-white font-bold">T</div>
                        <div>
                          <div className="font-medium text-[var(--foreground)]">Microsoft Teams</div>
                          <div className="text-sm text-[var(--muted-foreground)]">Send notifications to Teams</div>
                        </div>
                      </div>
                      <button 
                        className={`w-12 h-6 rounded-full transition-colors ${integrations.teams.enabled ? 'bg-primary-500' : 'bg-gray-400'}`}
                        onClick={() => setIntegrations({ ...integrations, teams: { ...integrations.teams, enabled: !integrations.teams.enabled } })}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${integrations.teams.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                      </button>
                    </div>
                    {integrations.teams.enabled && (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Webhook URL"
                          className="input w-full"
                          value={integrations.teams.webhookUrl}
                          onChange={(e) => setIntegrations({ ...integrations, teams: { ...integrations.teams, webhookUrl: e.target.value } })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#4285F4] flex items-center justify-center text-white font-bold">G</div>
                        <div>
                          <div className="font-medium text-[var(--foreground)]">Google Calendar</div>
                          <div className="text-sm text-[var(--muted-foreground)]">Sync goals with Google Calendar</div>
                        </div>
                      </div>
                      <button className="btn-secondary text-sm">
                        {integrations.googleCalendar.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Data Management</h3>
                <p className="text-[var(--muted-foreground)] mb-4">
                  Export your data or delete your account. Your data is important to us.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={exportData} className="p-4 bg-[var(--muted)] rounded-lg flex items-center gap-3 hover:bg-[var(--border)] transition-colors">
                    <Download className="text-primary-500" size={24} />
                    <div className="text-left">
                      <div className="font-medium text-[var(--foreground)]">Export Data</div>
                      <div className="text-sm text-[var(--muted-foreground)]">Download all your data as JSON</div>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-[var(--muted)] rounded-lg flex items-center gap-3 hover:bg-[var(--border)] transition-colors">
                    <Upload className="text-purple-500" size={24} />
                    <div className="text-left">
                      <div className="font-medium text-[var(--foreground)]">Import Data</div>
                      <div className="text-sm text-[var(--muted-foreground)]">Restore from backup</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2 text-red-500">
                  <AlertTriangle size={20} />
                  Danger Zone
                </h3>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h4 className="font-medium text-[var(--foreground)] mb-2">Delete Account</h4>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    Once you delete your account, there is no going back. All your data will be permanently removed.
                  </p>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2">
                    <Trash2 size={16} /> Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">Revoke Session?</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              Are you sure you want to revoke this session? The user will be logged out on that device.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteConfirm(false); setSessionToDelete(null); }} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={confirmRevokeSession} className="btn-primary bg-red-500 hover:bg-red-600 flex-1">
                Revoke Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}