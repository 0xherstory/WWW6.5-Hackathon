import React, { useState } from 'react';
import { X, Palette } from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'meditation', emoji: '🧘', name: '冥想' },
  { id: 'reading', emoji: '📚', name: '阅读' },
  { id: 'exercise', emoji: '💪', name: '运动' },
  { id: 'water', emoji: '💧', name: '喝水' },
  { id: 'sleep', emoji: '😴', name: '睡眠' },
  { id: 'learning', emoji: '🎯', name: '学习' },
  { id: 'writing', emoji: '✍️', name: '写作' },
  { id: 'music', emoji: '🎵', name: '音乐' },
  { id: 'art', emoji: '🎨', name: '艺术' },
  { id: 'cooking', emoji: '🍳', name: '烹饪' },
  { id: 'plant', emoji: '🌱', name: '植物' },
  { id: 'code', emoji: '💻', name: '编程' },
];

const COLOR_OPTIONS = [
  { id: 'purple', name: '紫色', colors: ['#8B5CF6', '#A78BFA', '#C4B5FD'] },
  { id: 'pink', name: '粉色', colors: ['#EC4899', '#F472B6', '#F9A8D4'] },
  { id: 'blue', name: '蓝色', colors: ['#3B82F6', '#60A5FA', '#93C5FD'] },
  { id: 'green', name: '绿色', colors: ['#10B981', '#34D399', '#6EE7B7'] },
  { id: 'orange', name: '橙色', colors: ['#F59E0B', '#FBBF24', '#FCD34D'] },
  { id: 'red', name: '红色', colors: ['#EF4444', '#F87171', '#FCA5A5'] },
  { id: 'cyan', name: '青色', colors: ['#06B6D4', '#22D3EE', '#67E8F9'] },
  { id: 'indigo', name: '靛蓝', colors: ['#6366F1', '#818CF8', '#A5B4FC'] },
  { id: 'teal', name: '青绿', colors: ['#14B8A6', '#2DD4BF', '#5EEAD4'] },
  { id: 'rose', name: '玫瑰', colors: ['#F43F5E', '#FB7185', '#FDA4AF'] },
  { id: 'amber', name: '琥珀', colors: ['#D97706', '#F59E0B', '#FBBF24'] },
  { id: 'emerald', name: '翡翠', colors: ['#059669', '#10B981', '#34D399'] },
];

const HabitForm = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHabit = {
      id: Date.now(),
      name: name.trim(),
      icon: selectedIcon.emoji,
      streak: 0,
      color: selectedColor.colors,
    };

    onAdd(newHabit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 表单内容 */}
      <div
        className="relative w-full max-w-lg bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.终止Propagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <h2 className="text-2xl font-bold text-white">创建新爱好</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 爱好名称 */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              爱好名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入你的爱好名称"
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          {/* 选择图标 */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              选择图标
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedIcon.id === icon.id
                      ? 'border-purple-500 bg-purple-500/20 scale-105'
                      : 'border-slate-600 hover:border-purple-400 bg-slate-700/30'
                  }`}
                >
                  <span className="text-2xl">{icon.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 选择主题色 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-purple-200 mb-2">
              <Palette className="w-4 h-4" />
              选择主题色
            </label>
            <div className="grid grid-cols-4 gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="relative"
                >
                  <div
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedColor.id === color.id
                        ? 'border-white scale-105 shadow-lg shadow-purple-500/30'
                        : 'border-transparent hover:border-slate-400'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${color.colors[0]}, ${color.colors[1]}, ${color.colors[2]})`,
                    }}
                  >
                    <div className="w-full h-12 rounded-lg" />
                  </div>
                  {selectedColor.id === color.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {/* 颜色名称 */}
            <div className="mt-2 text-center">
              <span className="text-sm text-purple-200">已选择：</span>
              <span className="ml-2 text-sm font-medium text-white">
                {selectedColor.name}
              </span>
            </div>
          </div>

          {/* 预览 */}
          <div className="p-4 bg-slate-700/30 rounded-xl border border-purple-500/20">
            <div className="text-xs text-slate-400 mb-2">预览效果</div>
            <div
              className="flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{
                background: `linear-gradient(135deg, ${selectedColor.colors[0]}20, ${selectedColor.colors[1]}20)`,
                border: `1px solid ${selectedColor.colors[0]}40`,
              }}
            >
              <span className="text-4xl">{selectedIcon.emoji}</span>
              <div>
                <div className="text-lg font-bold text-white">
                  {name || '爱好名称'}
                </div>
                <div className="text-sm text-purple-200">连续打卡 0 天</div>
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30"
          >
            创建爱好
          </button>
        </form>
      </div>
    </div>
  );
};

export default HabitForm;