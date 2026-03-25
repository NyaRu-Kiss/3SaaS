import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewPostNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { postId } = await request.json();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      return NextResponse.json({ error: "内容不存在" }, { status: 404 });
    }

    if (post.creatorId !== session.user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const subscribers = await prisma.subscription.findMany({
      where: {
        creatorId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        subscriber: {
          select: { email: true },
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const postUrl = `${appUrl}/${post.creator.slug}/${post.slug}`;

    let sentCount = 0;
    for (const sub of subscribers) {
      const result = await sendNewPostNotification(
        sub.subscriber.email,
        post.creator.name || "创作者",
        post.title,
        postUrl
      );
      if (result.success) sentCount++;
    }

    return NextResponse.json({
      success: true,
      sentCount,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("Send notifications error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
