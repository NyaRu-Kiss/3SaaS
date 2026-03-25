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
    if (!confirm("Are you sure you want to cancel this subscription?")) return;

    setCancelingId(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Cancellation failed");
      }
    } catch {
      alert("Cancellation failed");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("purchases")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "purchases"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Purchased ({purchases.length})
              </button>
              <button
                onClick={() => setActiveTab("subscriptions")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "subscriptions"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Subscriptions ({subscriptions.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "purchases" ? (
              <div className="space-y-4">
                {purchases.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No purchases yet
                  </p>
                ) : (
                  purchases.map((purchase) => (
                    <Link
                      key={purchase.id}
                      href={`/${purchase.post.creator.slug}/${purchase.post.slug}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition"
                    >
                      <div className="font-medium text-gray-900">
                        {purchase.post.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        by {purchase.post.creator.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Purchased on{" "}
                        {new Date(purchase.createdAt).toLocaleDateString("en-US")}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No subscriptions</p>
                ) : (
                  subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {sub.creator.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {sub.plan === "yearly" ? "Yearly" : "Monthly"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Renews on{" "}
                          {new Date(sub.currentPeriodEnd).toLocaleDateString(
                            "en-US"
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/${sub.creator.slug}`}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleCancelSubscription(sub.id)}
                          disabled={cancelingId === sub.id}
                          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancelingId === sub.id
                            ? "Canceling..."
                            : "Cancel Subscription"}
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
