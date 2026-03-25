"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxUses: "",
    validDays: "30",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch {
      alert("加载优惠券失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
          validDays: parseInt(formData.validDays),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          maxUses: "",
          validDays: "30",
        });
        loadCoupons();
      } else {
        const data = await res.json();
        alert(data.error || "创建失败");
      }
    } catch {
      alert("创建失败");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此优惠券吗？")) return;

    try {
      const res = await fetch(`/api/coupons?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadCoupons();
      } else {
        alert("删除失败");
      }
    } catch {
      alert("删除失败");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              &larr; 返回
            </Link>
            <h1 className="text-xl font-bold">优惠券管理</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            创建优惠券
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center py-8">加载中...</p>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500 mb-4">暂无优惠券</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              创建第一个优惠券
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-500">
                  <th className="px-6 py-3 font-medium">优惠码</th>
                  <th className="px-6 py-3 font-medium">折扣</th>
                  <th className="px-6 py-3 font-medium">已使用/总次数</th>
                  <th className="px-6 py-3 font-medium">有效期</th>
                  <th className="px-6 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-t">
                    <td className="px-6 py-4 font-mono font-medium">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `$${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(coupon.validFrom).toLocaleDateString("zh-CN")}
                      {coupon.validUntil
                        ? ` - ${new Date(coupon.validUntil).toLocaleDateString("zh-CN")}`
                        : " - 无限制"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">创建优惠券</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">优惠码</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="SAVE20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">折扣类型</label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="percentage">百分比折扣</option>
                  <option value="fixed">固定金额</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {formData.discountType === "percentage" ? "折扣比例 (%)" : "折扣金额 ($)"}
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  required
                  min="1"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">最大使用次数（可选）</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: e.target.value })
                  }
                  min="1"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="不限制"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">有效期（天）</label>
                <input
                  type="number"
                  value={formData.validDays}
                  onChange={(e) =>
                    setFormData({ ...formData, validDays: e.target.value })
                  }
                  required
                  min="1"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {creating ? "创建中..." : "创建"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
