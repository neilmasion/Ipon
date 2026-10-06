import Mailgun from "mailgun.js";
import FormData from "form-data";

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

// ---------------------------------------------------------------------------
// Mailgun Transport
// ---------------------------------------------------------------------------
function getMailgunClient() {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    return null;
  }

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: apiKey,
    // If using EU region, uncomment below:
    // url: "https://api.eu.mailgun.net",
  });

  return { mg, domain };
}

/**
 * Sends an email via Mailgun in production, or logs to in-memory store in dev.
 */
async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
  emailRecord: SentEmail
): Promise<{ success: boolean; reason?: string }> {
  // Always store in dev preview
  globalEmailStore._iponEmails?.unshift(emailRecord);

  const mailgun = getMailgunClient();
  const fromAddress = process.env.MAILGUN_FROM || "Ipon Savings <noreply@ipon.app>";

  if (mailgun) {
    // Production: send real email via Mailgun
    try {
      await mailgun.mg.messages.create(mailgun.domain, {
        from: fromAddress,
        to: [to],
        subject,
        text,
        html,
      });
      console.log(`[Ipon Mailer] Email sent to ${to}: "${subject}"`);
      return { success: true };
    } catch (err: any) {
      console.error(`[Ipon Mailer] Failed to send email to ${to}:`, err?.message || err);
      return { success: false, reason: err?.message || "Mailgun send failed" };
    }
  } else {
    // Development: just log
    console.log(`[Ipon Mailer][DEV] ${subject} → ${to}`);
    return { success: true };
  }
}

// ---------------------------------------------------------------------------
// HTML Email Templates
// ---------------------------------------------------------------------------
function wrapHtml(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FFF5F7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:24px;padding:40px 32px;border:1px solid #FFE0E8;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:48px;height:48px;background:#FFE0E8;border-radius:16px;line-height:48px;font-size:24px;">🐷</div>
      <h2 style="margin:12px 0 4px;color:#1a1a1a;font-size:20px;">${title}</h2>
    </div>
    ${body}
    <div style="margin-top:32px;text-align:center;color:#999;font-size:11px;">
      <p>Ipon — Daily Savings Tracker 💗</p>
    </div>
  </div>
</body>
</html>`;
}

function buttonHtml(url: string, label: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#FF4F81,#FF6B9D);color:#fff;text-decoration:none;border-radius:16px;font-weight:bold;font-size:14px;">${label}</a>
  </div>`;
}

// ---------------------------------------------------------------------------
// Email Senders
// ---------------------------------------------------------------------------
export async function sendVerificationEmail(email: string, token: string, name: string) {
  if (!canSendToRecipient(email)) {
    return { success: false, reason: "Daily email limit reached" };
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify?token=${token}`;

  const text = `Hi ${name},\n\nWelcome to Ipon! Please verify your email to start building your daily savings habit:\n${verifyUrl}\n\nHappy saving! 🌸`;
  const html = wrapHtml(
    "Verify your Email 💗",
    `<p style="color:#444;font-size:14px;line-height:1.6;">Hi <strong>${name}</strong>,</p>
     <p style="color:#444;font-size:14px;line-height:1.6;">Welcome to Ipon! Please verify your email to start building your daily savings habit.</p>
     ${buttonHtml(verifyUrl, "Verify Email")}
     <p style="color:#999;font-size:12px;text-align:center;">Or copy this link: <a href="${verifyUrl}" style="color:#FF4F81;">${verifyUrl}</a></p>`
  );

  const record: SentEmail = {
    id: Math.random().toString(36).substring(2, 9),
    to: email,
    subject: "Verify your Ipon Account 💗",
    type: "verification",
    actionUrl: verifyUrl,
    content: text,
    timestamp: new Date().toISOString(),
  };

  return sendEmail(email, record.subject, text, html, record);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!canSendToRecipient(email)) {
    return { success: false, reason: "Daily email limit reached" };
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const text = `Hello,\n\nYou requested a password reset for your Ipon account. Click the link below to set a new password:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = wrapHtml(
    "Reset your Password 🔒",
    `<p style="color:#444;font-size:14px;line-height:1.6;">You requested a password reset for your Ipon account.</p>
     ${buttonHtml(resetUrl, "Reset Password")}
     <p style="color:#999;font-size:12px;text-align:center;">Or copy this link: <a href="${resetUrl}" style="color:#FF4F81;">${resetUrl}</a></p>
     <p style="color:#999;font-size:12px;text-align:center;">If you did not request this, you can safely ignore this email.</p>`
  );

  const record: SentEmail = {
    id: Math.random().toString(36).substring(2, 9),
    to: email,
    subject: "Reset your Ipon Password 🔒",
    type: "reset",
    actionUrl: resetUrl,
    content: text,
    timestamp: new Date().toISOString(),
  };

  return sendEmail(email, record.subject, text, html, record);
}

export async function sendDailyReminderEmail(email: string, dailyGoal: number, currencySymbol: string) {
  if (!canSendToRecipient(email)) {
    return { success: false, reason: "Daily email limit reached" };
  }

  const text = `Time to save! 💗\n\nDaily Goal: ${currencySymbol}${dailyGoal.toLocaleString()}\n\nEvery small peso counts towards your dreams. Open Ipon to log your daily savings today! ✨`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const html = wrapHtml(
    "Time to Save! 💗",
    `<p style="color:#444;font-size:14px;line-height:1.6;">Your daily savings goal is <strong>${currencySymbol}${dailyGoal.toLocaleString()}</strong>.</p>
     <p style="color:#444;font-size:14px;line-height:1.6;">Every small peso counts towards your dreams. Log your savings today! ✨</p>
     ${buttonHtml(appUrl, "Open Ipon")}
     `
  );

  const record: SentEmail = {
    id: Math.random().toString(36).substring(2, 9),
    to: email,
    subject: "Time to save! 💗",
    type: "reminder",
    content: text,
    timestamp: new Date().toISOString(),
  };

  return sendEmail(email, record.subject, text, html, record);
}
