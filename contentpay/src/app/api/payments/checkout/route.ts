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

    const { postId, couponCode } = await request.json();

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

    let unitAmount = post.price!;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.creatorId === post.creatorId) {
        const now = new Date();
        if (
          coupon.validFrom <= now &&
          (!coupon.validUntil || coupon.validUntil >= now) &&
          (!coupon.maxUses || coupon.usedCount < coupon.maxUses)
        ) {
          couponId = coupon.id;
          if (coupon.discountType === "percentage") {
            unitAmount = Math.round(unitAmount * (1 - coupon.discountValue / 100));
          } else if (coupon.discountType === "fixed") {
            unitAmount = Math.max(0, unitAmount - coupon.discountValue * 100);
          }
        }
      }
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
            unit_amount: unitAmount,
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
        couponId: couponId || "",
      },
      discounts: couponId
        ? [
            {
              coupon: await createStripeCoupon(couponId, post.creatorId),
            },
          ]
        : undefined,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "创建支付会话失败" }, { status: 500 });
  }
}

async function createStripeCoupon(couponId: string, creatorId: string): Promise<string> {
  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  const stripeCoupon = await stripe.coupons.create({
    duration: "once",
    percent_off: coupon.discountType === "percentage" ? coupon.discountValue : undefined,
    amount_off: coupon.discountType === "fixed" ? coupon.discountValue * 100 : undefined,
    currency: "usd",
    metadata: {
      internalCouponId: couponId,
      creatorId,
    },
  });

  await prisma.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });

  return stripeCoupon.id;
}
