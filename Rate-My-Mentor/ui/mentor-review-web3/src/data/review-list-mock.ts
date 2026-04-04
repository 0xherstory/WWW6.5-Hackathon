// 匿名评价列表模拟数据

export type ReviewItem = {
  id: string;
  companyName: string;
  department: string;
  overallScore: number;
  dimScores: number[];
  content: string;
  tags: string[];
  createdAt: number; // timestamp
  isPositive: boolean; // true = 正面, false = 负面
};

// 模拟数据 - 正负向各一半，活人感评价
export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "r-001",
    companyName: "字节跳动",
    department: "抖音电商运营部",
    overallScore: 5,
    dimScores: [5, 4, 5, 4, 5],
    content: "带教超级负责，每周都有1v1的成长沟通，会根据你的能力安排任务，新人也能接触到核心业务，团队氛围特别好，不强制加班，到点就能走。唯一缺点就是工区太大，找人不太方便。",
    tags: ["带教负责", "团队氛围好", "不加班"],
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-002",
    companyName: "某互联网小厂",
    department: "技术部",
    overallScore: 1,
    dimScores: [1, 2, 1, 1, 2],
    content: "垃圾公司，快跑！入职3个月天天无偿加班，周末还要随时待命，部门领导PUA一套一套的，画的饼一个都没兑现。承诺的13薪拖到现在都没发，已经准备提离职了。",
    tags: ["无偿加班", "PUA", "画饼"],
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
  {
    id: "r-003",
    companyName: "腾讯",
    department: "微信事业部",
    overallScore: 5,
    dimScores: [5, 5, 5, 4, 5],
    content: "福利拉满，三餐免费、班车免费、健身房免费，不打卡，不强制加班，同事都很厉害也很友好，新人带教体系特别完善，成长空间很大。唯一就是kpi压力有点大，但能接受。",
    tags: ["福利好", "不打卡", "带教完善"],
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-004",
    companyName: "某创业公司",
    department: "市场部",
    overallScore: 2,
    dimScores: [2, 2, 2, 1, 2],
    content: "加班时间太长了，天天晚上10点以后才能走，周末还要随时回消息，带教特别没耐心，问个问题就阴阳怪气。干了一个月就跑了，身体实在扛不住。",
    tags: ["加班多", "带教态度差", "随时待命"],
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
  {
    id: "r-005",
    companyName: "阿里巴巴",
    department: "阿里云技术部",
    overallScore: 5,
    dimScores: [5, 5, 4, 3, 5],
    content: "虽然节奏快，但是能学到真东西，领导不画饼，晋升体系透明，只要有能力就能上，团队氛围平等，没有上下级架子，有想法都能提。技术氛围很浓，能接触到大厂核心架构。",
    tags: ["技术氛围好", "晋升透明", "平等"],
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-006",
    companyName: "某中型企业",
    department: "技术部Java组",
    overallScore: 1,
    dimScores: [1, 2, 2, 1, 1],
    content: "招进来说是做核心开发，结果天天帮老员工擦屁股，改祖传垃圾代码，学不到任何新东西，还天天被甩锅。leader什么都不懂瞎指挥，代码review就是走过场，差评。",
    tags: ["打杂", "学不到东西", "甩锅"],
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
  {
    id: "r-007",
    companyName: "美团",
    department: "到店产品部",
    overallScore: 4,
    dimScores: [4, 5, 4, 4, 4],
    content: "同事都特别nice，没有办公室政治，新人入职有完整的培训体系，带教会手把手教，不会让你瞎摸索。加班不多，基本7点左右就能走，work-life balance很香。",
    tags: ["氛围好", "培训完善", "不加班"],
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-008",
    companyName: "某上市公司",
    department: "人事部门",
    overallScore: 1,
    dimScores: [1, 1, 2, 1, 2],
    content: "公司制度朝令夕改，这个月刚改的考勤，下个月又变，无偿加班是常态，连法定节假日都要值班，还没有加班费。hr态度也特别差，问个问题爱答不理的，强烈不建议。",
    tags: ["制度乱", "无偿加班", "hr态度差"],
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
  {
    id: "r-009",
    companyName: "网易",
    department: "互娱",
    overallScore: 5,
    dimScores: [5, 4, 5, 5, 5],
    content: "工作氛围特别轻松，不打卡，不内卷，领导很尊重下属的想法，不会瞎指挥，福利很好，下午茶、节日礼品从来没断过。能平衡工作和生活，这才是理想中的公司。",
    tags: ["氛围轻松", "福利好", "不内卷"],
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-010",
    companyName: "某独角兽公司",
    department: "产品部",
    overallScore: 2,
    dimScores: [2, 1, 2, 2, 3],
    content: "领导完全不懂业务，瞎提需求，上线前一天改需求是常态，出了问题全甩锅给下属，团队氛围压抑到极致。天天开会不开到晚上9点不算完，效率极低。",
    tags: ["需求乱改", "甩锅", "开会多"],
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
  {
    id: "r-011",
    companyName: "小米",
    department: "汽车部",
    overallScore: 5,
    dimScores: [5, 4, 5, 4, 5],
    content: "虽然是新业务，但是团队特别专业，能全程参与项目从0到1的过程，成长特别快。领导很有能力，也愿意给新人机会，薪资待遇也很有竞争力，适合想搞技术的人。",
    tags: ["成长快", "专业团队", "薪资好"],
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-012",
    companyName: "某电商公司",
    department: "销售部",
    overallScore: 1,
    dimScores: [2, 1, 1, 1, 2],
    content: "承诺的提成根本拿不到，各种克扣规则，天天逼加班打电话，完不成业绩就罚钱。底薪低的可怜，全靠提成，结果各种扣，纯纯压榨劳动力，已跑路。",
    tags: ["提成不兑现", "克扣", "压榨"],
    createdAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
  {
    id: "r-013",
    companyName: "拼多多",
    department: "市场部",
    overallScore: 4,
    dimScores: [4, 4, 4, 3, 4],
    content: "虽然节奏快，但是回报和付出成正比，提成给的很足，不克扣，团队都是年轻人，沟通很顺畅，没有弯弯绕绕。能快速积累行业经验，适合拼一把的年轻人。",
    tags: ["提成高", "效率高", "成长快"],
    createdAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-014",
    companyName: "某设计公司",
    department: "设计部",
    overallScore: 2,
    dimScores: [2, 3, 2, 2, 2],
    content: "需求改了十几版，最后用了第一版，领导审美一言难尽，天天让抄竞品，还说你没有创意。加班是家常便饭，改稿改到怀疑人生，没有任何个人发挥空间。",
    tags: ["需求改太多", "领导审美差", "无创意"],
    createdAt: Date.now() - 11 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
  {
    id: "r-015",
    companyName: "快手",
    department: "商业化部",
    overallScore: 4,
    dimScores: [4, 4, 5, 4, 4],
    content: "不强制加班，基本6点多就能下班，周末双休，团队氛围很好，领导不PUA，工作内容很有挑战性。能接触到行业前沿的东西，成长性好，推荐！",
    tags: ["不加班", "氛围好", "有挑战"],
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-016",
    companyName: "某传统企业",
    department: "财务部",
    overallScore: 2,
    dimScores: [2, 3, 2, 2, 2],
    content: "天天卡报销，几十块钱的报销要审半个月，公司各种抠门，下午茶都取消了，还天天喊着要员工有归属感。领导都是老油条，效率低到感人，晋升全看资历。",
    tags: ["报销难", "抠门", "看资历"],
    createdAt: Date.now() - 13 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
  {
    id: "r-017",
    companyName: "Bilibili",
    department: "内容运营部",
    overallScore: 5,
    dimScores: [5, 5, 5, 5, 5],
    content: "公司氛围特别好，都是年轻人，没有代沟，领导很尊重你的创意，不会瞎改内容。不加班，双休，福利也很好，能做自己喜欢的内容，这就是梦中情司！",
    tags: ["氛围好", "创意自由", "不加班"],
    createdAt: Date.now() - 22 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-018",
    companyName: "某外包公司",
    department: "技术部",
    overallScore: 1,
    dimScores: [1, 1, 1, 2, 1],
    content: "实习生快跑！这个公司招实习生就是来打杂的，端茶倒水、取快递、帮老员工做私活，根本接触不到正经工作。转正名额就是幌子，承诺的一个都没兑现。",
    tags: ["打杂", "转正坑", "廉价劳动力"],
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
  {
    id: "r-019",
    companyName: "华为",
    department: "终端部",
    overallScore: 4,
    dimScores: [4, 4, 4, 3, 4],
    content: "虽然工作节奏快，但是培训体系特别完善，能学到最前沿的技术，薪资待遇拉满。加班费、出差补贴都给的很足，晋升透明，只要有能力就能上，付出有回报。",
    tags: ["培训好", "薪资高", "晋升透明"],
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
    isPositive: true,
  },
  {
    id: "r-020",
    companyName: "某互联网大厂",
    department: "整体",
    overallScore: 2,
    dimScores: [2, 2, 2, 1, 3],
    content: "整个公司风气特别差，天天搞办公室政治，拉帮结派，认真干活的人被排挤，会拍马屁的升的快，完全不看能力。管理层全是关系户，普通人没出路。",
    tags: ["办公室政治", "不看能力", "关系户"],
    createdAt: Date.now() - 16 * 24 * 60 * 60 * 1000,
    isPositive: false,
  },
];

// 获取评价列表（可按公司筛选）
export function getReviews(companyName?: string): ReviewItem[] {
  if (!companyName) return MOCK_REVIEWS;
  return MOCK_REVIEWS.filter(
    (r) => r.companyName.toLowerCase().includes(companyName.toLowerCase())
  );
}

// 按最新发布排序
export function sortByNewest(reviews: ReviewItem[]): ReviewItem[] {
  return [...reviews].sort((a, b) => b.createdAt - a.createdAt);
}

// 按评分高低排序
export function sortByScore(reviews: ReviewItem[]): ReviewItem[] {
  return [...reviews].sort((a, b) => b.overallScore - a.overallScore);
}
