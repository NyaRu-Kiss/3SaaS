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
  const [activeTab, setActiveTab] = useState<"posts" | "analytics">("posts");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">ContentPay Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.name}</span>
            <a
              href={`/${user.slug}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              查看主页
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-3xl font-bold">{posts.length}</div>
            <div className="text-gray-600">内容总数</div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="text-3xl font-bold">{subscriptionCount}</div>
            <div className="text-gray-600">订阅者数</div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="text-3xl font-bold">{formatPrice(totalRevenue)}</div>
            <div className="text-gray-600">总收入</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-2 ${
                  activeTab === "posts"
                    ? "border-b-2 border-black font-medium"
                    : "text-gray-600"
                }`}
              >
                我的内容
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 ${
                  activeTab === "analytics"
                    ? "border-b-2 border-black font-medium"
                    : "text-gray-600"
                }`}
              >
                数据分析
              </button>
            </div>
            <Link
              href="/dashboard/new"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              创建内容
            </Link>
          </div>

          <div className="p-6">
            {activeTab === "posts" ? (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无内容，点击上方按钮创建第一篇内容</p>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{post.title}</h3>
                        <div className="text-sm text-gray-500 flex gap-4">
                          <span>
                            {post.priceType === "FREE"
                              ? "免费"
                              : post.priceType === "SUBSCRIPTION"
                              ? "订阅"
                              : formatPrice(post.price || 0)}
                          </span>
                          <span>
                            {post.status === "PUBLISHED" ? "已发布" : "草稿"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/edit/${post.id}`}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          编辑
                        </Link>
                        <Link
                          href={`/${user.slug}/${post.slug}`}
                          target="_blank"
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          查看
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                数据分析功能开发中
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
