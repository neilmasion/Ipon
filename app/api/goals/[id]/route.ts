import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goal = await prisma.goal.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, targetAmount, currentAmount, targetDate, icon, status, addAmount } = body;

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (targetAmount !== undefined) updateData.targetAmount = parseFloat(targetAmount);
    if (targetDate !== undefined) updateData.targetDate = targetDate || null;
    if (icon) updateData.icon = icon;
    if (status) updateData.status = status;

    if (addAmount !== undefined) {
      const added = parseFloat(addAmount);
      if (!isNaN(added)) {
        updateData.currentAmount = Math.max(0, goal.currentAmount + added);
      }
    } else if (currentAmount !== undefined) {
      updateData.currentAmount = parseFloat(currentAmount);
    }

    // Check if goal reached
    if (updateData.targetAmount || updateData.currentAmount !== undefined) {
      const effTarget = updateData.targetAmount ?? goal.targetAmount;
      const effCurrent = updateData.currentAmount ?? goal.currentAmount;
      if (effCurrent >= effTarget) {
        updateData.status = "REACHED";
      }
    }

    const updated = await prisma.goal.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ goal: updated });
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goal = await prisma.goal.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await prisma.goal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
