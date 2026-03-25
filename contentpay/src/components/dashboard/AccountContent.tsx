"use client";

import { useState } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  creator: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Purchase {
  id: string;
  post: Post;
  createdAt: string;
}

interface Subscription {
  id: string;
  creator: {
    id: string;
    name: string;
    slug: string;
  };
  plan: string;
  currentPeriodEnd: string;
}

interface AccountContentProps {
  purchases: Purchase[];
  subscriptions: Subscription[];
  user: {
    name?: string | null;
    email: string;
  };
}

export function AccountContent({
  purchases,
  subscriptions,
  user,
}: AccountContentProps) {
  const [activeTab, setActiveTab] = useState<"purchases" | "subscriptions">(
    "purchases"
  );
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleCancelSubscription = async (id: string) => {
    if (!confirm("确定要取消订阅吗？")) return;

    setCancelingId(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "取消失败");
      }
    } catch {
      alert("取消失败");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">个人中心</h1>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border">
          <div className="border-b px-6 py-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("purchases")}
                className={`px-4 py-2 ${
                  activeTab === "purchases"
                    ? "border-b-2 border-black font-medium"
                    : "text-gray-600"
                }`}
              >
                已购内容 ({purchases.length})
              </button>
              <button
                onClick={() => setActiveTab("subscriptions")}
                className={`px-4 py-2 ${
                  activeTab === "subscriptions"
                    ? "border-b-2 border-black font-medium"
                    : "text-gray-600"
                }`}
              >
                我的订阅 ({subscriptions.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "purchases" ? (
              <div className="space-y-4">
                {purchases.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无购买记录</p>
                ) : (
                  purchases.map((purchase) => (
                    <Link
                      key={purchase.id}
                      href={`/${purchase.post.creator.slug}/${purchase.post.slug}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="font-medium">{purchase.post.title}</div>
                      <div className="text-sm text-gray-500">
                        by {purchase.post.creator.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        购买于{" "}
                        {new Date(purchase.createdAt).toLocaleDateString("zh-CN")}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无订阅</p>
                ) : (
                  subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{sub.creator.name}</div>
                        <div className="text-sm text-gray-500">
                          {sub.plan === "yearly" ? "年付" : "月付"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          到期于{" "}
                          {new Date(sub.currentPeriodEnd).toLocaleDateString(
                            "zh-CN"
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/${sub.creator.slug}`}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          查看
                        </Link>
                        <button
                          onClick={() => handleCancelSubscription(sub.id)}
                          disabled={cancelingId === sub.id}
                          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancelingId === sub.id ? "取消中..." : "取消订阅"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
