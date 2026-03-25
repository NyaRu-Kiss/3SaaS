import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorSlug = searchParams.get("creator");
  const format = searchParams.get("format");

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

    const subscribers = await prisma.subscription.findMany({
      where: {
        creatorId: user.id,
        status: "ACTIVE",
      },
      include: {
        subscriber: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const exportData = subscribers.map((sub) => ({
      name: sub.subscriber.name || "",
      email: sub.subscriber.email,
      subscribedAt: sub.subscriber.createdAt,
      plan: sub.plan,
    }));

    if (format === "csv") {
      const csv = [
        "Name,Email,Subscribed At,Plan",
        ...exportData.map(
          (d) =>
            `"${d.name}","${d.email}","${d.subscribedAt.toISOString()}","${d.plan}"`
        ),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="subscribers-${user.slug}.csv"`,
        },
      });
    }

    return NextResponse.json({
      count: subscribers.length,
      subscribers: exportData,
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
