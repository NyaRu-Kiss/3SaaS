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
      alert("加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (purchaseId: string, reason?: string) => {
    if (!confirm("确定要退款此订单吗？")) return;

    setRefundingId(purchaseId);
    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, reason }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("退款成功");
        loadPurchases();
      } else {
        alert(data.error || "退款失败");
      }
    } catch {
      alert("退款失败");
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
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              &larr; 返回
            </Link>
            <h1 className="text-xl font-bold">退款管理</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <p className="text-sm text-gray-500">
              仅显示 30 天内的订单，最多支持退款一次
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-center">加载中...</div>
          ) : purchases.length === 0 ? (
            <div className="p-6 text-center text-gray-500">暂无订单</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-500">
                  <th className="px-6 py-3 font-medium">内容</th>
                  <th className="px-6 py-3 font-medium">购买者</th>
                  <th className="px-6 py-3 font-medium">金额</th>
                  <th className="px-6 py-3 font-medium">购买时间</th>
                  <th className="px-6 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => {
                  const daysSincePurchase =
                    (Date.now() - new Date(purchase.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24);
                  const canRefund = daysSincePurchase <= 30;

                  return (
                    <tr key={purchase.id} className="border-t">
                      <td className="px-6 py-4">
                        <div className="font-medium">{purchase.post.title}</div>
                        <div className="text-sm text-gray-500">
                          /{purchase.post.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{purchase.user.name || "-"}</div>
                        <div className="text-sm text-gray-500">
                          {purchase.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {formatPrice(purchase.amount, purchase.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(purchase.createdAt).toLocaleDateString("zh-CN")}
                      </td>
                      <td className="px-6 py-4">
                        {canRefund ? (
                          <button
                            onClick={() => handleRefund(purchase.id)}
                            disabled={refundingId === purchase.id}
                            className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                          >
                            {refundingId === purchase.id ? "处理中..." : "退款"}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">已过期</span>
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
