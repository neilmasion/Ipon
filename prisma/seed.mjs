import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Ipon database with demo account & collaborative challenge...");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  // 1. Create or update primary demo user: Neil Masion
  let user = await prisma.user.upsert({
    where: { email: "demo@ipon.app" },
    update: { name: "Neil Masion" },
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

  // 2. Create partner user: Sarah Chen
  let partner = await prisma.user.upsert({
    where: { email: "sarah@ipon.app" },
    update: { name: "Sarah Chen" },
    create: {
      name: "Sarah Chen",
      email: "sarah@ipon.app",
      password: hashedPassword,
      isVerified: true,
      currency: "PHP",
      currencySymbol: "₱",
      reminderSettings: {
        create: {
          enabled: true,
          reminderTime: "20:00",
          email: "sarah@ipon.app",
          notifyMissed: true,
          notifyStreak: true,
          notifyMilestone: true,
        },
      },
    },
  });

  // 3. Clear existing challenges and recreate sample collaborative challenge
  await prisma.savingsRecord.deleteMany({});
  await prisma.challengeMember.deleteMany({});
  await prisma.iponChallenge.deleteMany({});
  await prisma.goal.deleteMany({});

  // 4. Create connected Goal: "New Phone"
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "New Phone",
      targetAmount: 15000,
      currentAmount: 300,
      targetDate: "2026-12-31",
      icon: "📱",
      status: "ACTIVE",
    },
  });

  // 5. Create collaborative Ipon Challenge: "New Phone"
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
      inviteCode: "IPON-NEWPHN",
      isShared: true,
      members: {
        create: [
          { userId: user.id, role: "OWNER" },
          { userId: partner.id, role: "MEMBER" },
        ],
      },
    },
  });

  // 6. Create savings records showing who contributed:
  // Neil's contributions:
  // - October 1: ₱50
  // - October 2: ₱50
  // - October 3: ₱100
  // Sarah's contributions:
  // - October 2: ₱50
  // - October 3: ₱50
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
        note: "Neil kicked off Day 1 saving!",
      },
      {
        userId: user.id,
        challengeId: challenge.id,
        goalId: goal.id,
        date: "2026-10-02",
        dailyGoal: 50,
        amountSaved: 50,
        status: "SAVED",
        note: "Neil's daily target met",
      },
      {
        userId: user.id,
        challengeId: challenge.id,
        goalId: goal.id,
        date: "2026-10-03",
        dailyGoal: 50,
        amountSaved: 100,
        status: "SAVED",
        note: "Neil saved extra! 🔥 ₱50 above goal",
      },
      {
        userId: partner.id,
        challengeId: challenge.id,
        goalId: goal.id,
        date: "2026-10-02",
        dailyGoal: 50,
        amountSaved: 50,
        status: "SAVED",
        note: "Sarah chipped in for the phone goal! 🌸",
      },
      {
        userId: partner.id,
        challengeId: challenge.id,
        goalId: goal.id,
        date: "2026-10-03",
        dailyGoal: 50,
        amountSaved: 50,
        status: "SAVED",
        note: "Sarah saved daily target",
      },
    ],
  });

  console.log("Seeding completed successfully!");
  console.log("1. Neil Masion (demo@ipon.app / password123)");
  console.log("2. Sarah Chen (sarah@ipon.app / password123)");
  console.log("Invite Code: IPON-NEWPHN");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
