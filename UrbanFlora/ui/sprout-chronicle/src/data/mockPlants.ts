export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  imageUrl: string;
  mintDate: string;
  timeline: TimelineEntry[];
}

export const mockPlants: Plant[] = [
  {
    id: '1',
    name: '银杏古树',
    species: 'Ginkgo biloba',
    location: '西湖边',
    imageUrl: '',
    mintDate: '2025-03-15',
    timeline: [
      { date: '2025-03-15', title: '首次发现', description: '在西湖边发现一棵约300年的银杏古树，树干粗壮，枝叶茂密。' },
      { date: '2025-04-02', title: '春芽萌发', description: '嫩绿的扇形小叶开始从枝头冒出，生机盎然。' },
      { date: '2025-05-10', title: '枝叶繁茂', description: '整棵树已被翠绿色的扇形叶片覆盖，形成巨大的绿色华盖。' },
    ],
  },
  {
    id: '2',
    name: '樱花树',
    species: 'Prunus serrulata',
    location: '公园小径',
    imageUrl: '',
    mintDate: '2025-02-20',
    timeline: [
      { date: '2025-02-20', title: '冬芽膨大', description: '花芽开始膨大，预示着春天的到来。' },
      { date: '2025-03-10', title: '初绽', description: '第一朵淡粉色的花瓣缓缓展开。' },
      { date: '2025-03-20', title: '满开', description: '整棵树被粉白色的花朵覆盖，花瓣随风飘落如雪。' },
      { date: '2025-04-05', title: '落英缤纷', description: '花期将尽，嫩绿的新叶开始替代花朵。' },
    ],
  },
  {
    id: '3',
    name: '月季玫瑰',
    species: 'Rosa chinensis',
    location: '社区花坛',
    imageUrl: '',
    mintDate: '2025-01-10',
    timeline: [
      { date: '2025-01-10', title: '冬季修剪', description: '进行冬季修剪，为来年开花做准备。' },
      { date: '2025-03-01', title: '新芽生长', description: '红色的新芽从枝条上冒出。' },
      { date: '2025-04-15', title: '首次开花', description: '今年的第一朵深红色月季绽放，花瓣层层叠叠。' },
    ],
  },
];
