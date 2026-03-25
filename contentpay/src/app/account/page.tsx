import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountContent } from "@/components/dashboard/AccountContent";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const purchases = await prisma.purchase.findMany({
    where: {
      userId: session.user.id,
      paymentStatus: "SUCCEEDED",
    },
    include: {
      post: {
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const subscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: session.user.id,
      status: "ACTIVE",
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return (
    <AccountContent
      purchases={purchases}
      subscriptions={subscriptions}
      user={session.user}
    />
  );
}
