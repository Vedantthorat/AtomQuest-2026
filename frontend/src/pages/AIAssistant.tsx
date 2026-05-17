import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Wand2, Lightbulb, Target, TrendingUp, MessageSquare, BookOpen, HelpCircle, Zap, Star } from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';

type ToolType = 'smart-goal' | 'tips' | 'analysis' | 'qa';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { goals } = useDataStore();
  const { user } = useAuthStore();
  const [activeTool, setActiveTool] = useState<ToolType>('smart-goal');
  const [vagueGoal, setVagueGoal] = useState('');
  const [generatedGoal, setGeneratedGoal] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userGoals = goals.filter(g => g.owner?.id === user?.id);

  const generateGoal = async () => {
    if (!vagueGoal.trim()) {
      setError('Please enter a goal idea');
      return;
    }
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      const goalTypes = [
        {
          title: `Improve ${vagueGoal} by 20%`,
          description: `Achieve measurable improvement in ${vagueGoal} through structured actions, weekly checkpoints, and quarterly milestones. Focus on key deliverables and track progress monthly.`,
          thrustArea: 'Operational',
          weightage: 15,
          targetValue: 20,
          unit: '%'
        },
        {
          title: `Enhance ${vagueGoal} Performance`,
          description: `Develop and implement a comprehensive plan to boost ${vagueGoal}. Set clear KPIs, establish baseline metrics, and create actionable improvement strategies.`,
          thrustArea: 'Innovation',
          weightage: 20,
          targetValue: 100,
          unit: 'points'
        },
        {
          title: `Optimize ${vagueGoal} Efficiency`,
          description: `Streamline ${vagueGoal} processes to achieve 25% improvement. Identify bottlenecks, implement best practices, and measure outcomes bi-weekly.`,
          thrustArea: 'Operational',
          weightage: 18,
          targetValue: 25,
          unit: '%'
        }
      ];
      
      setGeneratedGoal(goalTypes[Math.floor(Math.random() * goalTypes.length)]);
      setIsLoading(false);
    }, 1500);
  };

  const getTips = () => {
    const tips = [
      { title: 'SMART Goals', content: 'Make goals Specific, Measurable, Achievable, Relevant, and Time-bound for better success rate.' },
      { title: 'Weightage Balance', content: 'Distribute weightage evenly across goals. No single goal should dominate (recommended 10-20% per goal).' },
      { title: 'Quarterly Check-ins', content: 'Update progress quarterly to track momentum and make timely adjustments to your goals.' },
      { title: 'Align with Thrust Areas', content: 'Choose thrust areas that align with team and company objectives for maximum impact.' },
      { title: 'Realistic Targets', content: 'Set challenging but achievable targets. Too easy loses motivation, too hard leads to frustration.' },
    ];
    return tips;
  };

  const analyzePerformance = () => {
    const totalGoals = userGoals.length;
    const completedGoals = userGoals.filter(g => g.progressStatus === 'COMPLETED').length;
    const avgProgress = totalGoals > 0 
      ? Math.round(userGoals.reduce((sum, g) => {
          const target = g.targetValue || 1;
          const actual = g.actualAchievement || 0;
          return sum + (target > 0 ? (actual / target) * 100 : 0);
        }, 0) / totalGoals)
      : 0;
    
    const thrustAreaBreakdown = userGoals.reduce((acc, g) => {
      acc[g.thrustArea] = (acc[g.thrustArea] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalGoals, completedGoals, avgProgress, thrustAreaBreakdown };
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages([...chatMessages, userMsg]);
    setChatInput('');
    setIsLoading(true);

    setTimeout(() => {
      const responses: Record<string, string> = {
        'how': 'To create a goal: 1) Go to My Goals, 2) Click "Add New Goal", 3) Fill in title, description, thrust area, weightage, and target. Total weightage should equal 100%.',
        'what': 'AtomQuest helps you set, track, and achieve professional goals. You can create SMART goals, track progress quarterly, and get AI assistance.',
        'weightage': 'Weightage determines goal importance. All your goals should add up to 100%. Each goal should have at least 10% weightage.',
        'thrust': 'Thrust Areas categorize your goals: Revenue, Customer, Operational, Innovation, Talent, Sustainability, Compliance, and Market.',
        'check-in': 'Quarterly check-ins let you update goal progress. Mark achievements, add notes, and track momentum toward your targets.',
        'default': `Great question! I can help with:\n• Creating SMART goals\n• Understanding weightage and thrust areas\n• Tips for goal achievement\n• Quarterly check-in guidance\n\nAsk me anything about goal setting!`
      };

      const responseKey = Object.keys(responses).find(key => 
        chatInput.toLowerCase().includes(key)
      ) || 'default';

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[responseKey],
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedGoal, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools = [
    { id: 'smart-goal', label: 'SMART Goal Generator', icon: Target, color: 'bg-blue-500' },
    { id: 'tips', label: 'Tips & Best Practices', icon: Lightbulb, color: 'bg-yellow-500' },
    { id: 'analysis', label: 'My Performance Analysis', icon: TrendingUp, color: 'bg-green-500' },
    { id: 'qa', label: 'Ask Questions', icon: MessageSquare, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <Sparkles className="text-purple" /> AI Smart Assistant
        </h1>
        <p className="text-[var(--muted-foreground)]">Your personal goal setting and achievement helper</p>
      </div>

      {/* Tool Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as ToolType)}
            className={`p-4 rounded-xl border transition-all ${
              activeTool === tool.id 
                ? 'border-primary-500 bg-primary-500/10' 
                : 'border-[var(--border)] hover:border-primary-500/50'
            }`}
          >
            <tool.icon className={`${tool.color} text-white p-2 rounded-lg mb-2`} size={24} />
            <div className="font-medium text-sm">{tool.label}</div>
          </button>
        ))}
      </div>

      {/* SMART Goal Generator */}
      {activeTool === 'smart-goal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="text-blue-500" />
              <h2 className="text-lg font-semibold">Transform Ideas to SMART Goals</h2>
            </div>
            <label className="block text-sm font-medium mb-2">Describe your goal idea</label>
            <textarea
              value={vagueGoal}
              onChange={(e) => setVagueGoal(e.target.value)}
              placeholder="e.g., improve sales, better teamwork, learn new skills, increase customer satisfaction, reduce costs..."
              className="input mb-4"
              rows={4}
            />
            {error && <p className="text-danger text-sm mb-4">{error}</p>}
            <button 
              onClick={generateGoal} 
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              {isLoading ? 'Generating...' : 'Generate SMART Goal'}
            </button>
          </div>

          {generatedGoal && (
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-yellow-500" />
                <h2 className="text-lg font-semibold">Generated SMART Goal</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)]">Title</label>
                  <p className="font-medium text-[var(--foreground)]">{generatedGoal.title}</p>
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)]">Description</label>
                  <p className="text-[var(--foreground)]">{generatedGoal.description}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[var(--muted)] p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">{generatedGoal.thrustArea}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Thrust Area</div>
                  </div>
                  <div className="bg-[var(--muted)] p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">{generatedGoal.weightage}%</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Weightage</div>
                  </div>
                  <div className="bg-[var(--muted)] p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">{generatedGoal.targetValue}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Target</div>
                  </div>
                  <div className="bg-[var(--muted)] p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">{generatedGoal.unit}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">Unit</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleCopy} className="btn-secondary flex items-center gap-2">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy Goal'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips & Best Practices */}
      {activeTool === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTips().map((tip, index) => (
            <div key={index} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 hover:border-yellow-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="text-yellow-500" size={20} />
                <h3 className="font-semibold">{tip.title}</h3>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{tip.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Performance Analysis */}
      {activeTool === 'analysis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 text-center">
              <Target className="text-blue-500 mx-auto mb-2" size={32} />
              <div className="text-3xl font-bold">{analyzePerformance().totalGoals}</div>
              <div className="text-[var(--muted-foreground)]">Total Goals</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 text-center">
              <Zap className="text-green-500 mx-auto mb-2" size={32} />
              <div className="text-3xl font-bold text-green-500">{analyzePerformance().completedGoals}</div>
              <div className="text-[var(--muted-foreground)]">Completed</div>
            </div>
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 text-center">
              <TrendingUp className="text-purple mx-auto mb-2" size={32} />
              <div className="text-3xl font-bold text-purple">{analyzePerformance().avgProgress}%</div>
              <div className="text-[var(--muted-foreground)]">Avg Progress</div>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold mb-4">Thrust Area Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analyzePerformance().thrustAreaBreakdown).map(([area, count]) => (
                <div key={area} className="flex items-center gap-3">
                  <div className="w-32 text-sm">{area}</div>
                  <div className="flex-1 h-4 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(count / userGoals.length) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-sm font-medium">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold mb-4">Recommendations</h3>
            <div className="space-y-3">
              {analyzePerformance().avgProgress < 50 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
                  <HelpCircle className="text-yellow-500 mt-0.5" size={18} />
                  <p className="text-sm">Your progress is below 50%. Consider reviewing your goals and adjusting targets to be more achievable.</p>
                </div>
              )}
              {analyzePerformance().totalGoals < 5 && (
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
                  <Lightbulb className="text-blue-500 mt-0.5" size={18} />
                  <p className="text-sm">You have fewer than 5 goals. Consider adding more goals to maximize your growth opportunities.</p>
                </div>
              )}
              {Object.keys(analyzePerformance().thrustAreaBreakdown).length < 3 && (
                <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                  <Target className="text-purple mt-0.5" size={18} />
                  <p className="text-sm">Focus on diverse thrust areas to develop well-rounded skills. Try adding goals in different categories.</p>
                </div>
              )}
              {analyzePerformance().completedGoals > 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                  <Star className="text-green-500 mt-0.5" size={18} />
                  <p className="text-sm">Great job completing goals! Keep up the momentum and set new challenging targets.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Q&A Chat */}
      {activeTool === 'qa' && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="text-purple" />
            <h2 className="text-lg font-semibold">Ask Me Anything</h2>
          </div>
          
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {chatMessages.length === 0 && (
              <div className="text-center text-[var(--muted-foreground)] py-8">
                <HelpCircle className="mx-auto mb-2 opacity-50" size={32} />
                <p>Ask questions about goals, weightage, thrust areas, check-ins, or how to use AtomQuest.</p>
              </div>
            )}
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-[var(--muted)] text-[var(--foreground)]'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--muted)] p-3 rounded-lg">
                  <Loader2 className="animate-spin" size={18} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about goals, weightage, thrust areas..."
              className="input flex-1"
            />
            <button onClick={handleSendMessage} className="btn-primary px-4">
              Send
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">Try:</span>
            <button onClick={() => setChatInput('How do I create a goal?')} className="text-xs bg-[var(--muted)] px-2 py-1 rounded hover:bg-[var(--border)]">How do I create a goal?</button>
            <button onClick={() => setChatInput('What is weightage?')} className="text-xs bg-[var(--muted)] px-2 py-1 rounded hover:bg-[var(--border)]">What is weightage?</button>
            <button onClick={() => setChatInput('How do quarterly check-ins work?')} className="text-xs bg-[var(--muted)] px-2 py-1 rounded hover:bg-[var(--border)]">Quarterly check-ins</button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="text-primary-500" />
          <h3 className="font-semibold">Quick Help</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span>Total weightage must equal 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span>Each goal needs min 10% weightage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span>Max 8 goals per employee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span>8 thrust areas available</span>
          </div>
        </div>
      </div>
    </div>
  );
}