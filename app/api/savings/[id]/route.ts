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

    const record = await prisma.savingsRecord.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!record) {
      return NextResponse.json({ error: "Savings record not found" }, { status: 404 });
    }

    const body = await req.json();
    const { amountSaved, note, date } = body;

    const parsedAmount = amountSaved !== undefined ? parseFloat(amountSaved) : record.amountSaved;
    const diff = parsedAmount - record.amountSaved;

    let status = record.status;
    if (parsedAmount === 0) status = "MISSED";
    else if (parsedAmount < record.dailyGoal) status = "PARTIAL";
    else status = "SAVED";

    const updated = await prisma.savingsRecord.update({
      where: { id: params.id },
      data: {
        amountSaved: parsedAmount,
        note: note !== undefined ? note : record.note,
        date: date || record.date,
        status,
      },
    });

    // Adjust connected goal
    if (record.goalId && diff !== 0) {
      await prisma.goal.update({
        where: { id: record.goalId },
        data: {
          currentAmount: {
            increment: diff,
          },
        },
      });
    }

    return NextResponse.json({ record: updated });
  } catch (error) {
    console.error("Update savings record error:", error);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
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

    const record = await prisma.savingsRecord.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!record) {
      return NextResponse.json({ error: "Savings record not found" }, { status: 404 });
    }

    // Decrement from connected goal if any
    if (record.goalId && record.amountSaved > 0) {
      await prisma.goal.update({
        where: { id: record.goalId },
        data: {
          currentAmount: {
            decrement: record.amountSaved,
          },
        },
      });
    }

    await prisma.savingsRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Delete record error:", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
