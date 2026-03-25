import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  priceType: z.enum(["FREE", "ONE_TIME", "SUBSCRIPTION"]).optional(),
  price: z.number().optional(),
  paywallType: z.enum(["FULL", "PREVIEW", "MEMBERSHIP"]).optional(),
  previewRatio: z.number().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          bio: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "内容不存在" }, { status: 404 });
  }

  const isOwner = session?.user?.id === post.creatorId;
  const isPurchased = session?.user
    ? await prisma.purchase.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: post.id,
          },
        },
      })
    : null;

  const hasAccess =
    isOwner ||
    post.priceType === "FREE" ||
    (isPurchased && isPurchased.paymentStatus === "SUCCEEDED");

  if (!hasAccess) {
    return NextResponse.json({
      ...post,
      content: getPreviewContent(post.content, post.previewRatio),
    });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "内容不存在" }, { status: 404 });
    }

    if (post.creatorId !== session.user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        publishedAt:
          data.status === "PUBLISHED" && !post.publishedAt
            ? new Date()
            : post.publishedAt,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "参数错误", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Update post error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "内容不存在" }, { status: 404 });
    }

    if (post.creatorId !== session.user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

function getPreviewContent(content: string | null, ratio: number): string {
  if (!content) return "";
  const length = Math.floor(content.length * (ratio / 100));
  return content.slice(0, length) + "\n\n<!-- paywall -->";
}
