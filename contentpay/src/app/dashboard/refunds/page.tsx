"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Purchase {
  id: string;
  amount: number;
  currency: string;
  createdAt: string;
  post: {
    title: string;
    slug: string;
  };
  user: {
    email: string;
    name: string | null;
  };
}

export default function RefundsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const res = await fetch("/api/refunds");
      const data = await res.json();
      setPurchases(data);
    } catch {
      alert("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (purchaseId: string) => {
    if (!confirm("Are you sure you want to refund this order?")) return;

    setRefundingId(purchaseId);
    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Refund successful");
        loadPurchases();
      } else {
        alert(data.error || "Refund failed");
      }
    } catch {
      alert("Refund failed");
    } finally {
      setRefundingId(null);
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              &larr; Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Refund Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Only orders within 30 days are eligible for refund
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading...</div>
          ) : purchases.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No orders</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <th className="px-6 py-3 font-medium">Content</th>
                  <th className="px-6 py-3 font-medium">Buyer</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => {
                  const daysSincePurchase =
                    (Date.now() - new Date(purchase.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24);
                  const canRefund = daysSincePurchase <= 30;

                  return (
                    <tr key={purchase.id} className="border-t border-gray-100">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {purchase.post.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          /{purchase.post.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{purchase.user.name || "-"}</div>
                        <div className="text-sm text-gray-600">
                          {purchase.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {formatPrice(purchase.amount, purchase.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(purchase.createdAt).toLocaleDateString("en-US")}
                      </td>
                      <td className="px-6 py-4">
                        {canRefund ? (
                          <button
                            onClick={() => handleRefund(purchase.id)}
                            disabled={refundingId === purchase.id}
                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                          >
                            {refundingId === purchase.id ? "Processing..." : "Refund"}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Expired</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
