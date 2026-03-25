"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  slug: string;
  priceType: string;
  price: number | null;
  status: string;
  publishedAt: string | null;
}

interface Subscriber {
  id: string;
  name: string | null;
  email: string;
  subscribedAt: string;
  plan: string;
}

interface DashboardContentProps {
  posts: Post[];
  subscriptionCount: number;
  totalRevenue: number;
  user: {
    name?: string | null;
    email: string;
    slug?: string | null;
  };
}

export function DashboardContent({
  posts,
  subscriptionCount,
  totalRevenue,
  user,
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "analytics" | "subscribers">("posts");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  const loadSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const res = await fetch(`/api/subscriptions/subscribers?creator=${user.slug}`);
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch {
      alert("Failed to load subscribers");
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const exportSubscribers = () => {
    window.open(
      `/api/subscriptions/subscribers?creator=${user.slug}&format=csv`,
      "_blank"
    );
  };

  const handleTabChange = (tab: "posts" | "analytics" | "subscribers") => {
    setActiveTab(tab);
    if (tab === "subscribers" && subscribers.length === 0) {
      loadSubscribers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">ContentPay Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.name}</span>
            <Link
              href={`/${user.slug}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Profile
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-gray-600 mt-1">Total Posts</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900">{subscriptionCount}</div>
            <div className="text-gray-600 mt-1">Subscribers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(totalRevenue)}
            </div>
            <div className="text-gray-600 mt-1">Total Revenue</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => handleTabChange("posts")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "posts"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Content
              </button>
              <button
                onClick={() => handleTabChange("subscribers")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "subscribers"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Subscribers
              </button>
              <button
                onClick={() => handleTabChange("analytics")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "analytics"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Analytics
              </button>
            </div>
            {activeTab === "posts" && (
              <Link
                href="/dashboard/new"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Create Post
              </Link>
            )}
            {activeTab === "subscribers" && (
              <button
                onClick={exportSubscribers}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Export CSV
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === "posts" ? (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No content yet. Click the button above to create your first post.
                  </p>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{post.title}</h3>
                        <div className="text-sm text-gray-600 flex gap-4 mt-1">
                          <span>
                            {post.priceType === "FREE"
                              ? "Free"
                              : post.priceType === "SUBSCRIPTION"
                              ? "Subscription"
                              : formatPrice(post.price || 0)}
                          </span>
                          <span
                            className={
                              post.status === "PUBLISHED"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }
                          >
                            {post.status === "PUBLISHED" ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/edit/${post.id}`}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/${user.slug}/${post.slug}`}
                          target="_blank"
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeTab === "subscribers" ? (
              <div>
                {loadingSubscribers ? (
                  <p className="text-center py-8 text-gray-600">Loading...</p>
                ) : subscribers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No subscribers yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-600 border-b">
                          <th className="pb-3 font-medium">Name</th>
                          <th className="pb-3 font-medium">Email</th>
                          <th className="pb-3 font-medium">Plan</th>
                          <th className="pb-3 font-medium">Subscribed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="border-b border-gray-100">
                            <td className="py-3 text-gray-900">
                              {sub.name || "-"}
                            </td>
                            <td className="py-3 text-gray-700">{sub.email}</td>
                            <td className="py-3 text-gray-700">
                              {sub.plan === "yearly" ? "Yearly" : "Monthly"}
                            </td>
                            <td className="py-3 text-gray-600 text-sm">
                              {new Date(sub.subscribedAt).toLocaleDateString(
                                "en-US"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Analytics coming soon
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
