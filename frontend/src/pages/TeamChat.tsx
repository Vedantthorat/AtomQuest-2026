import { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Search, Paperclip, Image as ImageIcon, Phone, Video, Info, MoreVertical, Star, Check, CheckCheck, Smile, X, Archive, Pin, Trash2, Reply, Forward, Hash, Bell, BellOff, Settings, Users, MessageCircle, Plus, Folder, FileText, Mic, VideoOff, MicOff, Clock, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface Message {
  id: string;
  senderId: string;
  sender: { id: string; name: string; avatar: string; role: string };
  content: string;
  createdAt: string;
  isRead: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  attachments?: { name: string; type: string; size: string }[];
  replyTo?: string;
}

interface Conversation {
  id: string;
  otherUser?: { id: string; name: string; avatar: string; role: string; department?: string; status?: string };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isStarred?: boolean;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  members: number;
  unread: number;
  isPrivate: boolean;
  lastActivity: string;
}

const sampleConversations: Conversation[] = [
  { id: 'user1', otherUser: { id: 'user1', name: 'John Smith', avatar: '', role: 'MANAGER', department: 'Sales', status: 'online' }, lastMessage: 'Please review the Q1 targets', lastMessageTime: '2026-05-16T10:30:00Z', unreadCount: 2, isPinned: true },
  { id: 'user2', otherUser: { id: 'user2', name: 'Sarah Johnson', avatar: '', role: 'EMPLOYEE', department: 'Marketing', status: 'online' }, lastMessage: 'Goal update: 80% complete!', lastMessageTime: '2026-05-15T15:45:00Z', unreadCount: 0 },
  { id: 'user3', otherUser: { id: 'user3', name: 'Mike Williams', avatar: '', role: 'EMPLOYEE', department: 'Engineering', status: 'away' }, lastMessage: 'Thanks for the feedback', lastMessageTime: '2026-05-14T09:20:00Z', unreadCount: 0 },
  { id: 'user4', otherUser: { id: 'user4', name: 'Emily Davis', avatar: '', role: 'MANAGER', department: 'HR', status: 'offline' }, lastMessage: 'Team meeting at 3 PM', lastMessageTime: '2026-05-13T14:00:00Z', unreadCount: 1, isStarred: true },
  { id: 'user5', otherUser: { id: 'user5', name: 'David Brown', avatar: '', role: 'EMPLOYEE', department: 'Finance', status: 'online' }, lastMessage: 'Budget report ready', lastMessageTime: '2026-05-12T11:30:00Z', unreadCount: 0 },
  { id: 'user6', otherUser: { id: 'user6', name: 'Lisa Anderson', avatar: '', role: 'EMPLOYEE', department: 'Operations', status: 'online' }, lastMessage: 'Process optimization ideas', lastMessageTime: '2026-05-10T16:00:00Z', unreadCount: 0 },
];

const channels: Channel[] = [
  { id: 'ch1', name: 'general', description: 'General team discussions', members: 45, unread: 3, isPrivate: false, lastActivity: '2026-05-16T10:00:00Z' },
  { id: 'ch2', name: 'goals', description: 'Goal tracking and updates', members: 32, unread: 0, isPrivate: false, lastActivity: '2026-05-15T15:00:00Z' },
  { id: 'ch3', name: 'sales-team', description: 'Sales department only', members: 12, unread: 5, isPrivate: true, lastActivity: '2026-05-16T09:30:00Z' },
  { id: 'ch4', name: 'announcements', description: 'Company announcements', members: 50, unread: 1, isPrivate: false, lastActivity: '2026-05-14T12:00:00Z' },
];

const sampleMessages: Message[] = [
  { id: 'm1', senderId: 'user1', sender: { id: 'user1', name: 'John Smith', avatar: '', role: 'MANAGER' }, content: 'Hi! Can you update me on the sales goal progress?', createdAt: '2026-05-16T10:00:00Z', isRead: true },
  { id: 'm2', senderId: 'me', sender: { id: 'me', name: 'You', avatar: '', role: 'EMPLOYEE' }, content: 'Sure! We are at 65% progress. On track to exceed targets.', createdAt: '2026-05-16T10:15:00Z', isRead: true },
  { id: 'm3', senderId: 'user1', sender: { id: 'user1', name: 'John Smith', avatar: '', role: 'MANAGER' }, content: 'Great work! Keep it up. Let me know if you need any support. Also, don\'t forget about the team meeting tomorrow at 10 AM.', createdAt: '2026-05-16T10:30:00Z', isRead: false, reactions: [{ emoji: '👍', count: 1, users: ['me'] }] },
  { id: 'm4', senderId: 'me', sender: { id: 'me', name: 'You', avatar: '', role: 'EMPLOYEE' }, content: 'Thanks! I\'ll prepare the status report for the meeting.', createdAt: '2026-05-16T10:45:00Z', isRead: true },
  { id: 'm5', senderId: 'user1', sender: { id: 'user1', name: 'John Smith', avatar: '', role: 'MANAGER' }, content: 'Perfect. Also, I noticed your customer satisfaction goal is at 75%. Great momentum!', createdAt: '2026-05-16T11:00:00Z', isRead: true, attachments: [{ name: 'Q1_Report.pdf', type: 'pdf', size: '2.4 MB' }] },
];

const teamMembers = [
  { id: '1', name: 'John Smith', role: 'MANAGER', department: 'Sales', email: 'john@company.com', status: 'online', goals: 5, completed: 3 },
  { id: '2', name: 'Sarah Johnson', role: 'EMPLOYEE', department: 'Marketing', email: 'sarah@company.com', status: 'online', goals: 4, completed: 2 },
  { id: '3', name: 'Mike Williams', role: 'EMPLOYEE', department: 'Engineering', email: 'mike@company.com', status: 'away', goals: 6, completed: 4 },
  { id: '4', name: 'Emily Davis', role: 'MANAGER', department: 'HR', email: 'emily@company.com', status: 'offline', goals: 3, completed: 2 },
  { id: '5', name: 'David Brown', role: 'EMPLOYEE', department: 'Finance', email: 'david@company.com', status: 'online', goals: 4, completed: 1 },
  { id: '6', name: 'Lisa Anderson', role: 'EMPLOYEE', department: 'Operations', email: 'lisa@company.com', status: 'online', goals: 5, completed: 3 },
];

const quickEmojis = ['👍', '❤️', '😂', '🎉', '🚀', '👀', '🔥', '💯'];

export default function TeamChat() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [selectedChat, setSelectedChat] = useState<string | null>('user1');
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'channels' | 'members'>('chats');
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const msg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      sender: { id: user?.id || 'me', name: user?.name || 'You', avatar: user?.avatar || '', role: user?.role || 'EMPLOYEE' },
      content: newMessage,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existing = msg.reactions?.find(r => r.emoji === emoji);
        if (existing) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, 'me'] } : r)
          };
        }
        return {
          ...msg,
          reactions: [...(msg.reactions || []), { emoji, count: 1, users: ['me'] }]
        };
      }
      return msg;
    }));
    setShowEmojiPicker(false);
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const currentConversation = conversations.find(c => c.id === selectedChat);

  const filteredConversations = conversations.filter(c => 
    !c.isArchived && c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 border-r border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Team Chat</h2>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]">
              <Settings size={18} />
            </button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chats' ? 'bg-primary-500 text-white' : 'bg-[var(--muted)] text-[var(--foreground)]'}`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'channels' ? 'bg-primary-500 text-white' : 'bg-[var(--muted)] text-[var(--foreground)]'}`}
            >
              Channels
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'members' ? 'bg-primary-500 text-white' : 'bg-[var(--muted)] text-[var(--foreground)]'}`}
            >
              Members
            </button>
          </div>
          
          {(activeTab === 'chats' || activeTab === 'channels') && (
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder={activeTab === 'chats' ? "Search conversations..." : "Search channels..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 text-sm"
              />
            </div>
          )}
        </div>

        {activeTab === 'channels' ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 border-b border-[var(--border)]">
              <button className="w-full py-2 px-3 bg-primary-500/10 text-primary-500 rounded-lg flex items-center gap-2 hover:bg-primary-500/20">
                <Plus size={16} /> Create Channel
              </button>
            </div>
            {channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(channel => (
              <div
                key={channel.id}
                onClick={() => { setSelectedChannel(channel); setSelectedChat(channel.id); }}
                className={`p-4 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--muted)] ${selectedChannel?.id === channel.id ? 'bg-primary-500/10 border-l-4 border-l-primary-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                    {channel.isPrivate ? <Lock size={18} className="text-[var(--muted-foreground)]" /> : <Hash size={18} className="text-[var(--muted-foreground)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--foreground)]">{channel.name}</span>
                      {channel.unread > 0 && (
                        <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{channel.unread}</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">{channel.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1"><Users size={12} /> {channel.members}</span>
                  <span>{channel.isPrivate ? 'Private' : 'Public'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'members' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="p-3 bg-[var(--muted)] rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[var(--border)]">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                    {member.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--muted)] ${
                    member.status === 'online' ? 'bg-green-500' : member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--foreground)]">{member.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${member.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-500'}`}>
                      {member.role}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">{member.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--muted-foreground)]">Goals</div>
                  <div className="text-sm font-medium text-[var(--foreground)]">{member.completed}/{member.goals}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`p-4 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--muted)] ${selectedChat === conv.id ? 'bg-primary-500/10 border-l-4 border-l-primary-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {conv.otherUser?.name.charAt(0)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--card)] ${
                      conv.otherUser?.role === 'MANAGER' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--foreground)] truncate">{conv.otherUser?.name}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{formatMessageTime(conv.lastMessageTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--muted-foreground)] truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-1">
                        {conv.isPinned && <Pin size={12} className="text-primary-500" />}
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">{conv.otherUser?.department}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat && (currentConversation || selectedChannel) ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {currentConversation?.otherUser?.name.charAt(0) || selectedChannel?.name.charAt(0)}
                  </div>
                  {currentConversation?.otherUser?.status && (
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--card)] ${
                      currentConversation.otherUser.status === 'online' ? 'bg-green-500' : 
                      currentConversation.otherUser.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--foreground)]">{currentConversation?.otherUser?.name || '#' + selectedChannel?.name}</h3>
                    {currentConversation && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${currentConversation.otherUser?.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {currentConversation.otherUser?.role}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {currentConversation?.otherUser?.department || `${selectedChannel?.members} members`}
                    {isTyping && currentConversation && ' • Typing...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedChannel && (
                  <>
                    <button onClick={() => setIsMuted(!isMuted)} className={`p-2 hover:bg-[var(--muted)] rounded-lg ${isMuted ? 'text-red-500' : 'text-[var(--muted-foreground)]'}`} title={isMuted ? "Unmute" : "Mute"}>
                      {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
                    </button>
                  </>
                )}
                <button className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]" title="Voice Call">
                  <Phone size={18} />
                </button>
                <button className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]" title="Video Call">
                  <Video size={18} />
                </button>
                <button onClick={() => setShowChatInfo(!showChatInfo)} className={`p-2 hover:bg-[var(--muted)] rounded-lg ${showChatInfo ? 'bg-[var(--muted)] text-primary-500' : 'text-[var(--muted-foreground)]'}`} title="Info">
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Message Search */}
            <div className="px-4 py-2 border-b border-[var(--border)]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.filter(m => !messageSearch || m.content.toLowerCase().includes(messageSearch.toLowerCase())).map((msg, index) => {
                const isOwn = msg.senderId === 'me' || msg.senderId === user?.id;
                const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
                
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {showAvatar && !isOwn && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {msg.sender.name.charAt(0)}
                        </div>
                      )}
                      {!showAvatar && !isOwn && <div className="w-8 flex-shrink-0"></div>}
                      
                      <div className={`relative group ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl ${
                          isOwn 
                            ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-br-none' 
                            : 'bg-[var(--muted)] text-[var(--foreground)] rounded-bl-none'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          <span className={`text-xs ${isOwn ? 'text-white/60' : 'text-[var(--muted-foreground)]'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            msg.isRead ? <CheckCheck size={14} className="text-blue-400" /> : <Check size={14} className="text-white/60" />
                          )}
                        </div>
                        
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                            {msg.reactions.map((r, i) => (
                              <button 
                                key={i} 
                                onClick={() => addReaction(msg.id, r.emoji)}
                                className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded-full hover:bg-[var(--border)]"
                              >
                                {r.emoji} {r.count}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message Actions */}
                        <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                          <button className="p-1.5 bg-[var(--card)] rounded-full shadow hover:bg-[var(--muted)]" title="React">
                            <Smile size={14} />
                          </button>
                          <button className="p-1.5 bg-[var(--card)] rounded-full shadow hover:bg-[var(--muted)]" title="Reply">
                            <Reply size={14} />
                          </button>
                          <button className="p-1.5 bg-[var(--card)] rounded-full shadow hover:bg-[var(--muted)]" title="More">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[var(--border)]">
              {/* Quick Emoji Bar */}
              <div className="flex items-center gap-1 mb-3">
                {quickEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewMessage(newMessage + emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[var(--muted)] rounded-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]"
                >
                  <Smile size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]" 
                    title="Attach file"
                  >
                    <Paperclip size={18} />
                  </button>
                  {showAttachMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg p-2 min-w-[160px]">
                      <button className="w-full flex items-center gap-2 p-2 hover:bg-[var(--muted)] rounded-lg text-sm text-[var(--foreground)]">
                        <Folder size={16} className="text-blue-500" /> Document
                      </button>
                      <button className="w-full flex items-center gap-2 p-2 hover:bg-[var(--muted)] rounded-lg text-sm text-[var(--foreground)]">
                        <ImageIcon size={16} className="text-green-500" /> Image
                      </button>
                      <button className="w-full flex items-center gap-2 p-2 hover:bg-[var(--muted)] rounded-lg text-sm text-[var(--foreground)]">
                        <FileText size={16} className="text-orange-500" /> File
                      </button>
                    </div>
                  )}
                </div>
                <button className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]" title="Record voice">
                  <Mic size={18} />
                </button>
                <button className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]" title="Schedule message">
                  <Clock size={18} />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 input"
                />
                <button onClick={sendMessage} className="btn-primary px-4">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--muted-foreground)]">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Chat Info */}
      {showChatInfo && selectedChat && currentConversation && (
        <div className="w-72 border-l border-[var(--border)] p-4 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              {currentConversation.otherUser?.name.charAt(0)}
            </div>
            <h3 className="font-semibold text-[var(--foreground)]">{currentConversation.otherUser?.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{currentConversation.otherUser?.department}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${currentConversation.otherUser?.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-500'}`}>
              {currentConversation.otherUser?.role}
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-[var(--muted)] rounded-lg">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Email</div>
              <div className="text-sm text-[var(--foreground)]">{currentConversation.otherUser?.name.toLowerCase().replace(' ', '.')}@company.com</div>
            </div>

            <div className="p-3 bg-[var(--muted)] rounded-lg">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Shared Files</div>
              <div className="text-sm text-[var(--foreground)]">No files shared yet</div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-[var(--muted)] rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--border)] flex items-center justify-center gap-1">
                <Pin size={14} /> Pin
              </button>
              <button className="flex-1 py-2 bg-[var(--muted)] rounded-lg text-sm text-red-500 hover:bg-red-500/10 flex items-center justify-center gap-1">
                <Archive size={14} /> Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}