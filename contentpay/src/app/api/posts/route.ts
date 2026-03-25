import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  priceType: z.enum(["FREE", "ONE_TIME", "SUBSCRIPTION"]),
  price: z.number().optional(),
  paywallType: z.enum(["FULL", "PREVIEW", "MEMBERSHIP"]).optional(),
  previewRatio: z.number().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creator = searchParams.get("creator");
  const status = searchParams.get("status");

  const where: {
    creator?: { slug: string };
    status: string;
  } = {};

  if (creator) {
    where.creator = { slug: creator };
  }

  if (status) {
    where.status = status;
  } else {
    where.status = "PUBLISHED";
  }

  const posts = await prisma.post.findMany({
    where,
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
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const data = postSchema.parse(body);

    const slug = slugify(data.title) + "-" + Date.now().toString(36);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        priceType: data.priceType,
        price: data.price,
        paywallType: data.paywallType || "FULL",
        previewRatio: data.previewRatio || 30,
        status: data.status || "DRAFT",
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "参数错误", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Create post error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
