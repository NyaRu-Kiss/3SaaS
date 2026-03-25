"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface BalanceData {
  totalRevenue: number;
  platformFee: number;
  availableBalance: number;
  totalWithdrawn: number;
  pendingBalance: number;
  withdrawals: Withdrawal[];
}

export default function WithdrawalsPage() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await fetch("/api/withdrawals");
      const data = await res.json();
      setBalance(data);
    } catch {
      alert("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setWithdrawing(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(parseFloat(amount) * 100),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setAmount("");
        loadBalance();
      } else {
        alert(data.error || "Withdrawal failed");
      }
    } catch {
      alert("Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-gray-900">
              Earnings & Withdrawals
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(balance?.totalRevenue || 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Platform Fee (10%)</div>
            <div className="text-2xl font-bold text-red-600">
              -{formatPrice(balance?.platformFee || 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Withdrawn</div>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(balance?.totalWithdrawn || 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Available Balance</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(balance?.pendingBalance || 0)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Request Withdrawal
          </h2>
          <form onSubmit={handleWithdraw} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={(balance?.pendingBalance || 0) / 100}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={withdrawing || !amount || parseFloat(amount) <= 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {withdrawing ? "Processing..." : "Withdraw"}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-2">
            Minimum withdrawal: $1.00. Processing time: 3-5 business days.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Withdrawal History</h2>
          </div>
          <div className="p-6">
            {balance?.withdrawals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No withdrawals yet</p>
            ) : (
              <div className="space-y-3">
                {balance?.withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatPrice(withdrawal.amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(withdrawal.createdAt).toLocaleDateString("en-US")}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        withdrawal.status === "COMPLETED"
                          ? "text-green-600"
                          : withdrawal.status === "PENDING"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {withdrawal.status === "COMPLETED"
                        ? "Completed"
                        : withdrawal.status === "PENDING"
                        ? "Processing"
                        : "Rejected"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
