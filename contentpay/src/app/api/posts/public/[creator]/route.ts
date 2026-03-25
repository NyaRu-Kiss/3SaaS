import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creator: string }> }
) {
  const { creator } = await params;

  const user = await prisma.user.findUnique({
    where: { slug: creator },
    select: {
      id: true,
      name: true,
      slug: true,
      avatar: true,
      bio: true,
      role: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "创作者不存在" }, { status: 404 });
  }

  const posts = await prisma.post.findMany({
    where: {
      creatorId: user.id,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      priceType: true,
      price: true,
      paywallType: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json({
    creator: user,
    posts,
  });
}
