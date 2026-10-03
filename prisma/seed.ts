import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Ipon database with demo account & New Phone challenge...");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  // 1. Create or upsert demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@ipon.app" },
    update: {},
    create: {
      name: "Neil Masion",
      email: "demo@ipon.app",
      password: hashedPassword,
      isVerified: true,
      currency: "PHP",
      currencySymbol: "₱",
      reminderSettings: {
        create: {
          enabled: true,
          reminderTime: "20:00",
          email: "demo@ipon.app",
          notifyMissed: true,
          notifyStreak: true,
          notifyMilestone: true,
        },
      },
    },
  });

  // 2. Create connected Goal: "New Phone"
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "New Phone",
      targetAmount: 15000,
      currentAmount: 200,
      targetDate: "2026-12-31",
      icon: "📱",
      status: "ACTIVE",
    },
  });

  // 3. Create Ipon Challenge: "New Phone"
  // Start: 2026-10-01, Daily Goal: 50, Target: 15000
  const challenge = await prisma.iponChallenge.create({
    data: {
      userId: user.id,
      name: "New Phone",
      startDate: "2026-10-01",
      endDate: "2026-12-31",
      dailyGoal: 50,
      targetAmount: 15000,
      connectedGoalId: goal.id,
      status: "ACTIVE",
    },
  });

  // 4. Create savings records matching Section 9:
  // October 1 -> ₱50
  // October 2 -> ₱50
  // October 3 -> ₱100
  await prisma.savingsRecord.createMany({
    data: [
      {
        userId: user.id,
        challengeId: challenge.id,
        goalId: goal.id,
        date: "2026-10-01",
        dailyGoal: 50,
        amountSaved: 50,
        status: "SAVED",
        note: "Day 1 kickoff saving!",
      },
      {
        userId: user.id,
        challengeId: challenge.id,
        goalId: goal.id,
        date: "2026-10-02",
        dailyGoal: 50,
        amountSaved: 50,
        status: "SAVED",
        note: "Daily habit maintained",
      },
      {
        userId: user.id,
        challengeId: challenge.id,
        goalId: goal.id,
        date: "2026-10-03",
        dailyGoal: 50,
        amountSaved: 100,
        status: "SAVED",
        note: "Added extra money! 🔥 ₱50 above goal",
      },
    ],
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
