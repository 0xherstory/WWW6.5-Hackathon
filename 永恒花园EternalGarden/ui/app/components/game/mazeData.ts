/** 0 = path, 1 = wall */
export type MazeGrid = number[][];

export type MemoryFragment = {
  id: string;
  /** 年代，弹窗顶部展示 */
  year: string;
  /** 记忆物件图标（emoji，接近原版） */
  icon: string;
  title: string;
  titleEn: string;
  content: string;
  gx: number;
  gy: number;
};

export const STORY_INTRO = {
  title: '林奶奶的记忆迷宫',
  titleEn: "Grandma Lin's Memory Maze",
  subtitle: '1935 - 2024',
  description:
    '在这座由记忆构筑的迷宫中，每一块砖石都承载着林奶奶一生的故事。漫步其间，拾起散落的记忆碎片，聆听那些被时光温柔保存的往事。',
  totalFragments: 8,
} as const;

/** 通关页文案（与原版前端一致，对齐永恒花园主站气质） */
export const STORY_COMPLETE = {
  title: '记忆拼图完成',
  titleEn: 'All Memories Collected',
  body:
    '你已经收集了林奶奶所有的记忆碎片。这些珍贵的瞬间，将在永恒花园中永远绽放。感谢你的陪伴与聆听。',
  quoteEn: 'Every memory is a flower in the eternal garden',
  btnCollection: '查看图鉴',
  btnAgain: '重新探索',
} as const;

/** 15×15 迷宫；外围为墙 */
export const MAZE_LEVEL: {
  cols: number;
  rows: number;
  grid: MazeGrid;
  fragments: MemoryFragment[];
} = {
  cols: 15,
  rows: 15,
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  fragments: [
    {
      id: 'f1',
      year: '1942',
      icon: '🧵',
      title: '母亲的针线筐',
      titleEn: "Mother's Sewing Basket",
      content:
        '战争年代物资匮乏，母亲用一双巧手，把旧衣服改成新衣裳。那个竹编的针线筐，是林奶奶对母爱最深的记忆。',
      gx: 2,
      gy: 1,
    },
    {
      id: 'f2',
      year: '1956',
      icon: '🗝️',
      title: '老宅门后的钥匙',
      titleEn: 'The Old Key',
      content:
        '黄铜钥匙磨得发亮。每次推开吱呀作响的木门，堂屋里的光便落在青石台阶上——那是童年里「回家」的声音。',
      gx: 10,
      gy: 1,
    },
    {
      id: 'f3',
      year: '1968',
      icon: '📷',
      title: '第一台相机',
      titleEn: 'The First Camera',
      content:
        '父亲攒下的第一台胶片相机，记录过婚礼、满月和许多笨拙的笑脸。林奶奶说，快门声一响，时间就被轻轻留住了。',
      gx: 3,
      gy: 5,
    },
    {
      id: 'f4',
      year: '1975',
      icon: '📖',
      title: '借来的书',
      titleEn: 'Borrowed Books',
      content:
        '从街道图书馆借来的书页泛黄，却带着油墨香。她在空白处写满批注，像在和另一个时空的人对话。',
      gx: 11,
      gy: 5,
    },
    {
      id: 'f5',
      year: '1984',
      icon: '🌱',
      title: '窗台上的绿萝',
      titleEn: 'The Windowsill Vine',
      content:
        '一盆水培绿萝从厨房窗台爬到阳光里。她说：只要根还在水里，日子就总有新芽。',
      gx: 2,
      gy: 9,
    },
    {
      id: 'f6',
      year: '1991',
      icon: '❤️',
      title: '写给爱人的信',
      titleEn: 'Letters to Love',
      content:
        '信封上邮票贴得歪歪扭扭，却写满了「平安」二字。那些信在抽屉里躺了多年，纸张脆了，字仍温柔。',
      /* 原 (12,9) 在网格中为墙，改为可走格 */
      gx: 11,
      gy: 9,
    },
    {
      id: 'f7',
      year: '1998',
      icon: '🌸',
      title: '春天的樱花',
      titleEn: 'Spring Blossoms',
      content:
        '小区外那条街开满樱花。她牵着孙女走过，花瓣落在白发上，像给岁月轻轻别了一枚发夹。',
      /* 原 (4,13) 在网格中为墙，改为可走格 */
      gx: 5,
      gy: 13,
    },
    {
      id: 'f8',
      year: '2005',
      icon: '🍼',
      title: '摇篮边的歌',
      titleEn: 'Lullaby by the Cradle',
      content:
        '她轻哼着不成调的小曲，哄着曾孙入睡。那一刻，房间里只有呼吸与心跳，像整个世界都安静了下来。',
      gx: 11,
      gy: 13,
    },
  ],
};

/** 开发时校验：碎片必须在可走格子上，否则永远无法收集 */
if (process.env.NODE_ENV !== "production") {
  for (const f of MAZE_LEVEL.fragments) {
    if (MAZE_LEVEL.grid[f.gy][f.gx] !== 0) {
      console.error(`[mazeData] 碎片 ${f.id} 坐标 (${f.gx},${f.gy}) 为墙格，请修正`);
    }
  }
}
