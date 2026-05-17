interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, body, html } = options;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(50));
    console.log('📧 EMAIL (Dev Mode - Not Actually Sent)');
    console.log('='.repeat(50));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    if (html) console.log(`HTML: ${html.slice(0, 100)}...`);
    console.log('='.repeat(50));
    return true;
  }

  const emailServiceUrl = process.env.EMAIL_SERVICE_URL;
  if (!emailServiceUrl) {
    console.warn('Email service not configured. Set EMAIL_SERVICE_URL in production.');
    return false;
  }

  try {
    const response = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body, html })
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendGoalApprovalEmail(employeeEmail: string, employeeName: string, goalTitle: string, managerName: string): Promise<boolean> {
  return sendEmail({
    to: employeeEmail,
    subject: `Your goal "${goalTitle}" has been approved`,
    body: `Hi ${employeeName},\n\nYour goal "${goalTitle}" has been approved by ${managerName}.\n\nBest regards,\nAtomQuest AI Team`,
    html: `<h2>Goal Approved</h2><p>Hi ${employeeName},</p><p>Your goal "<strong>${goalTitle}</strong>" has been approved by ${managerName}.</p><p>Best regards,<br/>AtomQuest AI Team</p>`
  });
}

export async function sendGoalRejectionEmail(employeeEmail: string, employeeName: string, goalTitle: string, reason: string): Promise<boolean> {
  return sendEmail({
    to: employeeEmail,
    subject: `Your goal "${goalTitle}" needs revision`,
    body: `Hi ${employeeName},\n\nYour goal "${goalTitle}" has been returned for revision.\n\nReason: ${reason}\n\nPlease update your goal and resubmit.\n\nBest regards,\nAtomQuest AI Team`,
    html: `<h2>Goal Returned</h2><p>Hi ${employeeName},</p><p>Your goal "<strong>${goalTitle}</strong>" has been returned for revision.</p><p><strong>Reason:</strong> ${reason}</p><p>Please update your goal and resubmit.</p><p>Best regards,<br/>AtomQuest AI Team</p>`
  });
}

export async function sendGoalSubmissionEmail(managerEmail: string, managerName: string, employeeName: string, goalCount: number): Promise<boolean> {
  return sendEmail({
    to: managerEmail,
    subject: `${employeeName} submitted ${goalCount} goal(s) for approval`,
    body: `Hi ${managerName},\n\n${employeeName} has submitted ${goalCount} goal(s) for your review and approval.\n\nPlease log in to AtomQuest AI to review the submissions.\n\nBest regards,\nAtomQuest AI Team`,
    html: `<h2>New Goals Submitted</h2><p>Hi ${managerName},</p><p><strong>${employeeName}</strong> has submitted <strong>${goalCount} goal(s)</strong> for your review and approval.</p><p>Please log in to AtomQuest AI to review the submissions.</p><p>Best regards,<br/>AtomQuest AI Team</p>`
  });
}