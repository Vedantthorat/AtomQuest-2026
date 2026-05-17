import { useState } from 'react';
import { Volume2, VolumeX, Bell, BellOff, ChevronDown, Play, Pause, Trash2 } from 'lucide-react';
import { useVoiceNotification } from '../hooks/useVoiceNotification';

export default function VoiceNotificationPanel() {
  const {
    isSupported,
    isSpeaking,
    isEnabled,
    queueLength,
    toggleEnabled,
    clearQueue,
    speak
  } = useVoiceNotification();
  
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Main Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all"
          style={{
            background: isEnabled 
              ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
              : 'linear-gradient(135deg, #6b7280, #4b5563)',
            boxShadow: isEnabled 
              ? '0 0 20px rgba(34, 197, 94, 0.4)' 
              : '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          {isEnabled ? (
            <Volume2 className="w-5 h-5 text-white" />
          ) : (
            <VolumeX className="w-5 h-5 text-white" />
          )}
          <span className="text-white font-medium text-sm">
            {isSpeaking ? 'Speaking...' : isEnabled ? 'Voice On' : 'Voice Off'}
          </span>
          {queueLength > 0 && (
            <span className="bg-white text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {queueLength}
            </span>
          )}
        </button>

        {/* Expanded Panel */}
        {isExpanded && (
          <div 
            className="absolute bottom-12 right-0 w-72 rounded-xl shadow-2xl border overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-700" style={{
              background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.2), transparent)'
            }}>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-green-500" />
                Voice Notifications
              </h3>
            </div>

            {/* Status */}
            <div className="p-3 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-gray-300 text-sm">
                    {isSpeaking ? 'Speaking...' : 'Ready'}
                  </span>
                </div>
                <button
                  onClick={toggleEnabled}
                  className="text-xs px-3 py-1 rounded-full transition-colors"
                  style={{
                    background: isEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: isEnabled ? '#22c55e' : '#ef4444',
                    border: `1px solid ${isEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}
                >
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="p-3 border-b border-gray-700">
              <p className="text-gray-400 text-xs mb-2">Test Notifications</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => speak('Your goal has been approved!', 'high')}
                  className="text-xs py-2 px-3 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                >
                  Goal Approved
                </button>
                <button
                  onClick={() => speak('Check-in is due for this quarter.', 'normal')}
                  className="text-xs py-2 px-3 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                >
                  Check-in Reminder
                </button>
                <button
                  onClick={() => speak('Alert: A goal has been escalated!', 'high')}
                  className="text-xs py-2 px-3 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                >
                  Escalation Alert
                </button>
                <button
                  onClick={() => speak('Congratulations! You have completed your goal!', 'normal')}
                  className="text-xs py-2 px-3 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
                >
                  Goal Completed
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3">
              <button
                onClick={clearQueue}
                disabled={queueLength === 0}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <Trash2 className="w-4 h-4" />
                Clear Queue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}