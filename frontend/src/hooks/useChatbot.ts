import { useState, useCallback, useMemo } from 'react';

type Language = 'en' | 'hi' | 'mr';
type MessageRole = 'user' | 'bot';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface ChatbotState {
  messages: ChatMessage[];
  language: Language;
  isTyping: boolean;
}

interface NavigationIntent {
  action: string;
  route: string;
  label: Record<Language, string>;
}

const NAVIGATION_INTENTS: NavigationIntent[] = [
  { action: 'dashboard', route: '/', label: { en: 'Go to Dashboard', hi: 'डैशबोर्ड पर जाएं', mr: 'डॅशबोर्डवर जा' } },
  { action: 'goals', route: '/goals', label: { en: 'Go to Goals', hi: 'लक्ष्यों पर जाएं', mr: 'लक्ष्यांवर जा' } },
  { action: 'analytics', route: '/analytics', label: { en: 'Go to Analytics', hi: 'विश्लेषण पर जाएं', mr: 'विश्लेषणावर जा' } },
  { action: 'approvals', route: '/goals?tab=approvals', label: { en: 'Go to Approvals', hi: 'अनुमोदन पर जाएं', mr: 'मंजुरीवर जा' } },
  { action: 'team', route: '/goals?tab=team', label: { en: 'Go to Team', hi: 'टीम पर जाएं', mr: 'टीमवर जा' } },
  { action: 'reports', route: '/analytics?tab=reports', label: { en: 'Go to Reports', hi: 'रिपोर्ट पर जाएं', mr: 'रिपोर्टवर जा' } },
  { action: 'profile', route: '/profile', label: { en: 'Go to Profile', hi: 'प्रोफाइल पर जाएं', mr: 'प्रोफाइलवर जा' } },
  { action: 'settings', route: '/settings', label: { en: 'Go to Settings', hi: 'सेटिंग्स पर जाएं', mr: 'सेटिंग्जवर जा' } },
];

const RESPONSES: Record<Language, Record<string, string>> = {
  en: {
    greeting: 'Hello! I\'m your AtomQuest assistant. I can help you navigate the app and answer questions in English, Hindi, or Marathi.',
    help: 'I can help you with:\n• Navigating to different pages\n• Creating goals\n• Checking your progress\n• Understanding features\n\nJust tell me what you want to do!',
    create_goal: 'To create a new goal:\n1. Go to Goals page\n2. Click "Add Goal" button\n3. Fill in your goal details\n4. Set target value and deadline\n5. Submit for approval',
    check_progress: 'To check your progress:\n1. Go to Dashboard\n2. View your goals with progress bars\n3. Check the projected year-end score\n4. View Analytics for detailed reports',
    approve_goal: 'To approve a goal (for managers):\n1. Go to Goals page\n2. Click on "Approvals" tab\n3. Review pending goals\n4. Click Approve or Return with feedback',
    checkin: 'To log a check-in:\n1. Go to Goals page\n2. Find your goal\n3. Click on the check-in icon\n4. Enter actual achievement\n5. Update status',
    bulk_checkin: 'For bulk check-in:\n1. Go to Goals page\n2. Click "Bulk Check-in" button\n3. Enter actual values for all goals\n4. Click Save All',
    export_report: 'To export reports:\n1. Go to Analytics page\n2. Click "Export Report" button\n3. Choose format (CSV)\n4. Download your report',
    language_changed: 'Language changed to English',
    unknown: 'I didn\'t understand that. Try asking:\n• "How to create a goal"\n• "Go to dashboard"\n• "Check my progress"\n• "Help"',
    quick_actions: 'Quick actions you can try:',
    not_understood: 'I didn\'t understand. Would you like to:\n• Go to Dashboard\n• Go to Goals\n• Get help with creating goals',
  },
  hi: {
    greeting: 'नमस्ते! मैं आपका AtomQuest सहायक हूं। मैं ऐप को नेविगेट करने और प्रश्नों के उत्तर देने में मदद कर सकता हूं।',
    help: 'मैं इनमें मदद कर सकता हूं:\n• विभिन्न पृष्ठों पर जाना\n• लक्ष्य बनाना\n• अपनी प्रगति देखना\n• सुविधाओं को समझना\n\nबस बताएं आप क्या करना चाहते हैं!',
    create_goal: 'नया लक्ष्य बनाने के लिए:\n1. लक्ष्य पृष्ठ पर जाएं\n2. "लक्ष्य जोड़ें" बटन पर क्लिक करें\n3. अपने लक्ष्य का विवरण भरें\n4. लक्ष्य मान और समय सीमा सेट करें\n5. अनुमोदन के लिए जमा करें',
    check_progress: 'अपनी प्रगति देखने के लिए:\n1. डैशबोर्ड पर जाएं\n2. प्रगति बार के साथ अपने लक्ष्य देखें\n3. अनुमानित वर्ष-अंत स्कोर देखें\n4. विस्तृत रिपोर्ट के लिए विश्लेषण देखें',
    approve_goal: 'लक्ष्य अनुमोदित करने के लिए (प्रबंधकों के लिए):\n1. लक्ष्य पृष्ठ पर जाएं\n2. "अनुमोदन" टैब पर क्लिक करें\n3. लंबित लक्ष्यों की समीक्षा करें\n4. अनुमोदित करें या प्रतिक्रिया के साथ वापस करें',
    checkin: 'चेक-इन दर्ज करने के लिए:\n1. लक्ष्य पृष्ठ पर जाएं\n2. अपना लक्ष्य खोजें\n3. चेक-इन आइकन पर क्लिक करें\n4. वास्तविक उपलब्धि दर्ज करें\n5. स्थिति अपडेट करें',
    bulk_checkin: 'बल्क चेक-इन के लिए:\n1. लक्ष्य पृष्ठ पर जाएं\n2. "बल्क चेक-इन" बटन पर क्लिक करें\n3. सभी लक्ष्यों के लिए वास्तविक मान दर्ज करें\n4. सभी सहेजें पर क्लिक करें',
    export_report: 'रिपोर्ट निर्यात करने के लिए:\n1. विश्लेषण पृष्ठ पर जाएं\n2. "रिपोर्ट निर्यात" बटन पर क्लिक करें\n3. प्रारूप चुनें (CSV)\n4. अपनी रिपोर्ट डाउनलोड करें',
    language_changed: 'भाषा बदलकर अंग्रेजी हो गई',
    unknown: 'मुझे समझ नहीं आया। इनमें से कोशिश करें:\n• "लक्ष्य कैसे बनाएं"\n• "डैशबोर्ड पर जाएं"\n• "मेरी प्रगति देखें"\n• "मदद"',
    quick_actions: 'आप ये क्रियाएं कर सकते हैं:',
    not_understood: 'मुझे समझ नहीं आया। क्या आप चाहते हैं:\n• डैशबोर्ड पर जाएं\n• लक्ष्यों पर जाएं\n• लक्ष्य बनाने में मदद लें',
  },
  mr: {
    greeting: 'नमस्कार! मी तुमचा AtomQuest सहायक आहे. मी अ‍ॅप नेव्हिगेट करण्यास आणि प्रश्नांची उत्तरे देण्यात मदत करू शकतो.',
    help: 'मी यात मदत करू शकतो:\n• विविध पृष्ठांवर जाणे\n• लक्ष्य तयार करणे\n• तुमची प्रगती पाहणे\n• वैशिष्ट्ये समजून घेणे\n\nफक्त सांगा तुम्हाला काय करायचे आहे!',
    create_goal: 'नवीन लक्ष्य तयार करण्यासाठी:\n1. लक्ष्य पृष्ठावर जा\n2. "लक्ष्य जोडा" बटणावर क्लिक करा\n3. तुमच्या लक्ष्याची माहिती भरा\n4. लक्ष्य मूल्य आणि मुदत सेट करा\n5. मंजुरीसाठी सबमिट करा',
    check_progress: 'तुमची प्रगती पाहण्यासाठी:\n1. डॅशबोर्डावर जा\n2. प्रगती बारसह तुमची लक्ष्ये पाहा\n3. अंदाजे वर्ष-अंत स्कोर पाहा\n4. तपशीलवार रिपोर्टसाठी विश्लेषण पाहा',
    approve_goal: 'लक्ष्य मंजूर करण्यासाठी (व्यवस्थापकांसाठी):\n1. लक्ष्य पृष्ठावर जा\n2. "मंजुरी" टॅबवर क्लिक करा\n3. प्रलंबित लक्ष्यांची समीक्षा करा\n4. मंजूर करा किंवा प्रतिस्पर्धीसह परत पाठवा',
    checkin: 'चेक-इन लॉग करण्यासाठी:\n1. लक्ष्य पृष्ठावर जा\n2. तुमचे लक्ष्य शोधा\n3. चेक-इन आयकॉनवर क्लिक करा\n4. वास्तविक उपलब्धी प्रविष्ट करा\n5. स्थिति अपडेट करा',
    bulk_checkin: 'बल्क चेक-इनसाठी:\n1. लक्ष्य पृष्ठावर जा\n2. "बल्क चेक-इन" बटणावर क्लिक करा\n3. सर्व लक्ष्यांसाठी वास्तविक मूल्ये प्रविष्ट करा\n4. सर्व सेव्ह वर क्लिक करा',
    export_report: 'रिपोर्ट एक्सपोर्ट करण्यासाठी:\n1. विश्लेषण पृष्ठावर जा\n2. "रिपोर्ट एक्सपोर्ट" बटणावर क्लिक करा\n3. फॉर्मेट निवडा (CSV)\n4. तुमची रिपोर्ट डाउनलोड करा',
    language_changed: 'भाषा इंग्रजीत बदलली',
    unknown: 'मला समजले नाही. ह्यापैकी प्रयत्न करा:\n• "लक्ष्य कसे तयार करावे"\n• "डॅशबोर्डावर जावे"\n• "माझी प्रगती पाहावी"\n• "मदत"',
    quick_actions: 'तुम्ही हे कृत्ये करू शकता:',
    not_understood: 'मला समजले नाही. तुम्हाला हवे असेल:\n• डॅशबोर्डावर जाणे\n• लक्ष्यांवर जाणे\n• लक्ष्य तयार करण्यात मदत',
  },
};

const KEYWORDS: Record<Language, Record<string, string[]>> = {
  en: {
    greeting: ['hello', 'hi', 'hey', 'namaste'],
    help: ['help', 'what can you do', 'help me', 'guide', 'how does this work'],
    create_goal: ['create goal', 'new goal', 'add goal', 'make goal', 'set goal'],
    check_progress: ['check progress', 'my progress', 'view progress', 'how am i doing', 'status'],
    approve_goal: ['approve', 'approval', 'review goal', 'pending goals'],
    checkin: ['check in', 'checkin', 'update', 'log achievement', 'report'],
    bulk_checkin: ['bulk', 'batch', 'multiple', 'all at once'],
    export: ['export', 'download', 'report', 'csv'],
    dashboard: ['dashboard', 'home', 'main'],
    analytics: ['analytics', 'reports', 'charts', 'graphs'],
    language: ['language', 'english', 'hindi', 'marathi', 'change language'],
  },
  hi: {
    greeting: ['नमस्ते', 'नमस्कार', 'हाय', 'हैलो'],
    help: ['मदद', 'क्या कर सकते हो', 'मेरी मदद करो', 'गाइड', 'कैसे काम करता है'],
    create_goal: ['लक्ष्य बनाओ', 'नया लक्ष्य', 'लक्ष्य जोड़ो', 'लक्ष्य सेट करो'],
    check_progress: ['प्रगति देखो', 'मेरी प्रगति', 'स्थिति', 'कैसा चल रहा है'],
    approve_goal: ['अनुमोदन', 'स्वीकृति', 'लक्ष्य की समीक्षा'],
    checkin: ['चेक इन', 'अपडेट', 'उपलब्धि दर्ज करो'],
    bulk_checkin: ['बल्क', 'सब एक साथ', 'सभी के लिए'],
    export: ['निर्यात', 'डाउनलोड', 'रिपोर्ट'],
    dashboard: ['डैशबोर्ड', 'होम', 'मुख्य'],
    analytics: ['विश्लेषण', 'रिपोर्ट', 'चार्ट'],
    language: ['भाषा', 'अंग्रेजी', 'हिंदी', 'मराठी', 'भाषा बदलो'],
  },
  mr: {
    greeting: ['नमस्कार', 'हाय', 'हेलो'],
    help: ['मदत', 'तू काय करू शकतोस', 'मला मदत कर', 'मार्गदर्शन', 'कसे काम करते'],
    create_goal: ['लक्ष्य तयार कर', 'नवीन लक्ष्य', 'लक्ष्य जोड', 'लक्ष्य सेट कर'],
    check_progress: ['प्रगती पाहा', 'माझी प्रगती', 'स्थिति', 'कशी आहे'],
    approve_goal: ['मंजूर कर', 'मंजुरी', 'लक्ष्याची समीक्षा'],
    checkin: ['चेक इन', 'अपडेट', 'उपलब्धी नोंदव'],
    bulk_checkin: ['बल्क', 'सर्व एकदम', 'सर्वांसाठी'],
    export: ['एक्सपोर्ट', 'डाउनलोड', 'रिपोर्ट'],
    dashboard: ['डॅशबोर्ड', 'होम', 'मुख्य'],
    analytics: ['विश्लेषण', 'रिपोर्ट', 'चार्ट'],
    language: ['भाषा', 'इंग्रजी', 'हिंदी', 'मराठी', 'भाषा बदल'],
  },
};

export function useChatbot() {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    language: 'en',
    isTyping: false,
  });

  const addMessage = useCallback((role: MessageRole, content: string) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const detectIntent = useCallback((input: string): { action: string; confidence: number } => {
    const lowerInput = input.toLowerCase();
    const lang = state.language;
    const keywords = KEYWORDS[lang];

    // Check language change first
    if (keywords.language.some(k => lowerInput.includes(k))) {
      if (lowerInput.includes('english') || lowerInput.includes('अंग्रेजी') || lowerInput.includes('इंग्रजी')) {
        return { action: 'set_language_en', confidence: 1 };
      }
      if (lowerInput.includes('hindi') || lowerInput.includes('हिंदी')) {
        return { action: 'set_language_hi', confidence: 1 };
      }
      if (lowerInput.includes('marathi') || lowerInput.includes('मराठी') || lowerInput.includes('मराठी')) {
        return { action: 'set_language_mr', confidence: 1 };
      }
    }

    // Check navigation intents
    for (const intent of NAVIGATION_INTENTS) {
      const navKeywords = [
        intent.action.toLowerCase(),
        intent.label[lang].toLowerCase(),
      ];
      if (navKeywords.some(k => lowerInput.includes(k))) {
        return { action: `navigate_${intent.action}`, confidence: 0.9 };
      }
    }

    // Check action keywords
    for (const [action, words] of Object.entries(keywords)) {
      if (words.some(w => lowerInput.includes(w))) {
        return { action, confidence: 0.8 };
      }
    }

    return { action: 'unknown', confidence: 0 };
  }, [state.language]);

  const getResponse = useCallback((input: string): string => {
    const { action } = detectIntent(input);
    const lang = state.language;
    const responses = RESPONSES[lang];

    switch (action) {
      case 'set_language_en':
        setState(prev => ({ ...prev, language: 'en' }));
        return responses.language_changed;
      case 'set_language_hi':
        setState(prev => ({ ...prev, language: 'hi' }));
        return RESPONSES.hi.language_changed;
      case 'set_language_mr':
        setState(prev => ({ ...prev, language: 'mr' }));
        return RESPONSES.mr.language_changed;
      
      case 'navigate_dashboard':
      case 'navigate_goals':
      case 'navigate_analytics':
      case 'navigate_approvals':
      case 'navigate_team':
      case 'navigate_reports':
      case 'navigate_profile':
      case 'navigate_settings': {
        const route = action.replace('navigate_', '');
        const navIntent = NAVIGATION_INTENTS.find(n => n.action === route);
        return navIntent ? navIntent.label[lang] + '\n\n' + responses.quick_actions : responses.unknown;
      }
      
      case 'greeting':
        return responses.greeting;
      case 'help':
        return responses.help;
      case 'create_goal':
        return responses.create_goal;
      case 'check_progress':
        return responses.check_progress;
      case 'approve_goal':
        return responses.approve_goal;
      case 'checkin':
        return responses.checkin;
      case 'bulk_checkin':
        return responses.bulk_checkin;
      case 'export':
      case 'export_report':
        return responses.export;
      
      case 'dashboard':
      case 'analytics':
        return responses.help;
      
      default:
        return responses.unknown;
    }
  }, [detectIntent, state.language]);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim()) return;

    // Add user message
    addMessage('user', input);

    // Show typing indicator
    setState(prev => ({ ...prev, isTyping: true }));

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // Get and add response
    const response = getResponse(input);
    addMessage('bot', response);

    setState(prev => ({ ...prev, isTyping: false }));
  }, [addMessage, getResponse]);

  const setLanguage = useCallback((lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
    addMessage('bot', RESPONSES[lang].language_changed);
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  const quickReplies = useMemo((): Record<Language, string[]> => {
    return {
      en: [
        'Go to Dashboard',
        'Create a Goal',
        'Check my Progress',
        'Help',
        'Change Language',
      ],
      hi: [
        'डैशबोर्ड पर जाएं',
        'लक्ष्य बनाएं',
        'मेरी प्रगति देखें',
        'मदद',
        'भाषा बदलें',
      ],
      mr: [
        'डॅशबोर्डावर जा',
        'लक्ष्य तयार कर',
        'माझी प्रगती पाहा',
        'मदत',
        'भाषा बदल',
      ],
    };
  }, []);

  return {
    ...state,
    sendMessage,
    setLanguage,
    clearMessages,
    quickReplies: quickReplies[state.language],
    currentLanguage: state.language,
  };
}

export default useChatbot;