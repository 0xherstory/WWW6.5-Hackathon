import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { mockShopItems } from '@/data/mockData';
import { ArrowLeft, ShoppingBag, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['全部', '猫用品', '狗用品', '医疗', '文创'];

const categoryIcons: Record<string, string> = {
  '猫用品': '🐱',
  '狗用品': '🐶',
  '医疗': '💊',
  '文创': '🎨',
};

const Shop = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('全部');

  const filtered = activeCategory === '全部'
    ? mockShopItems
    : mockShopItems.filter(item => item.category === activeCategory);

  return (
    <MobileLayout hideTabBar>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
          <span className="text-sm font-semibold">🛍️ 公益商城</span>
        </div>
        <button
          onClick={() => toast('订单功能即将上线')}
          className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          我的订单
        </button>
      </div>

      <div className="px-4 pb-6">
        <p className="mt-2 text-xs text-muted-foreground">每一次购买，都是对流浪动物的支持</p>

        {/* Category Tabs */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => toast.success('购买功能即将上线')}
              className="rounded-xl bg-card p-3 text-left shadow-sm transition-transform active:scale-[0.98]"
            >
              <div className="flex h-28 items-center justify-center rounded-lg bg-muted text-3xl">
                {categoryIcons[item.category] || '🐾'}
              </div>
              <p className="mt-2 text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{item.price}</span>
                <span className="rounded-full bg-points/15 px-2 py-0.5 text-[10px] font-medium text-points">+{item.points}助力值</span>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-2xl">📦</p>
            <p className="mt-2 text-sm text-muted-foreground">该分类暂无商品</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Shop;
