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
      alert("Failed to load coupons");
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
        alert(data.error || "Failed to create coupon");
      }
    } catch {
      alert("Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`/api/coupons?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadCoupons();
      } else {
        alert("Failed to delete");
      }
    } catch {
      alert("Failed to delete");
    }
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
            <h1 className="text-xl font-bold text-gray-900">Coupon Management</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Create Coupon
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center py-8 text-gray-600">Loading...</p>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No coupons yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              Create Your First Coupon
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Discount</th>
                  <th className="px-6 py-3 font-medium">Used / Total</th>
                  <th className="px-6 py-3 font-medium">Valid Until</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-t border-gray-100">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `$${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(coupon.validFrom).toLocaleDateString("en-US")}
                      {coupon.validUntil
                        ? ` - ${new Date(coupon.validUntil).toLocaleDateString("en-US")}`
                        : " - No expiry"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Create Coupon
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="SAVE20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.discountType === "percentage"
                    ? "Discount (%)"
                    : "Discount ($)"}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Uses (optional)
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: e.target.value })
                  }
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid For (days)
                </label>
                <input
                  type="number"
                  value={formData.validDays}
                  onChange={(e) =>
                    setFormData({ ...formData, validDays: e.target.value })
                  }
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 font-medium"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
