import { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, Sparkles, TrendingUp, Target, Clock, Users, Zap, Crown, Gift, Info, RefreshCw, Lock, Filter, X, CheckCircle, Calendar, Percent, TrendingDown } from 'lucide-react';

interface Badge {
  id: string;
  badge: string;
  earnedAt: string;
  definition: {
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
    requirements: string[];
  };
}

interface BadgeStats {
  totalEarned: number;
  totalAvailable: number;
  currentStreak: number;
  longestStreak: number;
  totalGoalsCompleted: number;
  averageProgress: number;
}

interface BadgeDetailsModalProps {
  badge: any;
  isEarned: boolean;
  onClose: () => void;
}

function BadgeDetailsModal({ badge, isEarned, onClose }: BadgeDetailsModalProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-400 bg-gray-400/10';
      case 'Uncommon': return 'text-green-400 border-green-400 bg-green-400/10';
      case 'Rare': return 'text-blue-400 border-blue-400 bg-blue-400/10';
      case 'Epic': return 'text-purple-400 border-purple-400 bg-purple-400/10';
      case 'Legendary': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Milestone': return <Trophy size={16} />;
      case 'Achievement': return <Star size={16} />;
      case 'Consistency': return <Clock size={16} />;
      case 'Speed': return <Zap size={16} />;
      case 'Loyalty': return <Medal size={16} />;
      case 'Collaboration': return <Users size={16} />;
      case 'Creativity': return <Sparkles size={16} />;
      case 'Progress': return <TrendingUp size={16} />;
      case 'Leadership': return <Award size={16} />;
      default: return <Gift size={16} />;
    }
  };

  const badgeProgress = isEarned ? 100 : Math.floor(Math.random() * 60);
  const steps = [
    { label: 'Start', progress: 0 },
    { label: 'In Progress', progress: 50 },
    { label: 'Almost There', progress: 80 },
    { label: 'Complete', progress: 100 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl ${
            isEarned ? 'bg-primary-500/20' : 'bg-[var(--muted)]'
          }`}>
            {isEarned ? badge.icon : '🔒'}
          </div>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X size={20} />
          </button>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">{badge.name}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRarityColor(badge.rarity)}`}>
            {badge.rarity}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-[var(--muted-foreground)] text-center">{badge.description}</p>

          <div className="flex items-center justify-center gap-2 text-[var(--muted-foreground)]">
            {getCategoryIcon(badge.category)}
            <span className="text-sm">{badge.category}</span>
          </div>
        </div>

        <div className="p-4 bg-[var(--muted)] rounded-lg mb-6">
          <h4 className="font-medium text-[var(--foreground)] mb-3">How to Earn:</h4>
          <ul className="space-y-2">
            {badge.requirements.map((req: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {!isEarned && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-foreground)]">Progress</span>
              <span className="text-[var(--foreground)]">{badgeProgress}%</span>
            </div>
            <div className="w-full bg-[var(--border)] rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${badgeProgress}%` }}></div>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Complete more goals to unlock this badge!
            </p>
          </div>
        )}

        {isEarned && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle size={20} />
              <span className="font-medium">Badge Earned!</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              You achieved this badge on {new Date().toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-[var(--muted)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--foreground)]">{badgeProgress}%</div>
            <div className="text-xs text-[var(--muted-foreground)]">Progress</div>
          </div>
          <div className="p-3 bg-[var(--muted)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--foreground)]">{badge.category}</div>
            <div className="text-xs text-[var(--muted-foreground)]">Category</div>
          </div>
        </div>

        <button onClick={onClose} className="btn-primary w-full mt-6">Close</button>
      </div>
    </div>
  );
}

const ALL_BADGES = [
  { 
    type: 'FIRST_GOAL', 
    name: 'First Goal', 
    description: 'Created your first goal', 
    icon: '🎯',
    category: 'Milestone',
    rarity: 'Common',
    requirements: ['Create at least 1 goal']
  },
  { 
    type: 'GOAL_MASTER', 
    name: 'Goal Master', 
    description: 'Created 10+ goals', 
    icon: '🏆',
    category: 'Milestone',
    rarity: 'Epic',
    requirements: ['Create 10 or more goals']
  },
  { 
    type: 'GOAL_LEGEND', 
    name: 'Goal Legend', 
    description: 'Created 50+ goals', 
    icon: '👑',
    category: 'Milestone',
    rarity: 'Legendary',
    requirements: ['Create 50 or more goals']
  },
  { 
    type: 'QUARTER_COMPLETE', 
    name: 'Quarter Complete', 
    description: 'Completed a quarterly goal', 
    icon: '📅',
    category: 'Achievement',
    rarity: 'Uncommon',
    requirements: ['Achieve 100% of a quarterly goal']
  },
  { 
    type: 'STREAK_7_DAYS', 
    name: '7 Day Streak', 
    description: '7 days of check-ins', 
    icon: '🔥',
    category: 'Consistency',
    rarity: 'Rare',
    requirements: ['Submit check-ins for 7 consecutive days']
  },
  { 
    type: 'STREAK_30_DAYS', 
    name: '30 Day Streak', 
    description: '30 days of check-ins', 
    icon: '⚡',
    category: 'Consistency',
    rarity: 'Epic',
    requirements: ['Submit check-ins for 30 consecutive days']
  },
  { 
    type: 'STREAK_100_DAYS', 
    name: '100 Day Streak', 
    description: '100 days of check-ins', 
    icon: '💎',
    category: 'Consistency',
    rarity: 'Legendary',
    requirements: ['Submit check-ins for 100 consecutive days']
  },
  { 
    type: 'TOP_PERFORMER', 
    name: 'Top Performer', 
    description: 'Achieved 100% of goals', 
    icon: '⭐',
    category: 'Achievement',
    rarity: 'Rare',
    requirements: ['Complete 5 or more goals at 100%']
  },
  { 
    type: 'QUICK_ACHIEVER', 
    name: 'Quick Achiever', 
    description: 'Completed goal before deadline', 
    icon: '🚀',
    category: 'Speed',
    rarity: 'Uncommon',
    requirements: ['Complete a goal at least 7 days before deadline']
  },
  { 
    type: 'EARLY_BIRD', 
    name: 'Early Bird', 
    description: 'Complete goal 30+ days early', 
    icon: '🌅',
    category: 'Speed',
    rarity: 'Rare',
    requirements: ['Complete a goal at least 30 days before deadline']
  },
  { 
    type: 'CONSISTENT', 
    name: 'Consistent', 
    description: '6+ months active', 
    icon: '💪',
    category: 'Loyalty',
    rarity: 'Uncommon',
    requirements: ['Use platform for 6+ months continuously']
  },
  { 
    type: 'VETERAN', 
    name: 'Veteran', 
    description: '12+ months active', 
    icon: '🎖️',
    category: 'Loyalty',
    rarity: 'Epic',
    requirements: ['Use platform for 12+ months continuously']
  },
  { 
    type: 'TEAM_PLAYER', 
    name: 'Team Player', 
    description: 'Contributed to shared goals', 
    icon: '🤝',
    category: 'Collaboration',
    rarity: 'Uncommon',
    requirements: ['Participate in 3 or more shared goals']
  },
  { 
    type: 'LEADER', 
    name: 'Team Leader', 
    description: 'Lead a shared goal', 
    icon: '👔',
    category: 'Collaboration',
    rarity: 'Rare',
    requirements: ['Create and lead 2 or more shared goals']
  },
  { 
    type: 'INNOVATOR', 
    name: 'Innovator', 
    description: 'Created innovative goals', 
    icon: '💡',
    category: 'Creativity',
    rarity: 'Rare',
    requirements: ['Create goals in 5+ different thrust areas']
  },
  { 
    type: 'BALANCED', 
    name: 'Balanced', 
    description: 'Goals in all thrust areas', 
    icon: '⚖️',
    category: 'Creativity',
    rarity: 'Epic',
    requirements: ['Have at least one goal in each thrust area']
  },
  { 
    type: 'RISING_STAR', 
    name: 'Rising Star', 
    description: 'Rapid progress in 30 days', 
    icon: '🌟',
    category: 'Progress',
    rarity: 'Rare',
    requirements: ['Increase overall progress by 30% in 30 days']
  },
  { 
    type: 'MENTOR', 
    name: 'Mentor', 
    description: 'Approved 10+ employee goals', 
    icon: '📚',
    category: 'Leadership',
    rarity: 'Epic',
    requirements: ['Approve 10 or more employee goals as a manager']
  },
  { 
    type: 'FIRST_APPROVAL', 
    name: 'First Approval', 
    description: 'Approved your first goal', 
    icon: '✅',
    category: 'Leadership',
    rarity: 'Common',
    requirements: ['Get your first goal approved']
  },
  { 
    type: 'PERFECTIONIST', 
    name: 'Perfectionist', 
    description: '100% on all metrics', 
    icon: '💯',
    category: 'Elite',
    rarity: 'Legendary',
    requirements: ['Achieve 100% on 10 different goals']
  }
];

export default function Badges() {
  const defaultBadge = { name: '', description: '', icon: '', category: '', rarity: 'Common', requirements: [] };
  const [myBadges, setMyBadges] = useState<Badge[]>([
    { id: '1', badge: 'FIRST_GOAL', earnedAt: '2026-01-15T10:00:00Z', definition: ALL_BADGES.find(b => b.type === 'FIRST_GOAL') || defaultBadge },
    { id: '2', badge: 'QUARTER_COMPLETE', earnedAt: '2026-02-20T10:00:00Z', definition: ALL_BADGES.find(b => b.type === 'QUARTER_COMPLETE') || defaultBadge },
    { id: '3', badge: 'STREAK_7_DAYS', earnedAt: '2026-03-01T10:00:00Z', definition: ALL_BADGES.find(b => b.type === 'STREAK_7_DAYS') || defaultBadge },
    { id: '4', badge: 'CONSISTENT', earnedAt: '2026-04-10T10:00:00Z', definition: ALL_BADGES.find(b => b.type === 'CONSISTENT') || defaultBadge },
  ]);
  const [stats, setStats] = useState<BadgeStats>({
    totalEarned: 4,
    totalAvailable: ALL_BADGES.length,
    currentStreak: 12,
    longestStreak: 30,
    totalGoalsCompleted: 8,
    averageProgress: 75
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);

  useEffect(() => {
    fetchBadges();
    fetchStats();
  }, []);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/badges/my-badges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMyBadges(data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/badges/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkNewBadges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/badges/check-badges', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.newBadges?.length > 0) {
        alert(`🎉 Congratulations! You earned ${data.newBadges.length} new badge(s)!`);
        fetchBadges();
      } else {
        alert('No new badges earned yet. Keep going!');
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  const earnedBadgeTypes = myBadges.map(b => b.badge);

  const categories = ['all', ...new Set(ALL_BADGES.map(b => b.category))];

  const filteredBadges = selectedCategory === 'all' 
    ? ALL_BADGES 
    : ALL_BADGES.filter(b => b.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-400';
      case 'Uncommon': return 'text-green-400 border-green-400';
      case 'Rare': return 'text-blue-400 border-blue-400';
      case 'Epic': return 'text-purple-400 border-purple-400';
      case 'Legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Milestone': return <Trophy size={16} />;
      case 'Achievement': return <Star size={16} />;
      case 'Consistency': return <Clock size={16} />;
      case 'Speed': return <Zap size={16} />;
      case 'Loyalty': return <Medal size={16} />;
      case 'Collaboration': return <Users size={16} />;
      case 'Creativity': return <Sparkles size={16} />;
      case 'Progress': return <TrendingUp size={16} />;
      case 'Leadership': return <Award size={16} />;
      case 'Elite': return <Crown size={16} />;
      default: return <Gift size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="text-amber-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Achievements & Badges</h1>
            <p className="text-[var(--muted-foreground)]">Earn badges by completing milestones and achievements</p>
          </div>
        </div>
        <button onClick={checkNewBadges} className="btn-primary flex items-center gap-2">
          <RefreshCw size={18} /> Check for New Badges
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--muted-foreground)]">Badges Earned</span>
            <Trophy className="text-amber-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-primary-500">{myBadges.length}</div>
          <div className="text-sm text-[var(--muted-foreground)]">out of {ALL_BADGES.length} available</div>
          <div className="mt-2 w-full bg-[var(--muted)] rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(myBadges.length / ALL_BADGES.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--muted-foreground)]">Current Streak</span>
            <Zap className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-orange-500">{stats.currentStreak}</div>
          <div className="text-sm text-[var(--muted-foreground)]">days</div>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--muted-foreground)]">Goals Completed</span>
            <Target className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-green-500">{stats.totalGoalsCompleted}</div>
          <div className="text-sm text-[var(--muted-foreground)]">total goals</div>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--muted-foreground)]">Avg Progress</span>
            <TrendingUp className="text-purple-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-purple-500">{stats.averageProgress}%</div>
          <div className="text-sm text-[var(--muted-foreground)]">average across all goals</div>
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-[var(--muted-foreground)]" />
          <span className="font-medium text-[var(--foreground)]">Filter by Category:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                  selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-[var(--muted)] text-[var(--foreground)]'
                }`}
              >
                {cat !== 'all' && getCategoryIcon(cat)}
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map(badge => {
          const isEarned = earnedBadgeTypes.includes(badge.type);
          const earnedBadge = myBadges.find(b => b.badge === badge.type);

          return (
            <div
              key={badge.type}
              className={`bg-[var(--card)] rounded-xl border-2 p-4 transition-all cursor-pointer hover:scale-105 ${
                isEarned 
                  ? `border-${getRarityColor(badge.rarity).split(' ')[0]} shadow-lg` 
                  : 'border-[var(--border)] opacity-60'
              }`}
              onClick={() => setSelectedBadge(badge)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isEarned ? 'bg-primary-500/20' : 'bg-[var(--muted)]'
                }`}>
                  {isEarned ? (
                    <span className="text-3xl">{badge.icon}</span>
                  ) : (
                    <Lock size={24} className="text-[var(--muted-foreground)]" />
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(badge.rarity)}`}>
                  {badge.rarity}
                </span>
              </div>
              
              <h3 className="font-semibold text-[var(--foreground)] mb-1">{badge.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">{badge.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                  {getCategoryIcon(badge.category)}
                  {badge.category}
                </span>
                {isEarned && earnedBadge && (
                  <span className="text-xs text-primary-500">
                    {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {myBadges.length > 0 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Star className="text-amber-500" size={20} /> Recent Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBadges.slice(0, 6).map(badge => (
              <div key={badge.id} className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg">
                <span className="text-2xl">{badge.definition?.icon || '🏆'}</span>
                <div className="flex-1">
                  <div className="font-medium text-[var(--foreground)]">{badge.definition?.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(badge.definition?.rarity || 'Common')}`}>
                  {badge.definition?.rarity || 'Common'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="font-semibold text-[var(--foreground)] mb-4">Badge Rarity Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map(rarity => (
            <div key={rarity} className="text-center">
              <div className={`text-2xl font-bold ${getRarityColor(rarity).split(' ')[0]}`}>
                {rarity === 'Legendary' ? '💎' : rarity === 'Epic' ? '🔮' : rarity === 'Rare' ? '💎' : rarity === 'Uncommon' ? '🟢' : '⚪'}
              </div>
              <div className="text-sm text-[var(--foreground)]">{rarity}</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {ALL_BADGES.filter(b => b.rarity === rarity).length} badges
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedBadge && (
        <BadgeDetailsModal 
          badge={selectedBadge} 
          isEarned={myBadges.some(b => b.badge === selectedBadge.type)} 
          onClose={() => setSelectedBadge(null)} 
        />
      )}
    </div>
  );
}