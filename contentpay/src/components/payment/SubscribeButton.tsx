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
        alert(data.error || "Subscription failed");
      }
    } catch {
      alert("Subscription failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPlans(!showPlans)}
        disabled={loading}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
      >
        {loading ? "Processing..." : "Subscribe"}
      </button>

      {showPlans && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
          <button
            onClick={() => handleSubscribe("monthly")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
          >
            <div className="font-medium text-gray-900">Monthly</div>
            <div className="text-sm text-gray-600">$9.99/month</div>
          </button>
          <button
            onClick={() => handleSubscribe("yearly")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
          >
            <div className="font-medium text-gray-900">Yearly</div>
            <div className="text-sm text-green-600">$99.99/year (Save 17%)</div>
          </button>
        </div>
      )}
    </div>
  );
}
