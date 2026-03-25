import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ purchased: false });
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    return NextResponse.json({
      purchased: purchase?.paymentStatus === "SUCCEEDED",
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ purchased: false });
  }
}
