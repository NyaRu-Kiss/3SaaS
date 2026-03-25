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
      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
        Purchased
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
        alert(data.error || "Purchase failed");
      }
    } catch {
      alert("Purchase failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
    >
      {loading ? "Redirecting to payment..." : `Purchase for ${formatPrice(price, currency)}`}
    </button>
  );
}
