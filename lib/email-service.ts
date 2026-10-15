import nodemailer from "nodemailer";
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

// Spend cap safeguard: Maximum 10 outgoing emails per recipient per 24 hours
const recipientSendCounts = new Map<string, { count: number; resetTime: number }>();

function canSendToRecipient(email: string, maxPerDay: number = 10): boolean {
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
// Transporters: Free Gmail SMTP (Nodemailer) & Optional Mailgun Fallback
// ---------------------------------------------------------------------------

function getGmailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      // Remove spaces if user copied Google App Password as "xxxx xxxx xxxx xxxx"
      pass: pass.replace(/\s+/g, ""),
    },
  });
}

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
  });

  return { mg, domain };
}

/**
 * Sends an email via Free Gmail SMTP or Mailgun.
 * In development without credentials, logs to in-memory store so it never crashes.
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

  // 1. Try free Gmail SMTP first
  const gmailTransporter = getGmailTransporter();
  if (gmailTransporter) {
    try {
      const fromAddress = process.env.EMAIL_FROM || process.env.GMAIL_USER || "Ipon Savings <noreply@ipon.app>";
      await gmailTransporter.sendMail({
        from: fromAddress.includes("<") ? fromAddress : `Ipon Savings <${fromAddress}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`[Ipon Mailer][Gmail SMTP] Real email sent to ${to}: "${subject}"`);
      return { success: true };
    } catch (err: any) {
      console.error(`[Ipon Mailer][Gmail SMTP] Failed to send email to ${to}:`, err?.message || err);
      return { success: false, reason: err?.message || "Gmail SMTP send failed" };
    }
  }

  // 2. Try Mailgun fallback if configured
  const mailgun = getMailgunClient();
  const fromAddress = process.env.MAILGUN_FROM || "Ipon Savings <noreply@ipon.app>";

  if (mailgun) {
    try {
      await mailgun.mg.messages.create(mailgun.domain, {
        from: fromAddress,
        to: [to],
        subject,
        text,
        html,
      });
      console.log(`[Ipon Mailer][Mailgun] Email sent to ${to}: "${subject}"`);
      return { success: true };
    } catch (err: any) {
      console.error(`[Ipon Mailer][Mailgun] Failed to send email to ${to}:`, err?.message || err);
      return { success: false, reason: err?.message || "Mailgun send failed" };
    }
  }

  // 3. Fallback: Development preview mode
  console.log(`[Ipon Mailer][DEV PREVIEW] ${subject} → ${to}`);
  return { success: true };
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
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:24px;padding:40px 32px;border:1px solid #FFE0E8;box-shadow:0 4px 20px rgba(255,107,157,0.08);">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:52px;height:52px;background:#FFE0E8;border-radius:18px;line-height:52px;font-size:26px;">🐷</div>
      <h2 style="margin:14px 0 4px;color:#1a1a1a;font-size:22px;font-weight:800;">${title}</h2>
    </div>
    ${body}
    <div style="margin-top:36px;padding-top:20px;border-top:1px solid #FFEBF0;text-align:center;color:#999;font-size:12px;">
      <p style="margin:0;">Ipon — Daily Savings Tracker 💗</p>
      <p style="margin:4px 0 0;font-size:11px;color:#bbb;">Build your habit, one peso at a time.</p>
    </div>
  </div>
</body>
</html>`;
}

function buttonHtml(url: string, label: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;padding:14px 34px;background:linear-gradient(135deg,#FF4F81,#FF6B9D);color:#fff;text-decoration:none;border-radius:16px;font-weight:bold;font-size:14px;box-shadow:0 4px 12px rgba(255,79,129,0.3);">${label}</a>
  </div>`;
}

// ---------------------------------------------------------------------------
// Email Senders
// ---------------------------------------------------------------------------

/**
 * Sends a 6-digit verification code email to verify new accounts.
 */
export async function sendVerificationEmail(email: string, code: string, name: string) {
  if (!canSendToRecipient(email)) {
    return { success: false, reason: "Daily email limit reached" };
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify?token=${code}&email=${encodeURIComponent(email)}`;

  const text = `Hi ${name},\n\nWelcome to Ipon! Your 6-digit verification code is:\n\n${code}\n\nEnter this code on the verification screen, or click the link below to verify your account:\n${verifyUrl}\n\nHappy saving! 🌸`;
  
  const html = wrapHtml(
    "Verify your Email 💗",
    `<p style="color:#444;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>,</p>
     <p style="color:#555;font-size:14px;line-height:1.6;">Welcome to Ipon! Enter this 6-digit verification code to activate your account and start your savings habit:</p>
     
     <div style="text-align:center;margin:28px 0;">
       <div style="display:inline-block;background:#FFF0F4;border:2px dashed #FF4F81;border-radius:18px;padding:16px 32px;letter-spacing:10px;font-size:32px;font-weight:900;color:#FF4F81;font-family:'Courier New',Courier,monospace;">
         ${code}
       </div>
       <p style="color:#999;font-size:12px;margin-top:10px;">This 6-digit code will expire shortly.</p>
     </div>

     ${buttonHtml(verifyUrl, "Verify with 1-Click")}
     
     <p style="color:#999;font-size:12px;text-align:center;line-height:1.5;">Or copy and paste this verification link:<br/><a href="${verifyUrl}" style="color:#FF4F81;word-break:break-all;">${verifyUrl}</a></p>`
  );

  const record: SentEmail = {
    id: Math.random().toString(36).substring(2, 9),
    to: email,
    subject: `Your Ipon verification code: ${code} 💗`,
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
