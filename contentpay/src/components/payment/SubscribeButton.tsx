"use client";

import { useState } from "react";

interface SubscribeButtonProps {
  creatorId: string;
}

export function SubscribeButton({ creatorId }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "订阅失败");
      }
    } catch {
      alert("订阅失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPlans(!showPlans)}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "处理中..." : "订阅"}
      </button>

      {showPlans && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-10">
          <button
            onClick={() => handleSubscribe("monthly")}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            <div className="font-medium">月付</div>
            <div className="text-sm text-gray-500">$9.99/月</div>
          </button>
          <button
            onClick={() => handleSubscribe("yearly")}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            <div className="font-medium">年付</div>
            <div className="text-sm text-gray-500">$99.99/年 (省17%)</div>
          </button>
        </div>
      )}
    </div>
  );
}
