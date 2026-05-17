import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Globe, Bot, User, ChevronDown, ChevronUp, Languages, Home, Target, BarChart3, CheckSquare, FileText, Settings, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';

type Language = 'en' | 'hi' | 'mr';

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇲🇷' },
];

const NAV_ICONS: Record<string, React.ComponentType<any>> = {
  dashboard: Home,
  goals: Target,
  analytics: BarChart3,
  approvals: CheckSquare,
  reports: FileText,
  settings: Settings,
};

// Voice configurations per language
const VOICE_CONFIGS: Record<Language, { lang: string; voiceName: string }> = {
  en: { lang: 'en-US', voiceName: 'Google US English' },
  hi: { lang: 'hi-IN', voiceName: 'Google हिंदी' },
  mr: { lang: 'mr-IN', voiceName: 'Google मराठी' },
};

// Check if browser supports speech recognition
const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// Check if browser supports speech synthesis
const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export default function Chatbot({ isOpen: externalOpen, onToggle: externalToggle }: ChatbotProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  
  const isOpen = externalOpen ?? internalOpen;
  const setIsOpen = externalToggle ? () => externalToggle() : () => setInternalOpen(prev => !prev);
  
  const {
    messages,
    language,
    isTyping,
    sendMessage,
    setLanguage,
    clearMessages,
    quickReplies,
  } = useChatbot();

  // Check speech support on mount
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported() && isSpeechSynthesisSupported());
  }, []);

  // Toggle voice input (microphone)
  const toggleListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      // Start listening
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = VOICE_CONFIGS[language].lang;
        
        recognitionInstance.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (event.results[0].isFinal) {
            setInput(transcript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        recognitionInstance.start();
        recognitionRef.current = recognitionInstance;
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsListening(false);
      }
    }
  }, [isListening, language]);

  // Update recognition language when language changes - keep ref updated
  const recognitionLangRef = useRef(language);
  recognitionLangRef.current = language;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speak text using text-to-speech
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !isSpeechSynthesisSupported()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const config = VOICE_CONFIGS[language];
    
    utterance.lang = config.lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, language]);

  // Toggle voice output
  const toggleVoiceOutput = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled && isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  };

  // Speak bot messages automatically when new messages arrive
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only speak if it's a bot message and doesn't contain navigation buttons
      if (lastMessage.role === 'bot' && !lastMessage.content.includes('button')) {
        // Extract plain text from message (remove HTML)
        const plainText = lastMessage.content.replace(/<[^>]*>/g, '').substring(0, 500);
        const timeoutId = setTimeout(() => {
          speakText(plainText);
        }, 800);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [messages, voiceEnabled, speakText]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  const processMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.includes('Go to') || line.includes('जाएं') || line.includes('जा') || line.includes('वर जा') || line.includes('पर जाएं')) {
        const routeMatch = line.match(/(?:Go to|जाएं|जा|वर जा|पर जाएं)\s+(\w+)/i);
        if (routeMatch) {
          const route = routeMatch[1].toLowerCase();
          const IconComponent = NAV_ICONS[route];
          const IconEl = IconComponent ? <IconComponent size={14} /> : null;
          return (
            <button
              key={i}
              onClick={() => handleNavigation(`/${route === 'home' ? '' : route}`)}
              className="flex items-center gap-2 px-3 py-1.5 mt-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors text-sm"
            >
              {IconEl}
              {line.trim()}
            </button>
          );
        }
      }
      return <div key={i}>{line}</div>;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={setIsOpen}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
        }}
      >
        <MessageCircle className="text-white" size={20} />
        <span className="text-white font-medium">Help</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 md:w-96 z-40">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden" style={{
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div className="p-3 border-b border-[var(--border)] flex items-center justify-between" style={{
          background: 'linear-gradient(90deg, #8b5cf620 0%, transparent 100%)'
        }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center relative">
              <Bot className="text-white" size={16} />
              {isSpeaking && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)] text-sm">AtomQuest Assistant</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                {isListening ? (language === 'en' ? 'Listening...' : language === 'hi' ? 'सुन रहा हूं...' : 'ऐकत आहे...') : 
                 isSpeaking ? (language === 'en' ? 'Speaking...' : language === 'hi' ? 'बोल रहा हूं...' : 'बोलत आहे...') :
                 language === 'en' ? 'Online' : language === 'hi' ? 'ऑनलाइन' : 'ऑनलाइन'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Voice Output Toggle */}
            <button
              onClick={toggleVoiceOutput}
              className={`p-1.5 rounded-lg transition-colors ${
                voiceEnabled ? 'text-green-500 hover:bg-green-500/10' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
              }`}
              title={voiceEnabled ? 'Voice output ON' : 'Voice output OFF'}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                title="Change language"
              >
                <Globe size={16} />
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-8 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--muted)] flex items-center gap-2 ${
                        language === lang.code ? 'bg-purple-500/10 text-purple-500' : 'text-[var(--foreground)]'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={setIsOpen}
              className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="mx-auto mb-2 text-purple-500" size={32} />
              <p className="text-sm text-[var(--muted-foreground)]">
                {language === 'en' ? 'Ask me anything! Try voice input 🎤' : 
                 language === 'hi' ? 'मुझसे कुछ भी पूछें! वॉइस इनपुट करें 🎤' : 
                 'मला काही विचारा! व्हॉइस इनपुट घ्या 🎤'}
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  msg.role === 'user' 
                    ? 'bg-purple-500 text-white rounded-br-md' 
                    : 'bg-[var(--muted)] text-[var(--foreground)] rounded-bl-md'
                }`}>
                  <div className="flex items-start gap-2">
                    {msg.role === 'bot' && <Bot size={14} className="mt-1 text-purple-500 flex-shrink-0" />}
                    {msg.role === 'user' && <User size={14} className="mt-1 text-white flex-shrink-0" />}
                    <div className="text-sm whitespace-pre-wrap">
                      {processMessageContent(msg.content)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[var(--muted)] rounded-2xl rounded-bl-md px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {quickReplies && messages.length < 3 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-[var(--muted-foreground)] mb-2">
              {language === 'en' ? 'Quick actions:' : 
               language === 'hi' ? 'त्वरित क्रियाएं:' : 
               'त्वरित कृत्ये:'}
            </p>
            <div className="flex flex-wrap gap-1">
              {quickReplies.slice(0, 4).map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className="flex gap-2">
            {/* Voice Input Button */}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-purple-500'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input (speak)'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={language === 'en' ? 'Type or speak...' : 
                           language === 'hi' ? 'लिखें या बोलें...' : 
                           'लिहा किंवा बोल...'}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          
          {/* Voice Status */}
          {isListening && (
            <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
              <Mic size={12} className="animate-pulse" />
              <span>{language === 'en' ? 'Listening... Speak now' : 
                     language === 'hi' ? 'सुन रहा हूं... अभी बोलें' : 
                     'ऐकत आहे... आता बोल'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}