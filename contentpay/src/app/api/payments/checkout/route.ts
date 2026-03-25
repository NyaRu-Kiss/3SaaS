import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { postId } = await request.json();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      return NextResponse.json({ error: "内容不存在" }, { status: 404 });
    }

    if (post.priceType === "FREE") {
      return NextResponse.json({ error: "免费内容无需购买" }, { status: 400 });
    }

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
    });

    if (existingPurchase && existingPurchase.paymentStatus === "SUCCEEDED") {
      return NextResponse.json({ error: "您已购买过此内容" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: post.currency || "usd",
            product_data: {
              name: post.title,
              description: post.excerpt || undefined,
            },
            unit_amount: post.price!,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${post.creator.slug}/${post.slug}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${post.creator.slug}/${post.slug}?canceled=true`,
      metadata: {
        userId: session.user.id,
        postId: post.id,
        type: "purchase",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "创建支付会话失败" }, { status: 500 });
  }
}
