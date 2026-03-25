import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(3).max(50),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive(),
  maxUses: z.number().positive().optional(),
  validDays: z.number().positive().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      where: { creatorId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const data = couponSchema.parse(body);

    const code = data.code.toUpperCase();

    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "优惠券码已存在" },
        { status: 400 }
      );
    }

    const validDays = data.validDays || 30;
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses,
        validFrom,
        validUntil,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "参数错误", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const couponId = searchParams.get("id");

    if (!couponId) {
      return NextResponse.json({ error: "缺少优惠券 ID" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      return NextResponse.json({ error: "优惠券不存在" }, { status: 404 });
    }

    if (coupon.creatorId !== session.user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    await prisma.coupon.delete({
      where: { id: couponId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
