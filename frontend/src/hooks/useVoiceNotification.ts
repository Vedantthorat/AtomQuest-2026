import { useState, useCallback, useEffect } from 'react';

interface VoiceNotificationOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface NotificationQueue {
  id: string;
  message: string;
  priority: 'high' | 'normal' | 'low';
  timestamp: Date;
}

export function useVoiceNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [queue, setQueue] = useState<NotificationQueue[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        const preferredVoice = availableVoices.find(v => 
          v.name.includes('Google') || v.name.includes('Samantha')
        ) || availableVoices[0];
        setVoice(preferredVoice);
      };

      loadVoices();
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((message: string, priority: 'high' | 'normal' | 'low' = 'normal') => {
    if (!isSupported || !isEnabled) return;

    const notification: NotificationQueue = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      priority,
      timestamp: new Date()
    };

    if (priority === 'high') {
      setQueue(prev => [notification, ...prev]);
    } else {
      setQueue(prev => [...prev, notification]);
    }
  }, [isSupported, isEnabled]);

  useEffect(() => {
    if (!isSupported || queue.length === 0 || isSpeaking) return;

    const processQueue = () => {
      const nextNotification = queue[0];
      if (!nextNotification) return;

      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(nextNotification.message);
      utterance.voice = voice;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (voice && voice.lang.startsWith('en')) {
        utterance.lang = 'en-US';
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        setQueue(prev => prev.slice(1));
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setQueue(prev => prev.slice(1));
      };

      window.speechSynthesis.speak(utterance);
    };

    const timeoutId = setTimeout(processQueue, isSpeaking ? 0 : 500);
    return () => clearTimeout(timeoutId);
  }, [isSupported, queue, isSpeaking, voice]);

  const notifyGoalApproved = useCallback((goalTitle: string) => {
    speak(`Goal "${goalTitle}" has been approved.`, 'high');
  }, [speak]);

  const notifyGoalRejected = useCallback((goalTitle: string, reason: string) => {
    speak(`Goal "${goalTitle}" has been rejected. Reason: ${reason}`, 'high');
  }, [speak]);

  const notifyCheckInDue = useCallback((quarter: string) => {
    speak(`Check-in is due for ${quarter}. Please complete your goal check-in.`, 'normal');
  }, [speak]);

  const notifyEscalation = useCallback((goalTitle: string, level: string) => {
    speak(`Alert: Goal "${goalTitle}" has been escalated to ${level} level.`, 'high');
  }, [speak]);

  const notifyGoalCompleted = useCallback((goalTitle: string) => {
    speak(`Congratulations! Goal "${goalTitle}" has been completed.`, 'normal');
  }, [speak]);

  const notifyDeadlineApproaching = useCallback((goalTitle: string, daysLeft: number) => {
    speak(`Reminder: Goal "${goalTitle}" deadline is approaching. ${daysLeft} days remaining.`, 'normal');
  }, [speak]);

  const notifyManagerAssigned = useCallback((employeeName: string) => {
    speak(`You have been assigned a new employee: ${employeeName}.`, 'normal');
  }, [speak]);

  const notifyQuarterEnd = useCallback((quarter: string) => {
    speak(`${quarter} quarter has ended. Please review your goals and prepare for the next quarter.`, 'normal');
  }, [speak]);

  const notifySystemUpdate = useCallback((message: string) => {
    speak(message, 'low');
  }, [speak]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    window.speechSynthesis.cancel();
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      if (!prev) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  }, []);

  return {
    isSupported,
    isSpeaking,
    isEnabled,
    queueLength: queue.length,
    voices,
    currentVoice: voice,
    setVoice,
    speak,
    notifyGoalApproved,
    notifyGoalRejected,
    notifyCheckInDue,
    notifyEscalation,
    notifyGoalCompleted,
    notifyDeadlineApproaching,
    notifyManagerAssigned,
    notifyQuarterEnd,
    notifySystemUpdate,
    clearQueue,
    toggleEnabled,
    setEnabled: setIsEnabled
  };
}

export default useVoiceNotification;