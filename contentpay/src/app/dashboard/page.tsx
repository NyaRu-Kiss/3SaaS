import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const subscriptions = await prisma.subscription.findMany({
    where: {
      creatorId: session.user.id,
      status: "ACTIVE",
    },
  });

  const purchases = await prisma.purchase.findMany({
    where: {
      post: { creatorId: session.user.id },
      paymentStatus: "SUCCEEDED",
    },
  });

  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardContent
      posts={posts}
      subscriptionCount={subscriptions.length}
      totalRevenue={totalRevenue}
      user={session.user}
    />
  );
}
