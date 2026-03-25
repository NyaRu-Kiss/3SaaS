import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { purchaseId, reason } = await request.json();

    if (!purchaseId) {
      return NextResponse.json({ error: "缺少购买记录 ID" }, { status: 400 });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        post: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "购买记录不存在" }, { status: 404 });
    }

    if (purchase.post.creatorId !== session.user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    if (purchase.paymentStatus !== "SUCCEEDED") {
      return NextResponse.json({ error: "该订单无法退款" }, { status: 400 });
    }

    const daysSincePurchase =
      (Date.now() - purchase.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSincePurchase > 30) {
      return NextResponse.json(
        { error: "仅支持 30 天内的订单退款" },
        { status: 400 }
      );
    }

    try {
      await stripe.refunds.create({
        payment_intent: purchase.stripePaymentId,
        reason: "requested_by_customer",
        metadata: {
          reason: reason || "创作者主动退款",
          refundedBy: session.user.id,
        },
      });

      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { paymentStatus: "REFUNDED" },
      });

      return NextResponse.json({
        success: true,
        message: "退款成功",
      });
    } catch (stripeError: unknown) {
      const message = stripeError instanceof Error ? stripeError.message : "退款处理失败";
      console.error("Stripe refund error:", stripeError);
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    const where: {
      post: { creatorId: string };
      paymentStatus: string;
      postId?: string;
    } = {
      post: { creatorId: session.user.id },
      paymentStatus: "SUCCEEDED",
    };

    if (postId) {
      where.postId = postId;
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        post: {
          select: { title: true, slug: true },
        },
        user: {
          select: { email: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("Get purchases error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
