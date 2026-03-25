import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const email = "demo@contentpay.com";
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: "Demo user already exists",
        email,
        password: "demo123"
      });
    }

    const hashedPassword = await bcrypt.hash("demo123", 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Demo Creator",
        slug: "demo",
        bio: "This is a demo account showcasing ContentPay features.",
        role: "CREATOR",
      },
    });

    // Create some demo posts
    await prisma.post.createMany({
      data: [
        {
          title: "Welcome to ContentPay",
          slug: "welcome",
          content: "<h1>Welcome to ContentPay!</h1><p>This is a demo post showing the rich text editor capabilities.</p><p>You can create beautiful content with our built-in editor.</p>",
          excerpt: "Get started with ContentPay - your new favorite content platform",
          priceType: "FREE",
          status: "PUBLISHED",
          publishedAt: new Date(),
          creatorId: user.id,
        },
        {
          title: "Premium Content Example",
          slug: "premium-content",
          content: "<h1>Premium Content</h1><p>This is premium content that requires payment to access.</p><p>Unlock the full article by purchasing for $9.99!</p>",
          excerpt: "An example of paid premium content",
          priceType: "ONE_TIME",
          price: 999,
          paywallType: "PREVIEW",
          status: "PUBLISHED",
          publishedAt: new Date(),
          creatorId: user.id,
        },
        {
          title: "Members Only Article",
          slug: "members-only",
          content: "<h1>Members Only</h1><p>This content is only available to subscribers.</p><p>Subscribe to access all premium content!</p>",
          excerpt: "Exclusive content for subscribers",
          priceType: "SUBSCRIPTION",
          paywallType: "MEMBERSHIP",
          status: "PUBLISHED",
          publishedAt: new Date(),
          creatorId: user.id,
        },
      ],
    });

    return NextResponse.json({ 
      success: true,
      message: "Demo user created",
      email,
      password: "demo123",
      profileUrl: "/demo"
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to create demo user" }, { status: 500 });
  }
}
