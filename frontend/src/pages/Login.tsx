import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, DEMO_USERS } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { Target, Eye, EyeOff, Upload, User, Camera, X } from 'lucide-react';
import type { Role } from '../types';
import { notificationService } from '../services/notificationService';
import { firebaseAuth } from '../firebase/authService';

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const validateManagerId = (id: string): boolean => {
  const pattern = /^MGR-[A-Z0-9]{10}$/;
  return pattern.test(id);
};

const validateAdminId = (id: string): boolean => {
  const pattern = /^ADM-[A-Z0-9]{10}$/;
  return pattern.test(id);
};

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'EMPLOYEE' | 'MANAGER' | 'ADMIN'>('EMPLOYEE');
  const [loginRole, setLoginRole] = useState<'EMPLOYEE' | 'MANAGER' | 'ADMIN'>('EMPLOYEE');
  const [managerId, setManagerId] = useState('');
  const [adminId, setAdminId] = useState('');
  
  const [captcha, setCaptcha] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [userCaptcha, setUserCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const passwordRequirements = {
    minLength: (p: string) => p.length >= 8,
    hasUppercase: (p: string) => /[A-Z]/.test(p),
    hasLowercase: (p: string) => /[a-z]/.test(p),
    hasNumber: (p: string) => /[0-9]/.test(p),
    hasSpecialChar: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)
  };

  const getPasswordStrength = () => {
    const checks = [
      passwordRequirements.minLength(password),
      passwordRequirements.hasUppercase(password),
      passwordRequirements.hasLowercase(password),
      passwordRequirements.hasNumber(password),
      passwordRequirements.hasSpecialChar(password)
    ];
    return checks.filter(Boolean).length;
  };

  const isPasswordValid = () => {
    return getPasswordStrength() >= 4;
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setUserCaptcha('');
    setCaptchaError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');

    if (userCaptcha.toUpperCase() !== captcha) {
      setCaptchaError('Invalid captcha. Please try again.');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      const user = await firebaseAuth.login({ email, password });
      
      notificationService.notifyLoginSuccess({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: '+1234567890',
        loginTime: new Date().toLocaleString(),
        device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        location: 'India'
      });
      
      setAuth(user, user.id, true);
      navigate('/');
    } catch (error: any) {
      setError('Invalid credentials. Please try again or use demo mode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address');
      return;
    }
    
    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      await firebaseAuth.resetPassword(forgotPasswordEmail);
      setForgotPasswordMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setForgotPasswordMessage(error.message || 'Failed to send reset email');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleDemoLogin = (role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
    setLoginRole(role);
    setIsLoading(true);
    setTimeout(() => {
      const user = DEMO_USERS[role];
      setAuth(user, 'demo-token');
      
      notificationService.notifyLoginSuccess({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: '+1234567890',
        loginTime: new Date().toLocaleString(),
        device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        location: 'India'
      });
      
      navigate('/');
    }, 500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (selectedRole === 'MANAGER') {
      if (!managerId) {
        setError('Manager ID is required for manager registration');
        return;
      }
      if (!validateManagerId(managerId)) {
        setError('Invalid Manager ID format. Required: MGR-XXXXXXXXXX (10 alphanumeric chars after MGR-)');
        return;
      }
    }

    if (selectedRole === 'ADMIN') {
      if (!adminId) {
        setError('Admin ID is required for admin registration');
        return;
      }
      if (!validateAdminId(adminId)) {
        setError('Invalid Admin ID format. Required: ADM-XXXXXXXXXX (10 alphanumeric chars after ADM-)');
        return;
      }
    }

    setIsLoading(true);

    try {
      const user = await firebaseAuth.register({
        email,
        password,
        name,
        role: selectedRole as Role,
        managerId: selectedRole === 'MANAGER' ? managerId : undefined,
        adminId: selectedRole === 'ADMIN' ? adminId : undefined
      });

      notificationService.notifyLoginSuccess({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: '+1234567890',
        loginTime: new Date().toLocaleString(),
        device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        location: 'India'
      });

      notificationService.notifyAccountCreated({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: '+1234567890',
        role: user.role,
        createdAt: new Date().toLocaleString()
      });

      setAuth(user, user.id, true);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    if (isRegisterMode) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setProfileImage(null);
      setSelectedRole('EMPLOYEE');
      setManagerId('');
      setAdminId('');
    }
  };

  const resetForm = () => {
    setIsRegisterMode(false);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setProfileImage(null);
    setSelectedRole('EMPLOYEE');
    setManagerId('');
    setAdminId('');
    setUserCaptcha('');
    refreshCaptcha();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ 
      background: 'linear-gradient(180deg, #0a0a0f 0%, #1a0a20 50%, #0f0a1a 100%)',
      minHeight: '100vh'
    }}>
      {/* Neon Cyberpunk 3D Background */}
      <div className="absolute inset-0 overflow-hidden perspective-1000">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at 20% 80%, rgba(255, 0, 128, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 60%)
          `,
          animation: 'meshMove 15s ease-in-out infinite'
        }}></div>

        {/* Neon Grid */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: `
            linear-gradient(to right, rgba(255, 0, 128, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(800px) rotateX(70deg) scale(2)',
          transformOrigin: 'center bottom',
          animation: 'gridPulse 4s ease-in-out infinite'
        }}></div>

        {/* Floating Neon Pyramids */}
        <div className="absolute top-20 left-20 w-0 h-0" style={{
          borderLeft: '30px solid transparent',
          borderRight: '30px solid transparent',
          borderBottom: '50px solid rgba(255, 0, 128, 0.3)',
          filter: 'blur(2px)',
          animation: 'pyramidFloat 6s ease-in-out infinite, pyramidGlow 3s ease-in-out infinite'
        }}></div>
        
        <div className="absolute top-40 right-32 w-0 h-0" style={{
          borderLeft: '25px solid transparent',
          borderRight: '25px solid transparent',
          borderBottom: '40px solid rgba(0, 255, 255, 0.3)',
          filter: 'blur(2px)',
          animation: 'pyramidFloat 5s ease-in-out infinite 1s, pyramidGlow 4s ease-in-out infinite 1s'
        }}></div>

        <div className="absolute bottom-40 left-1/3 w-0 h-0" style={{
          borderLeft: '35px solid transparent',
          borderRight: '35px solid transparent',
          borderBottom: '60px solid rgba(138, 43, 226, 0.3)',
          filter: 'blur(2px)',
          animation: 'pyramidFloat 7s ease-in-out infinite 2s, pyramidGlow 3s ease-in-out infinite 2s'
        }}></div>

        {/* Neon Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]" style={{ animation: 'neonRing 12s linear infinite' }}>
          <div className="absolute inset-0 rounded-full border border-cyan-500/20" style={{ 
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 30px rgba(0, 255, 255, 0.1)'
          }}></div>
          <div className="absolute inset-4 rounded-full border border-pink-500/30" style={{ 
            transform: 'rotateX(60deg)',
            boxShadow: '0 0 20px rgba(255, 0, 128, 0.2)'
          }}></div>
          <div className="absolute inset-8 rounded-full border border-purple-500/20" style={{ 
            transform: 'rotateY(45deg)',
            boxShadow: '0 0 20px rgba(138, 43, 226, 0.2)'
          }}></div>
        </div>

        {/* Neon Particles */}
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: Math.random() > 0.5 ? 'rgba(0, 255, 255, 0.8)' : 'rgba(255, 0, 128, 0.8)',
              boxShadow: Math.random() > 0.5 
                ? '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.4)' 
                : '0 0 10px rgba(255, 0, 128, 0.8), 0 0 20px rgba(255, 0, 128, 0.4)',
              animation: `neonParticle ${Math.random() * 4 + 3}s ease-in-out infinite ${Math.random() * 3}s`
            }}
          />
        ))}

        {/* Holographic Sphere */}
        <div className="absolute top-1/3 right-1/4 w-40 h-40" style={{
          animation: 'hologram 5s ease-in-out infinite'
        }}>
          <div className="w-full h-full rounded-full" style={{
            background: 'conic-gradient(from 0deg, #ff0080, #00ffff, #ff0080)',
            filter: 'blur(8px)',
            opacity: 0.6,
            animation: 'conicRotate 4s linear infinite'
          }}></div>
          <div className="absolute inset-2 rounded-full" style={{
            background: 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(10px)'
          }}></div>
        </div>

        {/* Scan lines effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
          animation: 'scanlines 8s linear infinite'
        }}></div>
      </div>

      {/* Neon Logo */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center gap-3" style={{ 
          animation: 'logoGlow 3s ease-in-out infinite alternate'
        }}>
          <div className="relative">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl object-contain" style={{
              boxShadow: '0 0 30px rgba(255, 0, 128, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)',
            }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ 
              textShadow: '0 0 20px rgba(255, 0, 128, 0.8), 0 0 40px rgba(0, 255, 255, 0.5)',
              letterSpacing: '2px'
            }}>ATOMQUEST</h2>
            <p className="text-xs text-cyan-400/80" style={{
              textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
            }}>AI-Powered Goal Management</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes meshMove {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-2%, 2%); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes pyramidFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
        @keyframes pyramidGlow {
          0%, 100% { opacity: 0.3; filter: blur(2px); }
          50% { opacity: 0.6; filter: blur(4px); }
        }
        @keyframes neonRing {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes neonParticle {
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.8; }
          50% { transform: scale(1.5) translateY(-20px); opacity: 1; }
        }
        @keyframes hologram {
          0%, 100% { transform: perspective(500px) rotateY(0deg) rotateX(0deg); }
          25% { transform: perspective(500px) rotateY(10deg) rotateX(5deg); }
          50% { transform: perspective(500px) rotateY(0deg) rotateX(0deg); }
          75% { transform: perspective(500px) rotateY(-10deg) rotateX(-5deg); }
        }
        @keyframes conicRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scanlines {
          from { transform: translateY(0); }
          to { transform: translateY(20px); }
        }
        @keyframes logoGlow {
          from { filter: brightness(1); }
          to { filter: brightness(1.2); }
        }
      `}</style>

      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 rounded-xl backdrop-blur-sm border transition-all z-10"
        style={{
          background: 'rgba(255, 0, 128, 0.2)',
          border: '1px solid rgba(255, 0, 128, 0.3)',
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)'
        }}
      >
        <span style={{ 
          fontSize: '20px',
          filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))'
        }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
      </button>

      <div className="w-full max-w-md relative z-10" style={{ perspective: '1000px' }}>
        <div className="backdrop-blur-2xl rounded-3xl overflow-hidden transition-all duration-500" 
             style={{ 
               transform: 'rotateX(2deg)',
               background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(10, 10, 20, 0.95) 100%)',
               border: '1px solid rgba(255, 0, 128, 0.3)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 0, 128, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
             }}>
          {/* Neon Cyberpunk Header */}
          <div className="relative p-8 text-center overflow-hidden" style={{
            transform: 'rotateX(2deg)',
            transformOrigin: 'top',
            background: 'linear-gradient(180deg, rgba(255, 0, 128, 0.3) 0%, rgba(138, 43, 226, 0.2) 50%, rgba(0, 255, 255, 0.1) 100%)',
            borderBottom: '1px solid rgba(255, 0, 128, 0.3)'
          }}>
            {/* Animated gradient overlay */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
              animation: 'neonShine 3s ease-in-out infinite'
            }}></div>
            
            <div className="relative">
              <div className="flex justify-center mb-4" style={{ perspective: '300px' }}>
                <div className="relative">
                  <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-2xl object-contain" style={{
                    transform: 'rotateY(15deg) rotateX(10deg)',
                    boxShadow: '0 10px 40px rgba(255, 0, 128, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)'
                  }} />
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-2xl animate-ping" style={{
                    background: 'transparent',
                    border: '2px solid rgba(0, 255, 255, 0.5)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}></div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{
                textShadow: '0 0 30px rgba(255, 0, 128, 0.8), 0 0 60px rgba(0, 255, 255, 0.4)',
                letterSpacing: '3px'
              }}>{isRegisterMode ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</h1>
              <p className="text-cyan-300/80 text-sm" style={{
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
              }}>
                {isRegisterMode ? 'Join AtomQuest AI today' : 'Sign in to continue to AtomQuest'}
              </p>
            </div>
            
            {/* Bottom neon line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{
              background: 'linear-gradient(90deg, transparent, #ff0080, #00ffff, transparent)',
              boxShadow: '0 0 20px rgba(255, 0, 128, 0.5), 0 0 20px rgba(0, 255, 255, 0.5)'
            }}></div>
          </div>
          <style>{`
            @keyframes neonShine {
              0%, 100% { opacity: 0; transform: translateX(-100%); }
              50% { opacity: 1; transform: translateX(100%); }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 0.3; }
            }
          `}</style>

          <div className="p-8">

          {error && (
            <div className="mb-4 p-4 rounded-xl text-sm animate-shake" style={{
              background: 'rgba(255, 0, 128, 0.1)',
              border: '1px solid rgba(255, 0, 128, 0.5)',
              color: '#ff0080',
              boxShadow: '0 0 20px rgba(255, 0, 128, 0.2)'
            }}>
              <div className="flex items-center gap-2">
                <span style={{ textShadow: '0 0 10px #ff0080' }}>⚠️</span>
                {error}
              </div>
            </div>
          )}

          {isRegisterMode ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-4 border-white dark:border-slate-600 shadow-xl flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <User className="text-white" size={28} />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Add Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Register as
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { role: 'EMPLOYEE', label: 'Employee', icon: '👤', color: 'from-emerald-500 to-emerald-600' },
                    { role: 'MANAGER', label: 'Manager', icon: '👔', color: 'from-blue-500 to-blue-600' },
                    { role: 'ADMIN', label: 'Admin', icon: '⚡', color: 'from-purple-500 to-purple-600' }
                  ].map(({ role, label, icon }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role as any)}
                      className={`relative overflow-hidden px-3 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                        selectedRole === role 
                          ? role === 'EMPLOYEE' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg transform scale-105'
                          : role === 'MANAGER' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{icon}</span>
                        <span>{label}</span>
                      </div>
                      {selectedRole === role && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedRole === 'MANAGER' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Manager ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value.toUpperCase())}
                    className="input"
                    placeholder="MGR-XXXXXXXXXX"
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Format: MGR- followed by 10 alphanumeric characters
                  </p>
                </div>
              )}

              {selectedRole === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Admin ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value.toUpperCase())}
                    className="input"
                    placeholder="ADM-XXXXXXXXXX"
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Format: ADM- followed by 10 alphanumeric characters
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            getPasswordStrength() >= level
                              ? level <= 2 ? 'bg-red-500' : level <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${passwordRequirements.minLength(password) ? 'text-green-500' : 'text-slate-400'}`}>
                        {passwordRequirements.minLength(password) ? '✓' : '○'} Min 8 characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.hasUppercase(password) ? 'text-green-500' : 'text-slate-400'}`}>
                        {passwordRequirements.hasUppercase(password) ? '✓' : '○'} Uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.hasLowercase(password) ? 'text-green-500' : 'text-slate-400'}`}>
                        {passwordRequirements.hasLowercase(password) ? '✓' : '○'} Lowercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.hasNumber(password) ? 'text-green-500' : 'text-slate-400'}`}>
                        {passwordRequirements.hasNumber(password) ? '✓' : '○'} Number
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.hasSpecialChar(password) ? 'text-green-500' : 'text-slate-400'}`}>
                        {passwordRequirements.hasSpecialChar(password) ? '✓' : '○'} Special symbol
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input ${confirmPassword && password === confirmPassword ? 'border-green-500' : ''}`}
                  placeholder="Confirm your password"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid()}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  'Register'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Login as
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { role: 'EMPLOYEE', label: 'Employee', icon: '👤', gradient: 'from-emerald-500 to-emerald-600' },
                    { role: 'MANAGER', label: 'Manager', icon: '👔', gradient: 'from-blue-500 to-blue-600' },
                    { role: 'ADMIN', label: 'Admin', icon: '⚡', gradient: 'from-purple-500 to-purple-600' }
                  ].map(({ role, label, icon, gradient }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setLoginRole(role as any)}
                      className={`px-3 py-3 rounded-xl font-medium text-sm transition-all duration-300`}
                      style={{
                        background: loginRole === role 
                          ? `linear-gradient(135deg, ${role === 'EMPLOYEE' ? '#10b981' : role === 'MANAGER' ? '#3b82f6' : '#8b5cf6'}, ${role === 'EMPLOYEE' ? '#059669' : role === 'MANAGER' ? '#2563eb' : '#7c3aed'})`
                          : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: loginRole === role ? '0 4px 15px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{icon}</span>
                        <span>{label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-white/50">or sign in with email</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="Enter your email"
                  required
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="Enter your password"
                    required
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 dark:text-slate-300 mb-2">
                  Captcha
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg px-4 py-2 font-mono text-lg tracking-wider text-center select-none bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-white/20 text-white" style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {captcha}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                    title="Refresh captcha"
                  >
                    <Upload size={18} className="rotate-180 text-white" />
                  </button>
                </div>
                <input
                  type="text"
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value.toUpperCase())}
                  className="input mt-2"
                  placeholder="Enter captcha code"
                  maxLength={6}
                  required
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                {captchaError && (
                  <p className="text-xs text-red-400 mt-1">{captchaError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                style={{
                  transform: 'translateZ(0)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                }}
              >
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Continue with Google */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-white/50">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await useAuthStore.getState().loginWithGoogle();
                    navigate('/');
                  } catch (error: any) {
                    setError(error.message || 'Google sign-in failed. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-semibold text-white">Continue with Google</span>
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm font-medium"
                  style={{ color: '#60a5fa' }}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm font-medium"
              style={{ color: '#60a5fa' }}
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

          {!isRegisterMode && <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-white/60">
                  Demo accounts (click to login)
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('EMPLOYEE')}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'white'
                }}
              >
                Employee
              </button>
              <button
                onClick={() => handleDemoLogin('MANAGER')}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1))',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: 'white'
                }}
              >
                Manager
              </button>
              <button
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: 'white'
                }}
              >
                Admin
              </button>
            </div>
          </div>}

          <p className="mt-6 text-center text-xs text-white/50">
            Demo mode - no backend required
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Reset Password</h2>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[var(--muted-foreground)] mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="input"
                  placeholder="Enter your email"
                />
              </div>

              {forgotPasswordMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  forgotPasswordMessage.includes('sent') 
                    ? 'bg-success/10 text-success' 
                    : 'bg-danger/10 text-danger'
                }`}>
                  {forgotPasswordMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {forgotPasswordLoading ? (
                  <div className="spinner" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </div>
</div>
        )}
      </div>
    </div>
  );
}