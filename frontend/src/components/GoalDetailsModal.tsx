import { useState, useEffect } from 'react';
import { X, Paperclip, MessageSquare, Repeat, Calendar, Clock, CheckCircle, AlertCircle, Send, FileText, Image as ImageIcon, Download, Trash2, MoreVertical, ThumbsUp, Reply, Edit, Lock, Unlock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

interface Comment {
  id: string;
  userId: string;
  user: { id: string; name: string; avatar: string; role: string };
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface RecurringGoal {
  id: string;
  recurrence: string;
  nextDueDate: string;
  endDate?: string;
  isActive: boolean;
}

interface GoalDetailsModalProps {
  goalId: string;
  onClose: () => void;
}

export default function GoalDetailsModal({ goalId, onClose }: GoalDetailsModalProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'attachments' | 'comments' | 'recurring' | 'history'>('overview');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [recurring, setRecurring] = useState<RecurringGoal | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadGoalDetails();
  }, [goalId]);

  const loadGoalDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [attachRes, commentRes, recurringRes] = await Promise.all([
        fetch(`/api/attachments/goals/${goalId}/attachments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/comments/goals/${goalId}/comments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/recurring/goals/${goalId}/recurring`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const attachmentsData = await attachRes.json();
      const commentsData = await commentRes.json();
      const recurringData = await recurringRes.json();

      setAttachments(attachmentsData);
      setComments(commentsData);
      if (recurringData) setRecurring(recurringData);
    } catch (error) {
      console.error('Error loading goal details:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/attachments/goals/${goalId}/attachments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          fileType: file.type,
          fileSize: file.size
        })
      });

      if (response.ok) {
        loadGoalDetails();
      }
    } catch (error) {
      console.error('Error uploading attachment:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    if (!confirm('Delete this attachment?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/attachments/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadGoalDetails();
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/comments/goals/${goalId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });
      setNewComment('');
      loadGoalDetails();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const setupRecurring = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/recurring/goals/${goalId}/recurring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recurrence: 'WEEKLY',
          endDate: null
        })
      });
      loadGoalDetails();
    } catch (error) {
      console.error('Error setting up recurring:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={18} />;
    return <FileText size={18} />;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'attachments', label: `Attachments (${attachments.length})`, icon: Paperclip },
    { id: 'comments', label: `Comments (${comments.length})`, icon: MessageSquare },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'history', label: 'History', icon: Clock }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Goal Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-[var(--border)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary-500 text-primary-500'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-[var(--muted-foreground)]">Loading...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--muted)] rounded-lg">
                      <div className="text-sm text-[var(--muted-foreground)] mb-1">Progress</div>
                      <div className="text-2xl font-bold text-primary-500">75%</div>
                      <div className="w-full bg-[var(--border)] rounded-full h-2 mt-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--muted)] rounded-lg">
                      <div className="text-sm text-[var(--muted-foreground)] mb-1">Status</div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-green-500 text-white text-sm">APPROVED</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--foreground)] mb-2">Description</h4>
                    <p className="text-[var(--muted-foreground)]">Goal description goes here...</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-[var(--muted-foreground)]">Weightage</div>
                      <div className="font-medium text-[var(--foreground)]">20%</div>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--muted-foreground)]">Thrust Area</div>
                      <div className="font-medium text-[var(--foreground)]">Revenue</div>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--muted-foreground)]">Quarter</div>
                      <div className="font-medium text-[var(--foreground)]">Q1 2026</div>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--muted-foreground)]">Priority</div>
                      <div className="font-medium text-[var(--foreground)]">HIGH</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[var(--foreground)]">Files & Documents</h4>
                    <label className="btn-primary cursor-pointer flex items-center gap-2">
                      <Paperclip size={16} />
                      Add File
                      <input type="file" className="hidden" onChange={uploadAttachment} disabled={uploading} />
                    </label>
                  </div>

                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary-500/20 flex items-center justify-center text-primary-500">
                              {getFileIcon(att.fileType)}
                            </div>
                            <div>
                              <div className="font-medium text-[var(--foreground)]">{att.fileName}</div>
                              <div className="text-xs text-[var(--muted-foreground)]">
                                {formatFileSize(att.fileSize)} • {formatDate(att.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-[var(--border)] rounded" title="Download">
                              <Download size={16} />
                            </button>
                            <button onClick={() => deleteAttachment(att.id)} className="p-2 hover:bg-[var(--border)] rounded text-red-500" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--muted-foreground)]">
                      <Paperclip size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No attachments yet</p>
                      <p className="text-sm">Upload files, documents, or images related to this goal</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="input flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && postComment()}
                    />
                    <button onClick={postComment} className="btn-primary">
                      <Send size={18} />
                    </button>
                  </div>

                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map(comment => (
                        <div key={comment.id} className="p-4 bg-[var(--muted)] rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm">
                              {comment.user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-[var(--foreground)]">{comment.user.name}</div>
                              <div className="text-xs text-[var(--muted-foreground)]">{comment.user.role} • {formatDate(comment.createdAt)}</div>
                            </div>
                          </div>
                          <p className="text-[var(--foreground)] ml-11">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2 ml-11">
                            <button className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 hover:text-primary-500">
                              <ThumbsUp size={14} /> Like
                            </button>
                            <button className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 hover:text-primary-500">
                              <Reply size={14} /> Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--muted-foreground)]">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No comments yet</p>
                      <p className="text-sm">Start a discussion about this goal</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recurring' && (
                <div className="space-y-4">
                  {recurring ? (
                    <div className="p-4 bg-[var(--muted)] rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                            <Repeat size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-[var(--foreground)]">Recurring Goal</div>
                            <div className="text-sm text-[var(--muted-foreground)]">Automatically generates new goals</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm ${recurring.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                          {recurring.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-[var(--muted-foreground)]">Recurrence</div>
                          <div className="font-medium text-[var(--foreground)] capitalize">{recurring.recurrence.toLowerCase()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-[var(--muted-foreground)]">Next Due Date</div>
                          <div className="font-medium text-[var(--foreground)]">{formatDate(recurring.nextDueDate)}</div>
                        </div>
                        {recurring.endDate && (
                          <div>
                            <div className="text-sm text-[var(--muted-foreground)]">End Date</div>
                            <div className="font-medium text-[var(--foreground)]">{formatDate(recurring.endDate)}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button className="btn-secondary flex items-center gap-2">
                          <Edit size={16} /> Edit Schedule
                        </button>
                        <button className={`btn-secondary flex items-center gap-2 ${recurring.isActive ? 'text-orange-500' : 'text-green-500'}`}>
                          {recurring.isActive ? <><Lock size={16} /> Pause</> : <><Unlock size={16} /> Resume</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--muted-foreground)]">
                      <Repeat size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No recurring schedule</p>
                      <p className="text-sm mb-4">Set up automatic goal generation</p>
                      <button onClick={setupRecurring} className="btn-primary">
                        Set Up Recurring Goal
                      </button>
                    </div>
                  )}

                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <h4 className="font-medium text-[var(--foreground)] mb-3">Recurrence Options</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map(type => (
                        <button key={type} className="p-3 bg-[var(--card)] rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--border)]">
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <CheckCircle size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[var(--foreground)]">Goal Approved</div>
                        <div className="text-xs text-[var(--muted-foreground)]">Approved by Manager</div>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Jan 15, 2026</div>
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white">
                        <AlertCircle size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[var(--foreground)]">Goal Submitted</div>
                        <div className="text-xs text-[var(--muted-foreground)]">Submitted for approval</div>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Jan 10, 2026</div>
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <FileText size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[var(--foreground)]">Goal Created</div>
                        <div className="text-xs text-[var(--muted-foreground)]">Initial goal created</div>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Jan 5, 2026</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}