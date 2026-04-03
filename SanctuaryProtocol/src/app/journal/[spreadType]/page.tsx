"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpread, type SpreadType } from "@/config/spreads";

export default function JournalPage() {
  const params = useParams();
  const router = useRouter();
  const spreadType = params.spreadType as SpreadType;
  const spread = getSpread(spreadType);

  const [content, setContent] = useState("");
  const [wordCard, setWordCard] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);

  if (!spread) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              牌阵不存在
            </h1>
            <button
              onClick={() => router.push("/spreads")}
              className="text-emerald-600 hover:text-emerald-800"
            >
              返回选择牌阵
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("请写下你的想法");
      return;
    }

    setIsEncrypting(true);
    // TODO: 实现加密和IPFS上传
    setTimeout(() => {
      router.push("/success");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-emerald-800 mb-4">
              记录你的解读
            </h1>
            <p className="text-lg text-emerald-600">
              {spread.name} · 写下你的感受和洞察
            </p>
          </div>

          {/* 已选卡牌展示 */}
          <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
            <h2 className="text-xl font-bold text-emerald-800 mb-4">
              你选择的卡牌
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {spread.positions.map((position, index) => (
                <div
                  key={index}
                  className="aspect-square bg-emerald-50 rounded-lg border-2 border-dashed border-emerald-200 flex items-center justify-center"
                >
                  <span className="text-sm text-gray-400">{position.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 日记输入 */}
          <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
            <h2 className="text-xl font-bold text-emerald-800 mb-4">
              你的解读
            </h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你对这些卡牌的解读、感受和洞察..."
              className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none resize-none"
              disabled={isEncrypting}
            />
            <div className="mt-2 text-sm text-gray-500">
              {content.length} 字
            </div>
          </div>

          {/* 字卡选择 */}
          <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
            <h2 className="text-xl font-bold text-emerald-800 mb-4">
              选择字卡（可选）
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {["平静", "成长", "接纳", "释放", "希望"].map((word) => (
                <button
                  key={word}
                  onClick={() => setWordCard(word)}
                  className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                    wordCard === word
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                  disabled={isEncrypting}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isEncrypting}
            >
              返回
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isEncrypting}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                !content.trim() || isEncrypting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {isEncrypting ? "加密中..." : "封存上链"}
            </button>
          </div>

          {/* 提示 */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>你的日记将被加密后存储在 IPFS，区块链上只保存哈希值</p>
            <p className="mt-1">只有你能解密并查看内容</p>
          </div>
        </div>
      </div>
    </main>
  );
}
