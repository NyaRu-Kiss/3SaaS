import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { SubscribeButton } from "@/components/payment/SubscribeButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  priceType: string;
  price: number | null;
  currency: string;
  publishedAt: string | null;
}

interface Creator {
  id: string;
  name: string | null;
  slug: string | null;
  bio: string | null;
}

interface ApiResponse {
  creator: Creator;
  posts: Post[];
}

export default async function CreatorPage({ params }: PageProps) {
  const { slug } = await params;

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts/public/${slug}`
  ).then((res) => res.json());

  if (!data.creator) {
    notFound();
  }

  const { creator, posts } = data as ApiResponse;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">
              {creator.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{creator.name}</h1>
              <p className="text-gray-600">{creator.bio || "暂无简介"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-xl font-semibold">内容</h2>
          <SubscribeButton creatorId={creator.id} />
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无内容</p>
          ) : (
            posts.map((post: Post) => (
              <Link
                key={post.id}
                href={`/${slug}/${post.slug}`}
                className="block bg-white rounded-lg border p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("zh-CN")
                        : ""}
                    </p>
                  </div>
                  <div>
                    {post.priceType === "FREE" ? (
                      <span className="text-green-600 text-sm">免费</span>
                    ) : post.priceType === "SUBSCRIPTION" ? (
                      <span className="text-purple-600 text-sm">会员专享</span>
                    ) : (
                      <span className="text-gray-900 font-medium">
                        {formatPrice(post.price || 0, post.currency)}
                      </span>
                    )}
                  </div>
                </div>
                {post.excerpt && (
                  <p className="text-gray-600 mt-2 line-clamp-2">{post.excerpt}</p>
                )}
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
