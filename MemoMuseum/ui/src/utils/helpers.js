// 模拟当前用户钱包地址
export const USER_WALLET = '0xYOU...111';

// 初始公共星河数据
export const initialPublicStars = [
  { id: 'p1', type: 'resonance', category: '治愈瞬间', wallet: '0x8A...2F', content: '今天一个人去看了海。', color: '#3b82f6', lat: 20, lng: 50 },
  { id: 'm1', type: 'memorial', category: '失联的友邻', title: '致永远灰色的头像', color: '#10b981', legacy: ['2021: 终章'], messages: ['灵魂永存'], energy: 892, lat: 45, lng: -80, wallet: '0x1D...7E' },
  { id: 'm2', type: 'memorial', category: '逝去的关系', title: '给十年前无话不谈的你', color: '#f59e0b', legacy: ['2015: 约定极光'], messages: ['岁岁平安'], energy: 15, lat: 60, lng: 40, wallet: USER_WALLET }
];

// 自律军团视觉配置
export const glowMap = {
  teal: "border-teal-500/50 bg-teal-500/10",
  pink: "border-pink-500/50 bg-pink-500/10",
  purple: "border-purple-500/50 bg-purple-500/10",
  amber: "border-amber-500/50 bg-amber-500/10"
};

export const textMap = {
  teal: "text-teal-500", pink: "text-pink-500", purple: "text-purple-500", amber: "text-amber-500"
};