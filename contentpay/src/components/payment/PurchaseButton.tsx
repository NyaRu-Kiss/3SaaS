"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

interface PurchaseButtonProps {
  postId: string;
  price: number;
  currency: string;
  isPurchased: boolean;
}

export function PurchaseButton({
  postId,
  price,
  currency,
  isPurchased,
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);

  if (isPurchased) {
    return (
      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
        已购买
      </div>
    );
  }

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "购买失败");
      }
    } catch {
      alert("购买失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
    >
      {loading ? "跳转支付..." : `购买 ${formatPrice(price, currency)}`}
    </button>
  );
}
