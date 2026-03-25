"use client";

import { useState } from "react";
import Link from "next/link";
import { Editor } from "@/components/editor/Editor";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [priceType, setPriceType] = useState("FREE");
  const [price, setPrice] = useState("");
  const [paywallType, setPaywallType] = useState("FULL");
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          priceType,
          price: price ? Math.round(parseFloat(price) * 100) : null,
          paywallType,
          status,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.error || "创建失败");
      }
    } catch {
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">创建内容</h1>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            取消
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">摘要</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">内容</label>
              <Editor value={content} onChange={setContent} />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="font-semibold">定价设置</h2>

            <div>
              <label className="block text-sm font-medium mb-2">价格类型</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="FREE">免费</option>
                <option value="ONE_TIME">单次购买</option>
                <option value="SUBSCRIPTION">会员专享</option>
              </select>
            </div>

            {priceType === "ONE_TIME" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  价格 (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="9.99"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            )}

            {priceType !== "FREE" && (
              <div>
                <label className="block text-sm font-medium mb-2">付费墙类型</label>
                <select
                  value={paywallType}
                  onChange={(e) => setPaywallType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="FULL">完全付费</option>
                  <option value="PREVIEW">部分免费预览</option>
                  <option value="MEMBERSHIP">仅会员可见</option>
                </select>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="font-semibold">发布设置</h2>
            <div>
              <label className="block text-sm font-medium mb-2">状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="DRAFT">存为草稿</option>
                <option value="PUBLISHED">立即发布</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 border rounded-md hover:bg-gray-50"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
