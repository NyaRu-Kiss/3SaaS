import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { PurchaseButton } from "@/components/payment/PurchaseButton";

interface PageProps {
  params: Promise<{ slug: string; post: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug, post: postSlug } = await params;
  const session = await getServerSession(authOptions);

  const post = await prisma.post.findFirst({
    where: {
      slug: postSlug,
      creator: { slug },
      status: "PUBLISHED",
    },
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
    notFound();
  }

  const isOwner = session?.user?.id === post.creatorId;

  let isPurchased = false;
  if (!isOwner && session?.user) {
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
    });
    isPurchased = purchase?.paymentStatus === "SUCCEEDED";
  }

  let hasAccess = isOwner || post.priceType === "FREE" || isPurchased;

  if (!hasAccess && post.paywallType === "MEMBERSHIP") {
    const subscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: session?.user?.id,
        creatorId: post.creatorId,
        status: "ACTIVE",
      },
    });
    hasAccess = !!subscription;
  }

  const displayContent = hasAccess
    ? post.content
    : getPreviewContent(post.content, post.previewRatio);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={`/${slug}`}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>

          <div className="flex items-center gap-4 mb-8 text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
              {post.creator.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {post.creator.name}
              </div>
              <div className="text-sm">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-US")
                  : ""}
              </div>
            </div>
          </div>

          {!hasAccess && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-700 mb-4">
                This is paid content. Unlock the full article for{" "}
                {formatPrice(post.price || 0, post.currency)}
              </p>
              {post.priceType === "ONE_TIME" && (
                <PurchaseButton
                  postId={post.id}
                  price={post.price || 0}
                  currency={post.currency}
                  isPurchased={isPurchased}
                />
              )}
            </div>
          )}

          {displayContent ? (
            <div
              className="prose prose-lg max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          ) : (
            <p className="text-gray-500">No content available</p>
          )}

          {!hasAccess && post.priceType === "ONE_TIME" && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(post.price || 0, post.currency)}
                  </span>
                </div>
                <PurchaseButton
                  postId={post.id}
                  price={post.price || 0}
                  currency={post.currency}
                  isPurchased={isPurchased}
                />
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}

function getPreviewContent(content: string | null, ratio: number): string {
  if (!content) return "";
  const length = Math.floor(content.length * (ratio / 100));
  return (
    content.slice(0, length) +
    '\n<div style="height: 100px; background: linear-gradient(transparent, white); position: absolute; bottom: 0; left: 0; right: 0;"></div>'
  );
}
