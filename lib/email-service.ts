export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  type: "verification" | "reset" | "reminder" | "milestone";
  content: string;
  actionUrl?: string;
  timestamp: string;
}

// Global in-memory log for development preview
const globalEmailStore = globalThis as unknown as {
  _iponEmails?: SentEmail[];
};

if (!globalEmailStore._iponEmails) {
  globalEmailStore._iponEmails = [];
}

export function getRecentEmails(emailFilter?: string): SentEmail[] {
  const emails = globalEmailStore._iponEmails || [];
  if (emailFilter) {
    return emails.filter((e) => e.to.toLowerCase() === emailFilter.toLowerCase());
  }
  return emails;
}

// Spend cap safeguard (#12): Maximum 5 outgoing emails per recipient per 24 hours
const recipientSendCounts = new Map<string, { count: number; resetTime: number }>();

function canSendToRecipient(email: string, maxPerDay: number = 5): boolean {
  const normalized = email.toLowerCase().trim();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const record = recipientSendCounts.get(normalized);

  if (!record || record.resetTime < now) {
    recipientSendCounts.set(normalized, { count: 1, resetTime: now + dayMs });
    return true;
  }

  if (record.count >= maxPerDay) {
    console.warn(`[Ipon Spend Cap] Daily email limit reached for ${normalized} (${record.count}/${maxPerDay})`);
    return false;
  }

  record.count += 1;
  return true;
}

export function clearEmails() {
  globalEmailStore._iponEmails = [];
  recipientSendCounts.clear();
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  if (!canSendToRecipient(email)) {
    return { success: false, reason: "Daily email limit reached" };
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify?token=${token}`;

  const message: SentEmail = {
    id: Math.random().toString(36).substring(2, 9),
    to: email,
    subject: "Verify your Ipon Account 💗",
    type: "verification",
    actionUrl: verifyUrl,
    content: `Hi ${name},\n\nWelcome to Ipon! Please verify your email to start building your daily savings habit:\n${verifyUrl}\n\nHappy saving! 🌸`,
    timestamp: new Date().toISOString(),
  };

  globalEmailStore._iponEmails?.unshift(message);
  console.log(`[Ipon Mailer] Verification link for ${email}: ${verifyUrl}`);
  return { success: true, verifyUrl };
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!canSendToRecipient(email)) {
    return { success: false, reason: "Daily email limit reached" };
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const message: SentEmail = {
    id: Math.random().toString(36).substring(2, 9),
    to: email,
    subject: "Reset your Ipon Password 🔒",
    type: "reset",
    actionUrl: resetUrl,
    content: `Hello,\n\nYou requested a password reset for your Ipon account. Click the link below to set a new password:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    timestamp: new Date().toISOString(),
  };

  globalEmailStore._iponEmails?.unshift(message);
  console.log(`[Ipon Mailer] Reset password link for ${email}: ${resetUrl}`);
  return { success: true, resetUrl };
}

export async function sendDailyReminderEmail(email: string, dailyGoal: number, currencySymbol: string) {
  if (!canSendToRecipient(email)) {
    return { success: false, reason: "Daily email limit reached" };
  }
  const message: SentEmail = {
    id: Math.random().toString(36).substring(2, 9),
    to: email,
    subject: "Time to save! 💗",
    type: "reminder",
    content: `Time to save! 💗\n\nDaily Goal: ${currencySymbol}${dailyGoal.toLocaleString()}\n\nEvery small peso counts towards your dreams. Open Ipon to log your daily savings today! ✨`,
    timestamp: new Date().toISOString(),
  };

  globalEmailStore._iponEmails?.unshift(message);
  console.log(`[Ipon Mailer] Reminder sent to ${email}`);
  return { success: true };
}
