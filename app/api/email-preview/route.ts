import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRecentNotifications, clearEmails, sendDailyReminderEmail, sendWelcomeGreetingEmail } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Return only current user's in-app notifications (excludes auth security emails like OTPs / reset codes)
    const notifications = getRecentNotifications(user.email);
    return NextResponse.json({ emails: notifications });
  } catch (error) {
    return NextResponse.json({ emails: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, dailyGoal } = body;

    if (action === "clear") {
      clearEmails();
      return NextResponse.json({ message: "Emails cleared" });
    }

    // Trigger test reminder
    await sendDailyReminderEmail(
      user.email,
      dailyGoal || 50,
      user.currencySymbol || "₱"
    );

    return NextResponse.json({ message: "Test reminder sent to email inbox!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to trigger email" }, { status: 500 });
  }
}
