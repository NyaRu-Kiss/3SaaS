import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorSlug = searchParams.get("creator");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { slug: creatorSlug || session.user.slug! },
    });

    if (!user || user.id !== session.user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        creatorId: user.id,
        status: { in: ["ACTIVE", "CANCELED"] },
      },
      include: {
        subscriber: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Get subscribers error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
