import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        subscriberId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { creatorId, plan } = await request.json();

    if (!creatorId || !plan) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      return NextResponse.json({ error: "创作者不存在" }, { status: 404 });
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId: session.user.id,
          creatorId,
        },
      },
    });

    if (existingSubscription && existingSubscription.status === "ACTIVE") {
      return NextResponse.json({ error: "您已是订阅用户" }, { status: 400 });
    }

    const priceId =
      plan === "yearly"
        ? process.env.STRIPE_YEARLY_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: "订阅配置错误" }, { status: 500 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${creator.slug}?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${creator.slug}?subscription=canceled`,
      metadata: {
        userId: session.user.id,
        creatorId,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json({ error: "创建订阅失败" }, { status: 500 });
  }
}
