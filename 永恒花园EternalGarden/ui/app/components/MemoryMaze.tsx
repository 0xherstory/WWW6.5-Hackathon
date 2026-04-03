"use client";
import React, { useState } from 'react';

// 1. 模拟剧情数据 [cite: 255, 278]
const MOCK_STORIES = [
  { id: 1, x: '25%', y: '20%', title: "初见花园", text: "2026年春，我在花园里种下了第一颗种子，那时候阳光很暖。" },
  { id: 2, x: '65%', y: '35%', title: "午后微风", text: "我记得那天下午，风里带着茉莉的味道，我们坐在长椅上没说话。" },
  { id: 3, x: '40%', y: '60%', title: "星空下的诺言", text: "你说生命就像这片星空，即使有星星熄灭，光芒也会走很久很久。" },
  { id: 4, x: '80%', y: '75%', title: "最后的一封信", text: "其实想说的话都在这里了，希望你能在这个花园里找到平静。" },
];

export default function MemoryMaze() {
  // 核心交互：管理当前激活的碎片 ID [cite: 276-277]
  const [activeId, setActiveId] = useState<number | null>(null);

  const activeStory = MOCK_STORIES.find(s => s.id === activeId);

  return (
    <div className="relative w-full h-[600px] bg-[#F5F5F0] rounded-3xl overflow-hidden border-4 border-[#D6CEBE] shadow-inner">
      {/* 迷宫背景提示 [cite: 261, 267] */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <span className="text-6xl font-serif text-[#A3B18A]">EVERGARDEN</span>
      </div>

      {/* 渲染可点击的记忆碎片 [cite: 268-271] */}
      {MOCK_STORIES.map((story) => (
        <button
          key={story.id}
          onClick={() => setActiveId(story.id)}
          className="absolute group transition-transform hover:scale-125 z-10"
          style={{ top: story.y, left: story.x }}
        >
          {/* 呼吸灯效果 [cite: 270] */}
          <div className="w-10 h-10 bg-[#E2B4B4] rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
            <span className="text-white text-sm">✨</span>
          </div>
          <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-sm text-gray-500">
            解锁记忆
          </span>
        </button>
      ))}

      {/* 剧情弹窗 (StoryModal) [cite: 275-280] */}
      {activeId && activeStory && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border-t-8 border-[#A3B18A]">
            <h3 className="text-2xl font-serif text-[#A3B18A] mb-4">{activeStory.title}</h3>
            <p className="text-gray-600 leading-relaxed italic mb-8 text-lg">
              “{activeStory.text}”
            </p>
            <button
              onClick={() => setActiveId(null)}
              className="w-full bg-[#D6CEBE] text-gray-700 py-3 rounded-xl hover:bg-[#A3B18A] hover:text-white transition-colors font-medium"
            >
              继续探索
            </button>
          </div>
        </div>
      )}

      {/* 进度显示 [cite: 282] */}
      <div className="absolute bottom-6 left-8 text-[#A3B18A]/70 text-sm font-serif bg-white/50 px-4 py-2 rounded-full">
        探索进度: {activeId ? "已开启" : "寻找中"}
      </div>
    </div>
  );
}