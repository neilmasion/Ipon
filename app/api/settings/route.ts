import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, comparePassword } from "@/lib/auth";
import { sanitizeText, toSafeUser, safeErrorResponse } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminder = await prisma.reminderSetting.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      user: toSafeUser(user),
      reminder: reminder || {
        enabled: true,
        reminderTime: "20:00",
        notifyMissed: true,
        notifyStreak: true,
        notifyMilestone: true,
      },
    });
  } catch (error) {
    return safeErrorResponse(error, "Failed to fetch settings");
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      currency,
      currencySymbol,
      currentPassword,
      newPassword,
      reminderSettings,
    } = body;

    const userUpdate: any = {};
    if (name) userUpdate.name = sanitizeText(name, 50);

    const allowedCurrencies: Record<string, string> = {
      PHP: "₱",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      SGD: "S$",
    };

    if (currency && allowedCurrencies[currency]) {
      userUpdate.currency = currency;
      userUpdate.currencySymbol = allowedCurrencies[currency];
    } else if (currencySymbol) {
      userUpdate.currencySymbol = sanitizeText(currencySymbol, 5);
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }
      const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!fullUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const isMatch = await comparePassword(currentPassword, fullUser.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      if (typeof newPassword !== "string" || newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }

      userUpdate.password = await hashPassword(newPassword);
    }

    // Update user
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdate,
      });
    }

    // Update reminder settings
    if (reminderSettings) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const validTime = typeof reminderSettings.reminderTime === "string" && timeRegex.test(reminderSettings.reminderTime)
        ? reminderSettings.reminderTime
        : "20:00";

      await prisma.reminderSetting.upsert({
        where: { userId: user.id },
        update: {
          enabled: Boolean(reminderSettings.enabled ?? true),
          reminderTime: validTime,
          notifyMissed: Boolean(reminderSettings.notifyMissed ?? true),
          notifyStreak: Boolean(reminderSettings.notifyStreak ?? true),
          notifyMilestone: Boolean(reminderSettings.notifyMilestone ?? true),
        },
        create: {
          userId: user.id,
          enabled: Boolean(reminderSettings.enabled ?? true),
          reminderTime: validTime,
          notifyMissed: Boolean(reminderSettings.notifyMissed ?? true),
          notifyStreak: Boolean(reminderSettings.notifyStreak ?? true),
          notifyMilestone: Boolean(reminderSettings.notifyMilestone ?? true),
        },
      });
    }

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error) {
    return safeErrorResponse(error, "Failed to update settings");
  }
}
