import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PLATFORM_FEE = 0.1;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        post: { creatorId: session.user.id },
        paymentStatus: "SUCCEEDED",
      },
    });

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const platformFee = Math.round(totalRevenue * PLATFORM_FEE);
    const availableBalance = totalRevenue - platformFee;

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "COMPLETED")
      .reduce((sum, w) => sum + w.amount, 0);

    return NextResponse.json({
      totalRevenue,
      platformFee,
      availableBalance,
      totalWithdrawn,
      pendingBalance: availableBalance - totalWithdrawn,
      withdrawals,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "请输入有效金额" }, { status: 400 });
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        post: { creatorId: session.user.id },
        paymentStatus: "SUCCEEDED",
      },
    });

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const platformFee = Math.round(totalRevenue * PLATFORM_FEE);
    const availableBalance = totalRevenue - platformFee;

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
    });
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

    if (amount > availableBalance - totalWithdrawn) {
      return NextResponse.json(
        { error: "余额不足，最低提现金额为 $1.00" },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: session.user.id,
        amount,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      withdrawal,
      message: "提现申请已提交，将在 3-5 个工作日内到账",
    });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
