export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

export interface NotificationPayload {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  event: NotificationEvent;
  data?: Record<string, string | number>;
}

export type NotificationEvent = 
  | 'goal_created'
  | 'goal_updated'
  | 'goal_approved'
  | 'goal_rejected'
  | 'goal_escalated'
  | 'login_success'
  | 'login_failed'
  | 'password_changed'
  | 'profile_updated'
  | 'team_goal_assigned'
  | 'checkin_reminder'
  | 'escalation_resolved'
  | 'account_created';

export interface NotificationTemplate {
  subject: string;
  emailBody: string;
  smsBody: string;
  whatsappBody: string;
}

const notificationTemplates: Record<NotificationEvent, NotificationTemplate> = {
  goal_created: {
    subject: '🎯 New Goal Created',
    emailBody: `Hello {{userName}},\n\nA new goal "{{goalTitle}}" has been created successfully.\n\nGoal Details:\n- Target: {{targetValue}} {{unit}}\n- Due: {{deadline}}\n- Priority: {{priority}}\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'New goal created: {{goalTitle}}. Target: {{targetValue}} {{unit}}. Due: {{deadline}}',
    whatsappBody: '🎯 *New Goal Created*\n\nHi {{userName}}! A new goal has been created for you.\n\n*Goal:* {{goalTitle}}\n*Target:* {{targetValue}} {{unit}}\n*Due:* {{deadline}}\n*Priority:* {{priority}}\n\nView in AtomQuest: /goals',
  },
  goal_updated: {
    subject: '📝 Goal Updated',
    emailBody: `Hello {{userName}},\n\nYour goal "{{goalTitle}}" has been updated.\n\nChanges:\n{{changes}}\n\nView details in AtomQuest.\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'Goal updated: {{goalTitle}}. Check details in app.',
    whatsappBody: '📝 *Goal Updated*\n\n{{userName}}, your goal has been updated.\n\n*Goal:* {{goalTitle}}\n*Changes:* {{changes}}\n\nView in AtomQuest: /goals',
  },
  goal_approved: {
    subject: '✅ Goal Approved',
    emailBody: `Hello {{userName}}! 🎉\n\nGreat news! Your goal "{{goalTitle}}" has been *APPROVED*.\n\nApproved by: {{approvedBy}}\nApproved on: {{approvedAt}}\n\nKeep up the great work!\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'Your goal "{{goalTitle}}" has been APPROVED!',
    whatsappBody: '✅ *Goal Approved!*\n\n🎉 Congratulations {{userName}}!\n\nYour goal *{{goalTitle}}* has been approved!\n\n*Approved by:* {{approvedBy}}\n*Approved on:* {{approvedAt}}\n\nKeep up the great work! 💪',
  },
  goal_rejected: {
    subject: '❌ Goal Rejected',
    emailBody: `Hello {{userName}},\n\nUnfortunately, your goal "{{goalTitle}}" has been *REJECTED*.\n\nReason: {{rejectionReason}}\n\nPlease review and resubmit with necessary changes.\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'Your goal "{{goalTitle}}" was rejected. Reason: {{rejectionReason}}',
    whatsappBody: '❌ *Goal Rejected*\n\n{{userName}}, your goal was not approved.\n\n*Goal:* {{goalTitle}}\n*Reason:* {{rejectionReason}}\n\nPlease update and resubmit.',
  },
  goal_escalated: {
    subject: '⚠️ Goal Escalated',
    emailBody: `Hello {{userName}},\n\nYour goal "{{goalTitle}}" has been escalated.\n\nEscalation Level: {{escalationLevel}}\nReason: {{escalationReason}}\n\nPlease take immediate action.\n\nBest regards,\nAtomQuest AI`,
    smsBody: '⚠️ Goal "{{goalTitle}}" escalated! Please check immediately.',
    whatsappBody: '⚠️ *Goal Escalated*\n\n{{userName}}, action required!\n\n*Goal:* {{goalTitle}}\n*Level:* {{escalationLevel}}\n*Reason:* {{escalationReason}}\n\nPlease respond immediately.',
  },
  login_success: {
    subject: '🔐 Login Successful',
    emailBody: `Hello {{userName}},\n\nWe noticed a successful login to your AtomQuest account.\n\nDetails:\n- Time: {{loginTime}}\n- Device: {{device}}\n- Location: {{location}}\n\nIf this wasn't you, please secure your account immediately.\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'Login successful to your AtomQuest account at {{loginTime}}.',
    whatsappBody: '🔐 *Login Notification*\n\n{{userName}}, you logged in successfully.\n\n*Time:* {{loginTime}}\n*Device:* {{device}}\n*Location:* {{location}}\n\nIf this wasn\'t you, secure your account!',
  },
  login_failed: {
    subject: '🔴 Login Attempt Failed',
    emailBody: `Hello {{userName}},\n\nWe detected a failed login attempt on your account.\n\nDetails:\n- Time: {{loginTime}}\n- Device: {{device}}\n- Location: {{location}}\n\nIf this wasn't you, please ignore this message.\n\nBest regards,\nAtomQuest AI`,
    smsBody: '⚠️ Failed login attempt at {{loginTime}}. If not you, reset password.',
    whatsappBody: '🔴 *Login Failed*\n\n{{userName}}, there was an unsuccessful login attempt.\n\n*Time:* {{loginTime}}\n*Device:* {{device}}\n\nIf this wasn\'t you, reset your password immediately!',
  },
  password_changed: {
    subject: '🔒 Password Changed',
    emailBody: `Hello {{userName}},\n\nYour password has been successfully changed.\n\nIf you didn't make this change, please contact support immediately.\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'Your password has been changed. If not you, contact support.',
    whatsappBody: '🔒 *Password Changed*\n\n{{userName}}, your password was updated.\n\nIf you didn\'t make this change, contact support immediately!',
  },
  profile_updated: {
    subject: '👤 Profile Updated',
    emailBody: `Hello {{userName}},\n\nYour profile has been updated successfully.\n\nChanges:\n{{changes}}\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'Your profile has been updated.',
    whatsappBody: '👤 *Profile Updated*\n\n{{userName}}, your profile was updated.\n\n*Changes:* {{changes}}',
  },
  team_goal_assigned: {
    subject: '👥 Team Goal Assigned',
    emailBody: `Hello {{userName}},\n\nA new team goal has been assigned to you.\n\nGoal: {{goalTitle}}\nTeam Lead: {{teamLead}}\nDeadline: {{deadline}}\n\nView in AtomQuest.\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'New team goal assigned: {{goalTitle}}. Due: {{deadline}}',
    whatsappBody: '👥 *Team Goal Assigned*\n\n{{userName}}, you have a new team goal!\n\n*Goal:* {{goalTitle}}\n*Lead:* {{teamLead}}\n*Due:* {{deadline}}\n\nView in AtomQuest: /goals',
  },
  checkin_reminder: {
    subject: '⏰ Check-in Reminder',
    emailBody: `Hello {{userName}},\n\nThis is a friendly reminder to complete your quarterly check-in.\n\nGoals pending check-in:\n{{pendingGoals}}\n\nPlease complete your check-in before {{deadline}}.\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'Reminder: Complete your goal check-in before {{deadline}}',
    whatsappBody: '⏰ *Check-in Reminder*\n\n{{userName}}, don\'t forget to complete your quarterly check-in!\n\nPending goals: {{pendingGoals}}\n\n*Due:* {{deadline}}\n\nCheck in now: /goals',
  },
  escalation_resolved: {
    subject: '✅ Escalation Resolved',
    emailBody: `Hello {{userName}},\n\nThe escalation for "{{goalTitle}}" has been resolved.\n\nResolution: {{resolution}}\n\nBest regards,\nAtomQuest AI`,
    smsBody: 'Escalation resolved for "{{goalTitle}}".',
    whatsappBody: '✅ *Escalation Resolved*\n\n{{userName}}, the issue with *{{goalTitle}}* has been resolved.\n\n*Resolution:* {{resolution}}\n\nThank you for your prompt action!',
  },
  account_created: {
    subject: '🎉 Welcome to AtomQuest AI!',
    emailBody: `Hello {{userName}}! 🎉\n\nWelcome to AtomQuest AI! Your account has been created successfully.\n\nAccount Details:\n- Email: {{userEmail}}\n- Role: {{role}}\n- Created: {{createdAt}}\n\nGet started by setting up your profile and creating your first goal!\n\nBest regards,\nAtomQuest AI Team`,
    smsBody: 'Welcome to AtomQuest AI! Your account has been created successfully.',
    whatsappBody: '🎉 *Welcome to AtomQuest AI!*\n\nHello {{userName}}! Your account has been created successfully.\n\n*Account Details:*\n📧 Email: {{userEmail}}\n👤 Role: {{role}\n📅 Created: {{createdAt}}\n\nStart achieving your goals today! 🚀',
  },
};

class NotificationService {
  private isEnabled = true;
  private enabledChannels: NotificationChannel[] = ['email', 'sms', 'whatsapp'];

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  setChannels(channels: NotificationChannel[]) {
    this.enabledChannels = channels;
  }

  private replaceVariables(template: string, data: Record<string, string | number>): string {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    return result;
  }

  async sendNotification(payload: NotificationEvent, data: Record<string, string | number>): Promise<{ success: boolean; message: string }> {
    if (!this.isEnabled) {
      return { success: false, message: 'Notifications disabled' };
    }

    const template = notificationTemplates[payload];
    if (!template) {
      return { success: false, message: 'Unknown notification event' };
    }

    const userName = data.userName as string || 'User';
    const userEmail = data.userEmail as string || '';
    const userPhone = data.userPhone as string || '';

    console.log('📧 Sending notifications...');

    const results = [];

    if (this.enabledChannels.includes('email') && userEmail) {
      const emailContent = this.replaceVariables(template.emailBody, { ...data, userName });
      console.log(`📧 Email to ${userEmail}:`, {
        subject: template.subject,
        body: emailContent
      });
      results.push({ channel: 'email', success: true });
    }

    if (this.enabledChannels.includes('sms') && userPhone) {
      const smsContent = this.replaceVariables(template.smsBody, { ...data, userName });
      console.log(`📱 SMS to ${userPhone}:`, smsContent);
      results.push({ channel: 'sms', success: true });
    }

    if (this.enabledChannels.includes('whatsapp') && userPhone) {
      const whatsappContent = this.replaceVariables(template.whatsappBody, { ...data, userName });
      console.log(`💬 WhatsApp to ${userPhone}:`, whatsappContent);
      results.push({ channel: 'whatsapp', success: true });
    }

    const successCount = results.filter(r => r.success).length;
    return {
      success: successCount > 0,
      message: `Sent via ${successCount} channel(s)`
    };
  }

  async notifyGoalCreated(data: Record<string, string | number>) {
    return this.sendNotification('goal_created', data);
  }

  async notifyGoalApproved(data: Record<string, string | number>) {
    return this.sendNotification('goal_approved', data);
  }

  async notifyGoalRejected(data: Record<string, string | number>) {
    return this.sendNotification('goal_rejected', data);
  }

  async notifyGoalEscalated(data: Record<string, string | number>) {
    return this.sendNotification('goal_escalated', data);
  }

  async notifyLoginSuccess(data: Record<string, string | number>) {
    return this.sendNotification('login_success', data);
  }

  async notifyLoginFailed(data: Record<string, string | number>) {
    return this.sendNotification('login_failed', data);
  }

  async notifyPasswordChanged(data: Record<string, string | number>) {
    return this.sendNotification('password_changed', data);
  }

  async notifyProfileUpdated(data: Record<string, string | number>) {
    return this.sendNotification('profile_updated', data);
  }

  async notifyTeamGoalAssigned(data: Record<string, string | number>) {
    return this.sendNotification('team_goal_assigned', data);
  }

  async notifyCheckinReminder(data: Record<string, string | number>) {
    return this.sendNotification('checkin_reminder', data);
  }

  async notifyEscalationResolved(data: Record<string, string | number>) {
    return this.sendNotification('escalation_resolved', data);
  }

  async notifyAccountCreated(data: Record<string, string | number>) {
    return this.sendNotification('account_created', data);
  }
}

export const notificationService = new NotificationService();
export default notificationService;