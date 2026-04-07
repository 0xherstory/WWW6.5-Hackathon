import ancientBooks from "@/assets/ancient-books.jpg";
import historicMulan from "@/assets/historic-mulan.jpg";
import empressWuZetian from "@/assets/empress-wu-zetian-new.jpg";
import fuHao from "@/assets/fu-hao-new.jpg";
import luZhi from "@/assets/lu-zhi.jpg";
import shangguanWaner from "@/assets/shangguan-waner.jpg";
import caiWenji from "@/assets/cai-wenji.jpg";
import huangDaopo from "@/assets/huang-daopo.jpg";
import liZhen from "@/assets/li-zhen.jpg";
import courtLady from "@/assets/court-lady.jpg";
import femaleWarrior from "@/assets/female-warrior.jpg";
import fengTaihou from "@/assets/feng-taihou.jpg";
import yelupuSuwna from "@/assets/yelupu-suwna.jpg";
import qinLiangyu from "@/assets/qin-liangyu.jpg";
import muGuiying from "@/assets/mu-guiying.jpg";
import maoHuanghou from "@/assets/mao-huanghou.jpg";
import liQingzhao from "@/assets/li-qingzhao.jpg";
import banZhao from "@/assets/ban-zhao.jpg";
import xieDaoyun from "@/assets/xie-daoyun.jpg";
import suHui from "@/assets/su-hui.jpg";
import nuwa from "@/assets/nuwa-new.jpg";
import fuJian from "@/assets/fu-jian.jpg";
import fuGui from "@/assets/fu-gui.jpg";
import fuWu from "@/assets/fu-wu.jpg";
import xianFuren from "@/assets/xian-furen.jpg";
import liangHongyu from "@/assets/liang-hongyu.jpg";
import pingyangPrincess from "@/assets/pingyang-princess.jpg";
import sunShangxiang from "@/assets/sun-shangxiang.jpg";
import luMu from "@/assets/lu-mu.jpg";
import sheSaihua from "@/assets/she-saihua.jpg";
import houSiniang from "@/assets/hou-siniang.jpg";
import huazhouTang from "@/assets/huazhou-tang.jpg";
import qingzhouWang from "@/assets/qingzhou-wang.jpg";
import pingzhouXi from "@/assets/pingzhou-xi.jpg";
import pingzhouGao from "@/assets/pingzhou-gao.jpg";
import feihuGao from "@/assets/feihu-gao.jpg";
import qinLiangyuNew from "@/assets/qin-liangyu-new.jpg";
import tangSaier from "@/assets/tang-saier.jpg";
import xuFuren from "@/assets/xu-furen.jpg";
import hongXuanjiao from "@/assets/hong-xuanjiao.jpg";
import zhouJinlian from "@/assets/zhou-jinlian.jpg";
import caiErmei from "@/assets/cai-ermei.jpg";
import heXiangu from "@/assets/he-xiangu.jpg";
import xiWangmu from "@/assets/xi-wangmu.png";
import leizu from "@/assets/leizu.png";
import change from "@/assets/change.png";
import xihe from "@/assets/xihe.png";
import xiheNew from "@/assets/xihe-new.png";
import shangui from "@/assets/shangui.png";
import xiheV3 from "@/assets/xihe-v3.png";
import xiheV4 from "@/assets/xihe-v4.png";
import houtu from "@/assets/houtu.jpg";
import qiuJin from "@/assets/qiu-jin.jpg";
import dengYingchao from "@/assets/deng-yingchao.jpg";
import songQingling from "@/assets/song-qingling.jpg";
import yangYinyu from "@/assets/yang-yinyu.jpg";
import jiutianXuannv from "@/assets/jiutian-xuannv.jpg";
import xuMuFuren from "@/assets/xu-mu-furen.jpg";
import wenJiang from "@/assets/wen-jiang.jpg";
import zhuoWenjun from "@/assets/zhuo-wenjun.jpg";
import zhaoE from "@/assets/zhao-e.jpg";
import xueTao from "@/assets/xue-tao.jpg";
import yuXuanji from "@/assets/yu-xuanji.jpg";
import fengXiaoqing from "@/assets/feng-xiaoqing.jpg";
import liuRushi from "@/assets/liu-rushi.jpg";
import wuZhengu from "@/assets/wu-zhengu.jpg";

import yuanJuli from "@/assets/yuan-juli.jpg";
import jingwei from "@/assets/jingwei.jpg";
import sunv from "@/assets/sunv.jpg";

export interface HistoricalFigure {
  id: number;
  name: string;
  dynasty: string;
  profession: string;
  birth: string;
  death: string;
  description: string;
  achievements: string[];
  modernRelevance: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  image: string;
}

export const historicalFigures: HistoricalFigure[] = [
  // 远古时期
  {
    id: 0,
    name: "女娲",
    dynasty: "远古",
    profession: "造物主",
    birth: "远古洪荒",
    death: "神话时代",
    description: "在远古洪荒的时代，天地未分，阴阳未定，山川混沌，人尚未生。有神名曰女娲（Nǚwā），她通天地，感阴阳。生化万物。其形：上体为人，下躯似龙，乃生命与大地的象征。女娲的功德：行于荒原，见大地沉寂、草木无灵，于是取黄土抟之，以己吹息，土化为人。众生脆弱，她化五色石修补残裂，使风雨有度、四时得序。于是天地安定，山川复立，生命再生。她有雷霆，以温顺之德造化；开统治为志，以哺育为心。她是万物本源，是大地自身的意志。她是造化之始。她的形象铭刻在古陶与岩壁之上——那是人类记忆中最早的神祇：世界自身的本体。",
    achievements: ["抟土造人", "炼五色石补天", "立四极正四时", "杀黑龙以济冀州"],
    modernRelevance: "女娲是文明之源，是人类和文明的缔造者，象征着生命、修复和创世精神。她在'尚未出现父系结构'的文化阶段的原型——她不是谁的'配偶'而是自然界的自我意识化身。人类学者普遍认为，女娲原本是'蛇图腾—地母'信仰的象征，与原始社会的母系制度紧密相连：她代表大地的再生，代表重建秩序的智慧，最能体现文明起源的开端意义。",
    tags: ["神话", "造物", "母神", "智慧", "文明起源"],
    viewCount: 3456,
    likeCount: 1567,
    image: nuwa
  },
  {
    id: 105,
    name: "西王母",
    dynasty: "远古",
    profession: "山神",
    birth: "远古神话",
    death: "神话时代",
    description: "西王母（Xī Wáng Mǔ）是中国古代神话中的重要女神，早期形象是掌管灾与福的山神，后来转变为长生仙界的主宰。她居于昆仑山，掌管不死之药和天界秩序。西王母也有豹尾虎齿的原始形象，表示她的力量来自野性与自然。她是长生与命运的象征，代表着人类对永恒的追求和对自然力量的敬畏。",
    achievements: ["掌管昆仑仙界", "守护不死之药", "主宰天界秩序", "执掌灾福"],
    modernRelevance: "西王母象征着人类对长生不老的追求和对命运的敬畏，她从原始山神到仙界主宰的转变，反映了中国神话体系的演变和女性神祇地位的变迁。她代表着野性与文明、自然与秩序的结合。",
    tags: ["神话", "山神", "长生", "命运", "昆仑"],
    viewCount: 2567,
    likeCount: 1123,
    image: xiWangmu
  },
  {
    id: 106,
    name: "羲和",
    dynasty: "远古",
    profession: "太阳母神",
    birth: "远古神话",
    death: "神话时代",
    description: "羲和（Xī Hé）是中国古代神话中的太阳母神，她是孕育太阳的女神，指导太阳东升西落，是秩序与时间的化身。她也是十日之母，在古代神话中掌控天体运转的秩序。羲和象征着光明、时间和宇宙规律，她的存在确保了日月星辰的有序运行，为人间带来光明和温暖。",
    achievements: ["孕育十个太阳", "掌控日出日落", "维护天体秩序", "确立时间规律"],
    modernRelevance: "羲和象征着时间的永恒流转和宇宙的秩序，她作为太阳母神，体现了古代人类对天体运行规律的认知和对光明的崇拜。她代表着母性力量与宇宙秩序的完美结合。",
    tags: ["神话", "太阳神", "时间", "秩序", "母神"],
    viewCount: 2234,
    likeCount: 987,
    image: xiheV4
  },
  {
    id: 107,
    name: "常羲",
    dynasty: "远古",
    profession: "月神",
    birth: "远古神话",
    death: "神话时代",
    description: "常羲（Cháng Xī），又称'常仪'，是中国古代神话中的月亮女神，掌管月亮的阴晴圆缺，与羲和相对。她象征隐秘与变化的秩序，是十二月之母。常羲的存在确保了月相的周期变化，为人间提供了计时的依据。她代表着强大的智慧和变化的力量。",
    achievements: ["孕育十二个月亮", "掌控月相变化", "维护阴阳平衡", "确立月历规律"],
    modernRelevance: "常羲象征着月亮的神秘和变化，她与羲和共同构成了日月秩序，体现了古代人类对天文现象的观察和对阴阳平衡的追求。她代表着隐秘智慧和周期变化的自然规律。",
    tags: ["神话", "月神", "变化", "阴阳", "母神"],
    viewCount: 2012,
    likeCount: 891,
    image: xihe
  },
  {
    id: 108,
    name: "嫦娥",
    dynasty: "远古",
    profession: "月神",
    birth: "远古神话",
    death: "神话时代",
    description: "嫦娥（Cháng É）最初是恒娥，古代神祇之一，后来被传为奔月的仙子。她代表圆满和恒定与人类对长生的追求，是永恒与不朽的象征。嫦娥奔月的传说体现了人类对月亮的浪漫想象和对永恒的向往，她在月宫中守护着永恒，成为中国文化中最具诗意的神话形象之一。",
    achievements: ["奔月成仙", "守护月宫", "象征永恒", "代表圆满"],
    modernRelevance: "嫦娥象征着人类对永恒和圆满的追求，她的故事反映了古代人类对长生不老的向往。她代表着永恒与力量的结合，是中国文化中最具浪漫色彩的女性形象。",
    tags: ["神话", "月神", "永恒", "长生", "浪漫"],
    viewCount: 3123,
    likeCount: 1456,
    image: change
  },
  {
    id: 109,
    name: "后土",
    dynasty: "远古",
    profession: "地母",
    birth: "远古神话",
    death: "神话时代",
    description: "后土（Hòu Tǔ）是中国古代神话中的'地之母'，掌管万物生长、山川大地。她是大地的化身，孕育万物，滋养生命。后土象征着厚德载物的品质，代表着母性的包容和生命的源泉。后世许多地方的土地祠，都源于她的原型。",
    achievements: ["掌管大地山川", "孕育万物生长", "承载生命", "厚德载物"],
    modernRelevance: "后土象征着大地的包容和母性的力量，她代表着生命的起源和万物的依托。她的形象体现了古代人类对大地的崇拜和感恩，是中国传统文化中重要的地母神形象。",
    tags: ["神话", "地母", "生育", "包容", "母神"],
    viewCount: 2345,
    likeCount: 1034,
    image: houtu
  },
  {
    id: 110,
    name: "九天玄女",
    dynasty: "远古",
    profession: "智慧女神",
    birth: "远古神话",
    death: "神话时代",
    description: "九天玄女是中国古代神话体系中的重要女神，带有明显的道教色彩，兼具'智慧''战争''天命授予者'等属性。她是天界的智者与导师，传授统治者兵法、道术，被称作'玄天圣母'，成为战争与策略的象征，兼具灵性与决断力。早期记载散见于汉代纬书与道教典籍，在道教体系中被视为上界女神，常与天书、兵法、符箓相关。代表性传说中，她在黄帝与蚩尤作战时下凡授予兵法与战阵之术，帮助黄帝取胜，象征文明战胜混沌。在《云笈七签》等道教典籍中，她是天界掌兵权、通玄机之神。其神格居'九天'象征最高天界层级，'玄'代表深奥与宇宙本源，掌兵法、阵图、权谋。",
    achievements: ["助黄帝战蚩尤，授兵法与战阵之术", "授兵书、符箓，掌天界兵权", "传授统治者兵法道术与玄机", "象征文明战胜混沌的智慧力量"],
    modernRelevance: "九天玄女象征着智慧、策略和决断力，她作为天界导师，体现了女性在智慧和战略领域的重要地位。她代表着知识的传承和智慧的力量，是古代文化中女性智慧的最高象征。她的'战争策略赋予者'形象，展现了女性不仅是柔美的象征，更是决断力与谋略的化身。",
    tags: ["神话", "智慧", "兵法", "战略", "导师", "道教", "黄帝", "符箓", "九天"],
    viewCount: 2678,
    likeCount: 1189,
    image: jiutianXuannv
  },
  {
    id: 112,
    name: "山鬼",
    dynasty: "远古",
    profession: "山神",
    birth: "远古神话",
    death: "神话时代",
    description: "山鬼是自然与灵性的化身，是古代山神的代表。远古时期鬼神是一体的，山神代表生命繁荣和喜悦。山鬼居于深山之中，与自然融为一体，象征着野性的力量和自然的强大。她的形象体现了古代人类对山林的敬畏和对自然灵性的崇拜。",
    achievements: ["守护山林", "象征自然灵性", "代表生命繁荣", "体现野性力量"],
    modernRelevance: "山鬼象征着自然的灵性和生命的野性力量，她代表着人类与自然和谐共处的理想。她的形象体现了古代人类对山林的敬畏和对自然力量的尊重，是中国传统文化中重要的自然神灵。",
    tags: ["神话", "山神", "自然", "灵性", "野性"],
    viewCount: 1987,
    likeCount: 876,
    image: shangui
  },
  {
    id: 104,
    name: "嫘祖",
    dynasty: "远古",
    profession: "发明家",
    birth: "远古时代",
    death: "神话时代",
    description: "嫘祖（Léi Zǔ）是中华丝绸文化的始祖，被尊为'始蚕'，传说中发明养蚕、缫丝的人，解决了人类的衣着问题，开创了丝绸文明，影响深远。她'衣被天下'，象征着物质文明的开创和传播。嫘祖的发明不仅改善了人们的生活，更促进了华夏文明的发展，使中国成为世界上最早掌握丝绸技术的国家。她代表了具体而伟大的、造福人类的物质文明的'第一次'创造，是'传播火种'的完美象征。",
    achievements: ["发明养蚕技术", "发明缫丝工艺", "开创丝绸文明", "解决人类衣着问题", "衣被天下"],
    modernRelevance: "嫘祖是中华丝绸文化的始祖，象征着物质文明的开创和传播。她的发明代表了人类早期科技创新的重要里程碑，体现了女性在推动文明进步中的关键作用。丝绸之路的开通更使中国的丝绸文化传播到世界各地，成为中华文明的重要标志。",
    tags: ["发明", "丝绸", "文明开创", "科技", "物质文明"],
    viewCount: 2890,
    likeCount: 1234,
    image: leizu
  },
  {
    id: 113,
    name: "精卫",
    dynasty: "远古",
    profession: "神话人物",
    birth: "远古时代",
    death: "神话时代",
    description: "精卫最早见于《山海经·北山经》：「炎帝之女，名曰女娃，又名精卫，常衔西山之木石，以堙于东海」。女娃，在东海与海水抗争，在肉身即将遭遇危险的时刻，化成了精卫鸟逃离了大海的追杀，最后她跨越大海，完成了这场抗争的最终胜利。她的核心是意志。东海象征巨大秩序与权力结构，精卫面对结构性不公仍然行动；她没有被海淹没，她没有停留在受害者位置，而是将愤怒转化为行动，成为最后的赢家。",
    achievements: ["以微小之力对抗庞然之物的不屈象征", "将创伤转化为持续行动的精神典范", "中国古代反抗命运精神的代表性神话"],
    modernRelevance: "精卫象征着面对巨大力量的不屈意志，她以微小之力对抗庞然之物的精神，成为中国文化中坚韧与抗争的永恒符号。她的故事启示我们：行动的意义不在于结果，而在于行动本身——面对不公，持续抗争就是力量。",
    tags: ["山海经", "炎帝之女", "意志", "抗争", "精卫填海"],
    viewCount: 3200,
    likeCount: 1580,
    image: jingwei
  },
  {
    id: 114,
    name: "素女",
    dynasty: "远古",
    profession: "知识传授者",
    birth: "远古时代",
    death: "神话时代",
    description: "素女是中国古代神话中的智慧女神，不仅是医术神祇，也是兵法与方术传授者。在某些版本中，她与九天玄女并列，为授术女神。在《素女经》《云笈七签》等道教文献中，素女常与黄帝相关，向黄帝讲解阴阳调和之术。她掌握身体与阴阳的理论解释权，是主动输出知识的形象——叙事结构是「素女讲，黄帝问」，她是技术与理论的输出者。",
    achievements: ["传授医术与阴阳调和理论", "与玄女并列为授术女神", "掌握身体与阴阳理论的解释权"],
    modernRelevance: "素女代表了女性作为知识掌握者与传授者的形象。在古代叙事中，她始终是主动的知识输出者，这打破了女性被动接受知识的刻板印象，体现了女性在医学、哲学与文化知识体系中的核心地位。",
    tags: ["医术", "阴阳", "道教", "知识传授", "智慧"],
    viewCount: 2650,
    likeCount: 1120,
    image: sunv
  },
  
  // 商朝 (约前1600-前1046年)
  { 
    id: 1,
    name: "妇好", 
    dynasty: "商", 
    profession: "将军", 
    birth: "约前1250年",
    death: "约前1200年",
    description: "妇好（Fù Hào）是商朝武丁时期的王，也是中国历史上有据可查的第一位女将军。她是将领、巫师、政治人物三者合一的女性，是史实层面'女娲精神的延续体'。她统率过1.3万人马的军队，参与讨伐羌方与土方。她主持重要祭祀仪式，拥有独立祭祀权（甲骨文中记'妇好卜'）。她在墓中随葬的青铜器上自署姓名——在遗留下来的商代记载中比较罕见。她是商王朝中唯一可确认的独立军事统帅女性。目前，她的墓（安阳小屯M5号墓）中出土了约200多件青铜礼器、玉器、象牙制品，彰显她的统治级身份。妇好是从'母神'到'国家女性统治者'的桥梁，她继承了女娲式的生养、镇灾与守护的象征，但转化为实际的政治权力与祭祀体系。",
    achievements: ["统率1.3万人马征战", "主持重要祭祀拥有独立祭祀权", "墓中出土约200多件青铜礼器玉器"],
    modernRelevance: "从母神到国家女性统治者的桥梁，展现了女性在军事、宗教和政治领域的统治级地位",
    tags: ["将军", "军士", "军事防御", "宗教", "政治", "将领", "巫师"],
    viewCount: 892,
    likeCount: 267,
    image: fuHao
  },
  {
    id: 101,
    name: "妇妌",
    dynasty: "商",
    profession: "祭司",
    birth: "约前1250年",
    death: "不详",
    description: "商代王室女性祭司，在甲骨文中多次被记载为主持祭祀或卜问事务。有学者认为她地位与妇好相当。她可能是女性祭司系统的一部分，表明王室中存在多个'女巫—夫人'结构，女性仍掌握一部分神职与政治职能。她们很可能保留并继承了巫职（即与祖先、地祇、雨、病、梦等有关的事务），男性瓜分了巫的一部分职能：成为男巫，主掌战争、收获、祭天。",
    achievements: ["主持王室祭祀仪式", "甲骨卜辞多次记载", "女性祭司集团成员"],
    modernRelevance: "证明商代存在女性祭司集团，女性在宗教和政治领域拥有重要地位",
    tags: ["宗教", "祭司", "政治", "巫"],
    viewCount: 456,
    likeCount: 178,
    image: fuJian
  },
  {
    id: 102,
    name: "妇癸",
    dynasty: "商",
    profession: "祭司",
    birth: "约前1250年",
    death: "不详",
    description: "商代王族女性，出现在甲骨卜辞中，似为王族女性，同样主持过祭祀活动。她与妇妌、妇好并称，说明当时的女性并非附属，而是继承了母系遗留的部分职能：一个'王族女性祭祀集团'。她们很可能保留并继承了巫职（即与祖先、地祇、雨、病、梦等有关的事务），证明商代女性在宗教领域的核心地位。",
    achievements: ["主持王室祭祀活动", "王族女性祭司成员", "甲骨文记载"],
    modernRelevance: "展现商代女性祭司集团的存在，证明母系社会职能的延续",
    tags: ["宗教", "祭司", "王族", "巫"],
    viewCount: 423,
    likeCount: 165,
    image: fuGui
  },
  {
    id: 103,
    name: "妇戊",
    dynasty: "商",
    profession: "祭司",
    birth: "约前1250年",
    death: "不详",
    description: "商代王族女性祭司，出现在甲骨卜辞中，与妇妌、妇癸、妇好并称为商代女性祭司集团的重要成员。她主持过多次祭祀活动，证明商代存在系统化的女性宗教职能体系。这些王族女性很可能保留并继承了巫职（即与祖先、地祇、雨、病、梦等有关的事务），而男性则逐渐瓜分了巫的一部分职能：成为男巫，主掌战争、收获、祭天。",
    achievements: ["主持王室祭祀", "女性祭司集团核心成员", "保留母系巫职传统"],
    modernRelevance: "证明商代女性在宗教领域的系统化职能，展现母系社会向父系社会过渡期的女性地位",
    tags: ["宗教", "祭司", "王族", "巫"],
    viewCount: 401,
    likeCount: 156,
    image: fuWu
  },
  
  // 春秋时期 (约前770-前476年)
  { 
    id: 2,
    name: "许穆夫人", 
    dynasty: "春秋", 
    profession: "诗人", 
    birth: "约前690年",
    death: "不详",
    description: "中国历史上第一位女诗人，卫国公主，许国夫人。卫国被狄人攻破后，她力主救援祖国，创作《载驰》等诗篇收录于《诗经》，其中'百尔所思，不如我所之'表达了她复国的决心。她孤身奔走于列国之间，展现出卓越的政治才能和纵横家风范。",
    achievements: ["中国第一位女诗人", "作品收录《诗经》", "为卫国复国奔走"],
    modernRelevance: "展现了古代女性的文学天赋和政治担当",
    tags: ["文学", "政治", "外交", "纵横家", "政治家", "外交官"],
    viewCount: 756,
    likeCount: 298,
    image: xuMuFuren
  },
  { 
    id: 3,
    name: "文姜", 
    dynasty: "春秋", 
    profession: "政治家", 
    birth: "约前730年",
    death: "约前673年",
    description: "春秋时期鲁国夫人，杰出的政治家和外交官。她主政期间频繁出使齐国，促进齐鲁两国关系修好，鲁国得以稳步发展。《春秋》尊其为夫人，谥号为'文'，意指其对治理国家居功甚伟。在女子干政备受争议的时代，她被认证为真正的治国之君。",
    achievements: ["促成齐鲁两国修好", "主持鲁国稳定发展", "卓越外交成就"],
    modernRelevance: "展现了古代女性在政治和外交领域的卓越才能",
    tags: ["政治", "外交", "治国"],
    viewCount: 678,
    likeCount: 245,
    image: wenJiang
  },
  
  // 西汉/新朝 (前206-220年)
  { 
    id: 33,
    name: "吕氏", 
    dynasty: "汉", 
    profession: "起义领袖", 
    birth: "约前20年",
    death: "约18年",
    description: "吕氏（Lǚ Shì）是西汉末年的第一位农民起义女领袖，因官府残暴不仁苛待百姓而起义。她变卖家产，招募数百名壮士，发动了中国历史上第一次由女性领导的农民起义。吕氏的起义虽然规模不大，但她的勇气和决心为后世女性参与政治斗争树立了榜样。她的故事也反映了西汉末年社会矛盾的尖锐和民众对腐败官吏的不满。",
    achievements: ["率众起义", "攻占县城", "第一位女性农民起义首领"],
    modernRelevance: "吕母是中国历史上第一位女性起义领袖，她的故事体现了母爱的力量和对不公正的勇敢反抗，为后世女性参与政治斗争提供了先例。",
    tags: ["起义首领", "政治家", "自立为王", "反抗", "复仇", "汉"],
    viewCount: 678,
    likeCount: 289,
    image: luMu
  },
  
  // 三国 (220-280年)
  { 
    id: 32,
    name: "孙尚香", 
    dynasty: "三国", 
    profession: "武将", 
    birth: "约200年",
    death: "约240年",
    description: "孙氏女，东吴公主。史料记载她习武、侍女配刀，性格刚烈，史书有关于她喜军武、好兵器的记载（《三国志》及后世注引）。存在于正史与三国志家族传，无明确独立将领列传，但史料记有其'好兵'的性格描写。",
    achievements: ["习武善战", "侍女配刀", "性格刚烈"],
    modernRelevance: "展现了三国时期女性的武艺和独立精神",
    tags: ["武艺", "刚烈", "三国"],
    viewCount: 987,
    likeCount: 412,
    image: sunShangxiang
  },
  
  // 汉朝 (前206-220年)
  { 
    id: 4,
    name: "吕雉", 
    dynasty: "汉", 
    profession: "执政者", 
    birth: "前241年",
    death: "前180年",
    description: "中国历史官方记录中第一位掌权的女性，统治稳健，奠定了汉初的政治基础。吕后无帝王之名却有掌政之实，她的权力和地位与皇帝无异，《史记》将其列入帝王本纪，足见其历史地位。她推行休养生息政策，巩固皇权制度，为汉朝的繁荣发展奠定基础。",
    achievements: ["稳定汉初政局", "推行休养生息政策", "巩固皇权制度"],
    modernRelevance: "展现了女性政治家的治国才能和历史作用",
    tags: ["执政者", "政治", "领导力", "政治家"],
    viewCount: 1045,
    likeCount: 398,
    image: luZhi
  },
  { 
    id: 5,
    name: "卓文君", 
    dynasty: "汉", 
    profession: "文学家", 
    birth: "约前175年",
    death: "约前121年",
    description: "才女，精通诗词和音乐，留下《白头吟》等名篇。她的诗作情感真挚，文学造诣深厚，展现了卓越的文学才华。她对汉赋和诗歌的发展做出了重要贡献，其《白头吟》《怨郎诗》等作品流传后世，成为古代女性文学的代表作品。",
    achievements: ["创作《白头吟》《怨郎诗》", "音乐才华出众", "文学造诣深厚"],
    modernRelevance: "代表了古代女性的文学才华和独立精神",
    tags: ["文学", "音乐", "诗歌"],
    viewCount: 567,
    likeCount: 234,
    image: zhuoWenjun
  },
  { 
    id: 6,
    name: "班昭", 
    dynasty: "汉", 
    profession: "史学家", 
    birth: "约45年",
    death: "约117年",
    description: "续写《汉书》的女史学家，也是著名的教育家。她完成了兄长班固未竟的《汉书》，成为中国古代少有的女性史学家。同时她还撰写《女诫》，担任宫廷教师，对后世影响深远。",
    achievements: ["完成《汉书》", "撰写《女诫》", "宫廷教师"],
    modernRelevance: "古代女性学者的杰出代表",
    tags: ["史学", "教育", "学术", "文学家"],
    viewCount: 654,
    likeCount: 234,
    image: banZhao
  },
  { 
    id: 7,
    name: "蔡文姬", 
    dynasty: "汉", 
    profession: "文学家", 
    birth: "约177年",
    death: "约249年",
    description: "才女，擅长诗词、音乐，著有《胡笳十八拍》，经历传奇。战争中不幸战败，后来历尽艰辛回归故土，其作品情感真挚，文学造诣深厚，是汉末文坛的璀璨明珠。",
    achievements: ["创作《胡笳十八拍》", "音乐造诣深厚", "文学才华出众"],
    modernRelevance: "展现了古代女性的文学天赋和坚韧品格",
    tags: ["文学", "音乐", "诗词", "文学家", "艺术家"],
    viewCount: 945,
    likeCount: 356,
    image: caiWenji
  },
  { 
    id: 8,
    name: "赵娥", 
    dynasty: "汉", 
    profession: "复仇者", 
    birth: "约120年",
    death: "不详",
    description: "东汉时期女侠，亲人被豪强杀害。在兄弟早逝、作为家族唯一继承人的情况下，她主动承担起复仇重任。面对邻里嘲笑，她夜夜磨刀，终在路上一刀斩马、三刀取敌首级。官府审理后，鉴于她为亲报仇的孝烈之举，不仅未治罪，反而表彰其行为，朝廷特赦。其事迹被列入《列女传》。",
    achievements: ["为亲报仇雪恨", "打破性别限制", "载入《列女传》"],
    modernRelevance: "展现了古代女性挑战性别规范、承担家族责任的勇气",
    tags: ["勇气", "孝道", "传奇"],
    viewCount: 892,
    likeCount: 367,
    image: zhaoE
  },
  
  // 前秦 (351-394年)
  { 
    id: 9,
    name: "毛氏", 
    dynasty: "前秦", 
    profession: "将军", 
    birth: "约360年",
    death: "约394年",
    description: "王女，将门之女，自幼习武，尤擅骑射。男帝为姚氏所袭时，毛氏弯弓跨马，率数百人与之交战，杀伤甚众，如有神助。姚某欲纳之，毛氏大骂：'吾为王女，岂为贼羌所辱'奋战到最后一刻不屈服，展现出英雌豪杰风范。",
    achievements: ["精通骑射武艺", "率军抗敌杀伤甚众", "奋战到最后一刻不屈服"],
    modernRelevance: "展现了古代女性的武艺才能和英雌豪杰风范",
    tags: ["军事", "武艺", "英雌"],
    viewCount: 612,
    likeCount: 245,
    image: maoHuanghou
  },
  { 
    id: 10,
    name: "苏蕙", 
    dynasty: "前秦", 
    profession: "诗人", 
    birth: "约357年",
    death: "约419年",
    description: "前秦才女，以创作织锦回文诗《璇玑图》闻名。该图总计841字，纵横各29字，纵、横、斜、交互、正、反读或退一字、迭一字读均可成诗，可解诗文数千首，是'中国古代回文诗登峰之作'。武则天为其作序，称'才情之妙，超古迈今'，宋代才女朱淑真亦著有《璇玑图记》。",
    achievements: ["创作《璇玑图》", "回文诗登峰之作", "文学成就卓著"],
    modernRelevance: "展现了古代女性的文学创造力和艺术才华",
    tags: ["文学", "诗歌", "创新", "文学家", "艺术家"],
    viewCount: 723,
    likeCount: 289,
    image: suHui
  },
  
  // 东晋 (317-420年)
  { 
    id: 11,
    name: "谢道韫", 
    dynasty: "东晋", 
    profession: "文学家",
    birth: "约376年",
    death: "约420年",
    description: "谢道韫（Xiè Dào Yùn），东晋时期著名女文学家，是宰相谢安的侄女，王羲之次子王凝之的妻子。她出身名门，才华横溢，尤其以'咏絮之才'闻名于世，吟出了千古名句'未若柳絮因风起'，展现了其非凡的诗才和想象力。谢道韫不仅精通诗文，还善于清谈，常与当时的名士辩论，展现出超凡的才智。夫君王凝之任会稽内史时，孙恩叛乱攻入会稽，谢道韫率家丁奋起持剑杀敌，失败后镇定赴死，获孙恩敬重而赦免。晚年寡居开讲坛传授学问，成为东晋士林文学与思想领袖。'风韵高迈、神情散朗，有林下风气'，堪称魏晋女性才情与胆识并重的典范。",
    achievements: ["咏雪名句传世", "率家丁杀敌抗贼", "开讲坛授学问"],
    modernRelevance: "谢道韫的'咏絮之才'成为后世形容女性才华的代名词，她突破了当时女性的传统角色，在文学和学术领域与男性平等交流，展现了女性的智慧和独立人格。",
    tags: ["文学家", "教育家", "勇气", "东晋"],
    viewCount: 834,
    likeCount: 312,
    image: xieDaoyun
  },
  
  // 北魏 (386-534年)
  { 
    id: 12,
    name: "冯太后", 
    dynasty: "北魏", 
    profession: "执政者", 
    birth: "442年",
    death: "490年",
    description: "冯太后（Féng Tài Hòu），北魏文明太后，起初地位不显，积极开拓人脉，步步为营从册立中宫、诛杀男权臣到两度临朝。她主导'太和改制'，推行汉化政策（均田制、班禄制等），促进了民族大融合。她推行俸禄制、均田令、三长制，奠定北魏汉化基础，为后世的治世打下坚实的基础。《魏书》载'事无巨细，一禀于太后'。她没有与男帝合葬，而是自起方山永固陵，从微末之女到北魏实际掌权者，真正'我命由我不由天'。她是以政治智慧和制度创新推动文明融合的统治者。",
    achievements: ["主导太和改制", "推行均田令班禄制三长制", "奠定北魏汉化基础", "促进民族大融合"],
    modernRelevance: "冯太后展现了古代女性的政治智慧和改革魄力，她是以政治智慧和制度创新推动文明融合的杰出女性。",
    tags: ["政治家", "执政者", "改革家", "制度改革", "民族融合", "北魏"],
    viewCount: 1087,
    likeCount: 456,
    image: fengTaihou
  },
  { 
    id: 13,
    name: "元莒犁", 
    dynasty: "北魏", 
    profession: "公主", 
    birth: "约500年",
    death: "约530年",
    description: "北魏公主，刚硬强悍，贼子攻入洛阳后，她怒斥'胡狗，敢辱天王女乎！'并反抗。其英勇行为被杨氏收录于《洛阳伽蓝记》，成为北魏皇室的典范。",
    achievements: ["斥骂敌方捍卫尊严", "反抗强权不屈服", "载入《洛阳伽蓝记》"],
    modernRelevance: "展现了古代女性的勇气和尊严意识",
    tags: ["勇气", "反抗", "尊严"],
    viewCount: 589,
    likeCount: 234,
    image: yuanJuli
  },
  { 
    id: 14,
    name: "花木兰", 
    dynasty: "北魏", 
    profession: "军人", 
    birth: "约412年",
    death: "约502年",
    description: "替父从军的巾帼英雄，体现了女性的勇气和坚韧。她女扮男装从军十二年，展现出卓越的军事才能，在战场上屡建奇功，指挥作战能力突出。她不仅武艺高强，更具备出色的军事指挥能力和战略眼光。'同行十二年，不知木兰是女郎'的故事流传千古，展现了女性在军事领域的卓越才能。",
    achievements: ["服役十二年", "战功卓著指挥作战", "军事才能突出"],
    modernRelevance: "挑战性别刻板印象，展现女性多元可能",
    tags: ["军事", "勇气", "坚韧", "军事家"],
    viewCount: 1567,
    likeCount: 789,
    image: historicMulan
  },
  
  // 南北朝/隋 (约500-600年)
  { 
    id: 15,
    name: "冼夫人", 
    dynasty: "隋", 
    profession: "统治者",
    birth: "约522年",
    death: "约602年",
    description: "冼夫人（Xiǎn Fū Rén），又称谯国夫人，是南北朝至隋朝时期的杰出女性政治家和军事家。她是南方高凉地区的俚人（少数民族）首领，历经梁、陈、隋三朝，统辖岭南十州。她多次平定叛乱（李迁仕、欧阳纥），促成岭南归隋，奏请设立崖州（今海南），结束海南长期割据。被隋文帝封为'谯国夫人'，授开府仪同三司。史书记载其平定叛乱，保境安民，对岭南地区的安定和发展有重大贡献。被称为'巾帼英雄第一人'。事迹见于《隋书》、《资治通鉴》等。",
    achievements: ["统辖岭南十州", "平定多次叛乱", "促成海南设州", "保境安民"],
    modernRelevance: "冼夫人是中国历史上杰出的女性统治者，她以智慧和勇气维护了国家统一，促进了民族融合，被后世尊为'岭南圣母'，至今在岭南地区仍受到人们的崇敬。",
    tags: ["统治者", "政治家", "军事家", "少数民族", "南北朝"],
    viewCount: 967,
    likeCount: 398,
    image: xianFuren
  },
  
  // 唐朝 (618-907年)
  { 
    id: 16,
    name: "陈硕真", 
    dynasty: "唐", 
    profession: "起义领袖", 
    birth: "620年",
    death: "653年",
    description: "中国历史上第一位既做领袖又称皇帝的女性，比武则天称帝早37年。她自幼孤苦，因开仓济民被捕，后隐于深山发展信众。永徽四年（653年）十月起义，自称'文佳皇帝'，建立政权。起义军迅速发展到数万人，攻占睦州及诸县，朝野震动。虽最终失败被俘就义，但其事迹在民间广为流传，对后世农民起义有直接影响。",
    achievements: ["中国第一位称帝女性", "领导农民起义", "建立政权称文佳皇帝"],
    modernRelevance: "展现了古代女性的革命勇气和领导才能",
    tags: ["起义首领", "政治家", "自立为王", "皇帝", "唐"],
    viewCount: 1234,
    likeCount: 512,
    image: femaleWarrior
  },
  { 
    id: 17,
    name: "武则天", 
    dynasty: "唐", 
    profession: "皇帝", 
    birth: "624年",
    death: "705年",
    description: "武则天（Wǔ Zé Tiān），中国历史上唯一的正统女皇帝，政治手腕高超，推动了唐朝的繁荣。她建立武周王朝，推行科举制度，重用人才，打击门阀士族，发展经济，在位期间国力强盛，为开元盛世奠定基础。除了当过皇帝以外，她本人还是个音乐家、作曲家、文学家、书法家、农学家。她亲自编撰了一本农书叫《兆人本业记》，被以后的唐朝皇帝封为唐朝正式的官修农业规范。",
    achievements: ["建立武周王朝", "推行科举制度", "重用人才", "编撰《兆人本业记》农书", "多领域成就"],
    modernRelevance: "现代女性领导力的典型代表，展现了女性在政治、文学、艺术、农学等多领域的卓越才能",
    tags: ["皇帝", "政治家", "领导力", "改革", "音乐家", "作曲家", "文学家", "书法家", "农学家"],
    viewCount: 1534,
    likeCount: 656,
    image: empressWuZetian
  },
  { 
    id: 18,
    name: "上官婉儿", 
    dynasty: "唐", 
    profession: "宰相",
    birth: "664年",
    death: "710年",
    description: "上官婉儿（Shàng Guān Wǎn ér），武则天时期的女官和文学家，掌管制诰，有'巾帼宰相'之称。她掌管朝廷文书，推动文学发展，政治影响力深远。其诗词才华出众，对唐代文学发展有重要贡献。",
    achievements: ["掌管朝廷文书", "推动文学发展", "政治影响力深远"],
    modernRelevance: "体现了古代女性在政治和文学领域的双重成就",
    tags: ["宰相", "政治家", "文学家", "唐"],
    viewCount: 876,
    likeCount: 312,
    image: shangguanWaner
  },
  { 
    id: 19,
    name: "薛涛", 
    dynasty: "唐", 
    profession: "诗人", 
    birth: "约768年",
    death: "约832年",
    description: "女诗人，才华横溢，曾制'薛涛笺'供文人书写诗文。她的诗作流传后世，在文坛地位崇高，与当时许多著名诗人都有唱和往来，展现了古代女性的创新精神和文学成就。",
    achievements: ["诗作流传后世", "发明薛涛笺", "文坛地位崇高"],
    modernRelevance: "体现了古代女性的创新精神和文学成就",
    tags: ["文学", "诗歌", "创新", "艺术家"],
    viewCount: 634,
    likeCount: 198,
    image: xueTao
  },
  { 
    id: 20,
    name: "鱼玄机", 
    dynasty: "唐", 
    profession: "诗人", 
    birth: "约844年",
    death: "约871年",
    description: "女诗人，作品大胆，充满情感与哲理。她的诗歌风格独特，情感表达真挚，哲理思考深刻，敢于表达内心真实情感，体现了古代女性的独立思考和情感自由。",
    achievements: ["诗作风格独特", "情感表达真挚", "哲理思考深刻"],
    modernRelevance: "体现了古代女性的独立思考和情感表达",
    tags: ["文学", "哲理", "情感"],
    viewCount: 445,
    likeCount: 167,
    image: yuXuanji
  },
  { 
    id: 30,
    name: "平阳昭公主", 
    dynasty: "唐", 
    profession: "将军", 
    birth: "约598年",
    death: "623年",
    description: "昭公主，性格强硬，用兵如神，为李唐江山立下首等战功。她起兵建立唐朝，在关中地区招募和领导娘子军，立下赫赫战功。史书记录她曾'勒兵万余'为建国出力，却仅以军礼下葬，没有姓名流传，令人扼腕。事迹见于《旧唐书》《新唐书》《资治通鉴》。",
    achievements: ["组建娘子军", "招募万余兵马", "助建唐朝", "以军礼下葬"],
    modernRelevance: "展现了古代女性在军事领导和政治变革中的重要作用",
    tags: ["军事", "政治", "领导力", "建国功臣"],
    viewCount: 1234,
    likeCount: 567,
    image: pingyangPrincess
  },
  { 
    id: 35,
    name: "侯四娘", 
    dynasty: "唐", 
    profession: "守城战士",
    birth: "约730年",
    death: "不详",
    description: "安史之乱期间，史思明叛乱时，侯四娘在卫州举血盟请战、组织女丁参战守城。史料（杂记与《太平广记》《资治通鉴》片段）记载了她的事迹，证其'曾经参与/组织抗敌'。她是众多在国难时刻挺身而出的女性代表之一。",
    achievements: ["组织女丁守城", "举血盟请战", "参与抗敌"],
    modernRelevance: "展现了古代女性在国难时刻的担当精神",
    tags: ["军事", "守城", "抗敌", "勇气"],
    viewCount: 456,
    likeCount: 189,
    image: houSiniang
  },
  { 
    id: 36,
    name: "滑州唐氏", 
    dynasty: "唐", 
    profession: "守城战士",
    birth: "约730年",
    death: "不详",
    description: "安史之乱期间，史思明叛乱时，滑州唐氏组织女丁参战守城。史料（杂记与《太平广记》《资治通鉴》片段）记载了她与侯氏、王氏等女性在城池被围时组织抵抗的事迹。展现了唐代女性在危难时刻的勇气和组织能力。",
    achievements: ["组织守城", "参与抗敌", "保卫家园"],
    modernRelevance: "证明古代女性在战争中的实际参与和贡献",
    tags: ["军事", "守城", "抗敌"],
    viewCount: 423,
    likeCount: 176,
    image: huazhouTang
  },
  { 
    id: 37,
    name: "青州王氏", 
    dynasty: "唐", 
    profession: "守城战士",
    birth: "约730年",
    death: "不详",
    description: "安史之乱期间，史思明叛乱时，青州王氏组织女丁参战守城。史料（杂记与《太平广记》《资治通鉴》片段）记载在史思明叛乱时，青州等地有妇女（王氏）组织女丁参战或守城。这些记载证明了唐代女性在战时的实际军事参与。",
    achievements: ["组织女丁守城", "参与抗敌", "保卫城池"],
    modernRelevance: "展现了古代女性在战争中的实际作用",
    tags: ["军事", "守城", "抗敌"],
    viewCount: 401,
    likeCount: 165,
    image: qingzhouWang
  },
  { 
    id: 38,
    name: "平州奚氏", 
    dynasty: "唐", 
    profession: "守城战士",
    birth: "约680年",
    death: "不详",
    description: "武则天时期，在突厥或契丹侵扰时，平州刺史之妻奚氏率家僮与城内女丁固守城池、协助守城并获朝廷褒奖。多处正史/地方志记载了武则天时期的表彰。在《旧唐书》《资治通鉴》与地方志、碑志中有记载，正史与地方志结合。",
    achievements: ["率家僮守城", "组织女丁参战", "获朝廷褒奖"],
    modernRelevance: "证明唐代女性守城参战获得官方认可",
    tags: ["军事", "守城", "朝廷褒奖"],
    viewCount: 467,
    likeCount: 198,
    image: pingzhouXi
  },
  { 
    id: 39,
    name: "平州高氏", 
    dynasty: "唐", 
    profession: "守城战士",
    birth: "约680年",
    death: "不详",
    description: "武则天时期，在突厥或契丹侵扰时，平州地区高氏协助守城并获朝廷褒奖。与奚氏等女性一起，在《旧唐书》《资治通鉴》与地方志、碑志中有记载，展现了唐代女性在边境防御中的重要作用。",
    achievements: ["协助守城", "抵御入侵", "获朝廷表彰"],
    modernRelevance: "证明唐代女性在边境防御中的贡献",
    tags: ["军事", "守城", "边境防御"],
    viewCount: 445,
    likeCount: 187,
    image: pingzhouGao
  },
  { 
    id: 40,
    name: "飞狐县高氏", 
    dynasty: "唐", 
    profession: "守城战士", 
    birth: "约700年",
    death: "不详",
    description: "突厥攻飞狐县时，县令之妻高氏协助守城并得朝廷嘉奖的事迹载于史料和奏议中，显示唐代确有女性参与守卫地方的正式记载。她的事迹证明了唐代女性在地方防御中的实际贡献获得了官方认可。",
    achievements: ["协助守城", "抵御突厥", "获朝廷嘉奖"],
    modernRelevance: "展现唐代女性参与地方防御的史实",
    tags: ["军事", "守城", "朝廷嘉奖"],
    viewCount: 478,
    likeCount: 201,
    image: feihuGao
  },
  
  // 宋朝 (960-1279年)
  { 
    id: 21,
    name: "穆桂英", 
    dynasty: "宋", 
    profession: "将军", 
    birth: "约1020年",
    death: "约1080年",
    description: "杨家将故事中的传奇女将，英勇善战。虽多为后世演义，但形象深入人心，代表了中国文化中英勇女性的理想形象。她征战沙场多年，保家卫国功绩卓著，民间传说经典。",
    achievements: ["征战沙场多年", "保家卫国功绩", "民间传说经典"],
    modernRelevance: "代表了中国文化中英勇女性的理想形象",
    tags: ["军事", "传说", "英勇"],
    viewCount: 1234,
    likeCount: 445,
    image: muGuiying
  },
  { 
    id: 34,
    name: "佘赛花", 
    dynasty: "宋", 
    profession: "将军", 
    birth: "约928年",
    death: "不详",
    description: "北宋传说人物（杨家将体系），民间与戏曲中称她统率寡妇守城、百岁挂帅等；正史中没完整的将领列传，但局部碑志/地方志与某些墓志、戏文有影子，可能有原型女性存在。她的形象代表了古代女性在家国危难时刻的担当精神。",
    achievements: ["统率守城", "百岁挂帅传说", "杨家将体系核心人物"],
    modernRelevance: "民间传说中女性领导力的代表",
    tags: ["军事", "传说", "领导力"],
    viewCount: 876,
    likeCount: 367,
    image: sheSaihua
  },
  { 
    id: 31,
    name: "梁红玉", 
    dynasty: "宋", 
    profession: "将军", 
    birth: "约1102年",
    death: "约1135年",
    description: "南宋女将，随丈夫韩世忠抗金。曾在黄天荡等战役中以击鼓指挥、激励将士并据称参与指挥战斗，史书有其事迹多出现在韩世忠的传记与建炎纪事中。她亲临前线，擂鼓助战，是南宋抗金战争中的杰出女性军事人物。",
    achievements: ["击鼓助战黄天荡", "参与指挥战斗", "抗金功臣"],
    modernRelevance: "展现了古代女性在军事指挥中的实际作用",
    tags: ["军事", "抗金", "指挥", "将领"],
    viewCount: 1345,
    likeCount: 589,
    image: liangHongyu
  },
  { 
    id: 42,
    name: "许夫人", 
    dynasty: "宋", 
    profession: "起义领袖", 
    birth: "约1260年",
    death: "约1280年",
    description: "南宋末年畲族抗元起义军首领，在广东潮州地区领导起义反抗元朝统治，被视为古代少有的女军事家。地方文献如《潮州府志》有其事迹记载。她是南方少数民族女性抗争精神的代表。",
    achievements: ["领导抗元起义", "潮州地区军事领袖", "少数民族女性领袖"],
    modernRelevance: "展现了少数民族女性的反抗精神和军事才能",
    tags: ["军事", "起义", "少数民族", "抗元"],
    viewCount: 567,
    likeCount: 234,
    image: xuFuren
  },
  { 
    id: 22,
    name: "李清照", 
    dynasty: "宋", 
    profession: "词人", 
    birth: "1084年",
    death: "1155年",
    description: "婉约词派代表人物，文学才华出众，作品情感真挚。她创作《声声慢》等名篇，词学理论贡献卓著，还从事金石学研究。经历国破家亡的变故，词风由清新婉约转为沉郁悲凉，展现了古代女性的文学天赋和独立思考。",
    achievements: ["创作《声声慢》等名篇", "词学理论贡献", "金石学研究"],
    modernRelevance: "展现了古代女性的文学天赋和独立思考",
    tags: ["文学", "艺术", "学者", "考古学家"],
    viewCount: 987,
    likeCount: 324,
    image: liQingzhao
  },
  
  // 辽/金 (916-1234年)
  { 
    id: 23,
    name: "耶律普速完", 
    dynasty: "金", 
    profession: "皇帝", 
    birth: "约1162年",
    death: "约1213年",
    description: "武则天之后，中国历史上第二位女皇帝。她是辽代后裔，金朝末年在边疆地区建立政权，自称皇帝，虽然政权存在时间短暂，但她依然是中国历史上罕见的女性统治者，展现了女性的政治抱负和领导能力。",
    achievements: ["建立边疆政权", "自称皇帝统治", "女性统治者典范"],
    modernRelevance: "展现了古代女性的政治抱负和领导能力",
    tags: ["政治", "皇帝", "领导力"],
    viewCount: 845,
    likeCount: 334,
    image: yelupuSuwna
  },
  
  // 宋元时期 (宋元交替)
  { 
    id: 44,
    name: "周金莲", 
    dynasty: "宋元", 
    profession: "起义领袖", 
    birth: "约1250年",
    death: "不详",
    description: "宋元时期史料中记载的南方少数民族叛乱或起义军女性首领之一。这几位人物在南方地区的少数民族起义中曾被提及，如部分地方志和民族史料中记载了她们的事迹，体现了南方民族地区女性军事人才的活跃。",
    achievements: ["领导起义", "南方少数民族领袖", "地方志记载"],
    modernRelevance: "展现了南方少数民族女性的反抗精神",
    tags: ["起义", "少数民族", "领袖"],
    viewCount: 423,
    likeCount: 176,
    image: zhouJinlian
  },
  { 
    id: 45,
    name: "蔡二妹", 
    dynasty: "宋元", 
    profession: "起义领袖", 
    birth: "约1260年",
    death: "不详",
    description: "宋元时期史料中记载的南方少数民族起义军女性首领。部分地方志和民族史料中记载了她的事迹，展现了南方民族地区女性在军事领域的活跃表现。她与周金莲、何仙姑等女性一起，代表了这一时期少数民族女性的反抗力量。",
    achievements: ["参与领导起义", "少数民族女性领袖", "地方史料记载"],
    modernRelevance: "证明宋元时期南方少数民族女性的军事参与",
    tags: ["起义", "少数民族", "军事"],
    viewCount: 401,
    likeCount: 165,
    image: caiErmei
  },
  { 
    id: 46,
    name: "何仙姑", 
    dynasty: "宋元", 
    profession: "起义领袖", 
    birth: "约1270年",
    death: "不详",
    description: "宋元时期史料中记载的南方少数民族起义军女性首领。部分地方志和民族史料中记载了她的事迹，体现了南方民族地区女性军事人才的活跃。她可能兼具精神领袖和军事领导的双重角色。",
    achievements: ["领导起义", "精神与军事领袖", "地方志记载"],
    modernRelevance: "展现了宋元时期女性在宗教与军事领域的影响力",
    tags: ["起义", "少数民族", "精神领袖"],
    viewCount: 456,
    likeCount: 189,
    image: heXiangu
  },
  
  // 元朝 (1271-1368年)
  { 
    id: 24,
    name: "黄道婆", 
    dynasty: "元", 
    profession: "纺织家", 
    birth: "约1245年",
    death: "约1330年",
    description: "纺织家，改进棉纺技术，被誉为中国棉纺织业的奠基人。她向黎族人民学习纺织技术，回到家乡后推广改进的纺织工具和技术，大大提高了棉纺织效率，推广棉花种植，对中国纺织业发展做出重要贡献。",
    achievements: ["改进纺织技术", "推广棉花种植", "技术创新贡献"],
    modernRelevance: "展现了古代女性在科技创新领域的重要贡献",
    tags: ["科技", "创新", "工艺"],
    viewCount: 723,
    likeCount: 298,
    image: huangDaopo
  },
  
  // 明朝 (1368-1644年)
  { 
    id: 25,
    name: "秦良玉", 
    dynasty: "明", 
    profession: "将军", 
    birth: "1574年",
    death: "1648年",
    description: "明末女将，四川忠州（今属重庆）人。她是中国历史上唯一一位作为王朝名将被单独立传记载到正史将相列传的女性（《明史·秦良玉传》），率领'白杆兵'参加了平播、抗击后金（清军）、平定各地叛乱等多次重要战役。她的军事才能获得朝廷高度认可，展现了女性卓越的军事指挥能力。",
    achievements: ["正史独立立传", "率领白杆兵", "参与多次重要战役", "抗击后金"],
    modernRelevance: "中国历史上唯一被正史独立立传的女性名将",
    tags: ["军事", "名将", "白杆兵", "正史"],
    viewCount: 1456,
    likeCount: 678,
    image: qinLiangyuNew
  },
  { 
    id: 41,
    name: "唐赛儿", 
    dynasty: "明", 
    profession: "起义领袖", 
    birth: "约1399年",
    death: "不详",
    description: "明初农民起义首领，在山东发动起义反抗官府。她的事迹在史书中记载不多，但民间流传广泛，部分地方志和野史有记载，例如《明史纪事本末》中提及。她展现了明初女性的反抗精神和组织能力。",
    achievements: ["发动山东起义", "组织农民反抗", "地方志记载"],
    modernRelevance: "展现了明初女性的反抗精神",
    tags: ["起义", "领袖", "反抗"],
    viewCount: 634,
    likeCount: 267,
    image: tangSaier
  },
  { 
    id: 26,
    name: "冯小青", 
    dynasty: "明", 
    profession: "诗人", 
    birth: "约1595年",
    death: "约1612年",
    description: "诗人，作品感伤幽怨，有'闺阁才女'之誉。她的诗词作品传世，文学风格独特，是明代才女的典型代表，体现了古代女性的文学天赋和情感表达。",
    achievements: ["诗词作品传世", "文学风格独特", "才女典型代表"],
    modernRelevance: "体现了古代女性的文学天赋和情感表达",
    tags: ["文学", "诗词", "才女"],
    viewCount: 412,
    likeCount: 156,
    image: fengXiaoqing
  },
  { 
    id: 27,
    name: "柳如是", 
    dynasty: "明", 
    profession: "诗人", 
    birth: "1618年",
    death: "1664年",
    description: "才女、诗人，参与明清易代的政治文化活动，具有传奇色彩。她诗词造诣深厚，参与政治活动，文化影响深远，展现了古代女性的政治参与意识和文化贡献。",
    achievements: ["诗词造诣深厚", "参与政治活动", "文化影响深远"],
    modernRelevance: "展现了古代女性的政治参与和文化贡献",
    tags: ["文学", "政治", "才女"],
    viewCount: 812,
    likeCount: 267,
    image: liuRushi
  },
  
  // 清朝 (1644-1912年)
  { 
    id: 28,
    name: "吴贞姑", 
    dynasty: "清", 
    profession: "工艺师", 
    birth: "约1650年",
    death: "约1720年",
    description: "工艺大师，擅长雕刻和刺绣，工艺精湛。她的雕刻技艺超群，刺绣工艺精湛，对工艺传承做出重要贡献，展现了古代女性在传统工艺领域的精湛技艺。",
    achievements: ["雕刻技艺超群", "刺绣工艺精湛", "工艺传承贡献"],
    modernRelevance: "展现了古代女性在传统工艺领域的精湛技艺",
    tags: ["工艺", "艺术", "传统"],
    viewCount: 298,
    likeCount: 89,
    image: wuZhengu
  },
  { 
    id: 43,
    name: "洪宣娇", 
    dynasty: "清", 
    profession: "起义首领",
    birth: "约1830年",
    death: "约1864年",
    description: "洪宣娇（本名杨宣娇，一说非洪秀全之妹，而是太平天国时期的杰出起义女性领导者，太平天国西王娘'洪宣娇'实为'杨宣娇'。可能本叫王云娇。）她是太平天国早期杰出的女性组织者，参与领导了金田起义，并担任过重要职务，如'总监军'等。她后因反抗权力规则而被边缘化，最终湮没于史册。事迹见于《太平天国史》、《李秀成自述》等太平天国文献和相关史料。",
    achievements: ["参与金田起义", "担任总监军", "太平天国核心女性组织者"],
    modernRelevance: "展现了近代女性在革命运动中的领导作用和反抗权力规则的勇气",
    tags: ["起义首领", "政治家", "自立为王", "太平天国", "革命", "清"],
    viewCount: 876,
    likeCount: 389,
    image: hongXuanjiao
  },
  
  // 近现代 (1875-1990年)
  {
    id: 45,
    name: "秋瑾",
    dynasty: "近现代",
    profession: "革命家",
    birth: "1875年11月8日",
    death: "1907年7月15日",
    description: "秋瑾（Qiū Jǐn），字竞雄，号鉴湖女侠，浙江绍兴人，中国近代史上极具传奇色彩的女革命者、诗人、教育家。她出身书香家庭，自幼聪慧好学，不愿受束于闺阁，勇于追求知识与自由。成年后毅然离家前往日本求学，接受新式教育，深入研究社会与民族问题，逐渐形成了强烈的革命思想。回国后，她创办学堂，以教育启蒙为名传播新思想，秘密训练青年，期望通过知识与行动改变民族命运。她主张妇女受教育、参与社会事务，提出'巾帼不让须眉'的理念。1907年，她因参与反抗清政府的行动被捕，从容就义，年仅三十二岁。她的诗文慷慨激烈，常以豪气与悲愤并存的语调表达民族独立与女性觉醒的决心，如'秋风秋雨愁煞人'成为她精神的写照。",
    achievements: ["创办学堂传播新思想", "提倡妇女教育与社会参与", "秘密训练革命青年", "创办《白话报》《中国女报》", "以身殉国成为革命先驱"],
    modernRelevance: "秋瑾像烈火，点燃民族意识与女性觉醒。她是中国女性独立自主的象征，她的'巾帼不让须眉'理念影响了后世无数女性。她既是反清革命的先驱，也是中国近代女权运动的开拓者。她的一生短暂而绚烂，如燃烧的火炬，代表着女性独立与民族解放的双重追求。",
    tags: ["革命", "诗人", "教育", "女权", "烈士", "鉴湖女侠"],
    viewCount: 2456,
    likeCount: 1123,
    image: qiuJin
  },
  {
    id: 46,
    name: "邓颖超",
    dynasty: "近现代",
    profession: "妇女运动家",
    birth: "1904年",
    death: "1992年",
    description: "邓颖超（Dèng Yǐngchāo），出生于广西，童年失去双亲，却自幼立志报国。青年时期，她投身学生运动，宣传新思想，致力于唤醒青年的社会责任感。她是中国妇女运动的重要组织者之一，长期致力于推动妇女教育、就业与社会保障事业。她主张女性应拥有与男性平等的社会地位和发展机会，坚定推动性别平等理念的传播与实践。在政治与社会活动中，她保持着坚毅、节制与理性的品格，被认为是'清醒的力量'。她晚年仍积极参与国家事务与公益事业，倡导和平与节俭，以沉稳而深远的方式影响了中国社会的发展。",
    achievements: ["组织妇女运动推动性别平等", "致力于妇女教育与就业保障", "参与学生运动传播新思想", "倡导和平与社会公益事业", "树立女性独立自强的典范"],
    modernRelevance: "邓颖超如磐石，稳固女性与社会的平等基础。她的一生体现了坚毅、理性与节制的品格，为中国妇女争取平等权利做出了重要贡献。她不仅是妇女运动的组织者，更是社会进步的推动者，其'清醒的力量'影响了几代中国女性。",
    tags: ["妇女运动", "教育", "社会改革", "政治", "公益"],
    viewCount: 1876,
    likeCount: 845,
    image: dengYingchao
  },
  {
    id: 47,
    name: "宋庆龄",
    dynasty: "近现代",
    profession: "人道主义者",
    birth: "1893年",
    death: "1981年",
    description: "宋庆龄（Sòng Qìnglíng），出生于一个重视教育的家庭，自幼受中西文化熏陶，思想开放而独立。青年时期，她积极参与社会改革与慈善事业，提倡民族自立与民众教育。她是中国近代史上最早倡导妇女独立与社会平权的代表人物之一，创办了多个救助机构与儿童福利组织。她一生倡导和平、人道与社会正义，关心教育与医疗体系建设，致力于改善妇女儿童的生活条件。在国际社会上，她以坚毅、温和而坚定的形象，赢得了广泛尊敬，被誉为'人民的母亲'和'二十世纪最崇高的女性之一'。她的一生体现了对和平与人道的执着追求。",
    achievements: ["创办救助机构与儿童福利组织", "倡导妇女独立与社会平权", "推动教育与医疗体系建设", "致力于和平与社会正义事业", "在国际上赢得广泛尊敬"],
    modernRelevance: "宋庆龄似清泉，以温和的信念滋养和平与慈悲。她是中国人道主义的典范，一生致力于妇女儿童福利、教育医疗与和平事业。她的'人民的母亲'形象代表了女性温柔而坚定的力量，展现了女性在社会公益与国际事务中的重要作用。",
    tags: ["人道主义", "慈善", "妇女权益", "儿童福利", "和平", "教育"],
    viewCount: 2134,
    likeCount: 967,
    image: songQingling
  },
  {
    id: 48,
    name: "杨荫榆",
    dynasty: "近现代",
    profession: "教育家",
    birth: "1884年",
    death: "1938年",
    description: "杨荫榆（Yáng Yìnyú），出生于江苏无锡一个书香世家。她曾赴日本东京女子高等师范学校就读，之后又赴美国留学，在哥伦比亚大学获得教育学硕士学位。1924年，她被任命为国立北京女子师范大学校长——成为中国近代史上第一位国立大学女校长。就任后，她推动该校从师范学校升格为大学，设立教育学、文学、自然科学等多个系科，以本科教育为主，授予学士学位。她因校务管理与学生运动产生冲突，于1925年辞职。此后她继续从事教育事业，曾在苏州女子师范学校任教，并创办'二乐女子学术研究社'，致力于女性教育与学术研究。抗日战争期间，她拒绝出任伪职，多次向侵华日军抗议暴行，并收容、保护被迫害的妇女与女学生。1938年1月，她因向日军抗议并试图保护妇女而遭诱捕杀害。",
    achievements: ["成为中国第一位国立大学女校长", "推动女师大升格为正规大学", "赴日美留学获教育学硕士学位", "创办二乐女子学术研究社", "抗战中收容保护受迫害妇女"],
    modernRelevance: "杨荫榆以女性身份担任国立大学校长，本身就具有破除性别限制、挑战传统束缚的重要象征意义。她推动女子高等教育现代化，是近代中国女性接受高等教育的重要里程碑。尽管她因校务立场与时代背景成为争议人物，但全面审视她的学术背景、教育理念、后期实践与抗战中的正义行动，她展现出先进与积极的一面，诠释了'女子亦可为天地立心'的意义。",
    tags: ["教育", "大学校长", "女性教育", "抗战", "学术研究"],
    viewCount: 1456,
    likeCount: 678,
    image: yangYinyu
  },
  { 
    id: 29,
    name: "李贞",
    dynasty: "近现代", 
    profession: "开国将军", 
    birth: "1907年",
    death: "1990年",
    description: "中国人民解放军第一位女将军，湖南平江人。18岁参加革命，先后参加了湘赣边界秋收起义、湘赣和湘鄂川黔根据地反'围剿'斗争、红军长征。长期从事地方妇女运动、后勤与政治工作。1955年授衔时被授予开国少将，但因其特殊地位，后来晋升为女中将（新中国唯一的女中将）。她被官方列入'开国将帅'，民间称为'开国元勋'。",
    achievements: ["参加秋收起义和长征", "授衔开国少将后晋升中将", "长期从事革命工作"],
    modernRelevance: "新中国唯一的女中将，开国将帅中的女性代表",
    tags: ["军事", "政治", "开国将军"],
    viewCount: 1156,
    likeCount: 534,
    image: liZhen
  }
];

// 朝代列表
export const dynasties = [
  { name: "远古", period: "洪荒时代", characteristics: "神话时代，母系社会，女神崇拜，造物与生育的象征" },
  { name: "商", period: "约前1600-前1046年", characteristics: "青铜文明，女性地位相对较高，有女将军和女祭司" },
  { name: "春秋", period: "约前770-前476年", characteristics: "诸侯争霸，文化多元，女性开始在文学政治领域崭露头角" },
  { name: "汉", period: "前206-220年", characteristics: "儒家文化兴起，女性教育开始受重视，出现杰出政治家" },
  { name: "三国", period: "220-280年", characteristics: "三国鼎立，战乱纷争，女性在军事和政治中也有身影" },
  { name: "前秦", period: "351-394年", characteristics: "民族融合时期，文学艺术发展，女性才华得以展现" },
  { name: "东晋", period: "317-420年", characteristics: "士族文化繁荣，女性在文学教育领域表现突出" },
  { name: "北魏", period: "386-534年", characteristics: "民族融合时期，女性角色多元化，出现重要政治改革家" },
  { name: "隋", period: "581-618年", characteristics: "统一时期，岭南地区女性领袖崛起" },
  { name: "唐", period: "618-907年", characteristics: "开放包容，女性地位相对较高，文学艺术繁荣，女性守城抗敌事迹频现" },
  { name: "宋", period: "960-1279年", characteristics: "文化繁荣，出现众多女性文学家和传奇人物" },
  { name: "宋元", period: "宋元交替", characteristics: "南方少数民族女性起义活跃" },
  { name: "金", period: "1115-1234年", characteristics: "北方少数民族政权，女性统治者罕见出现" },
  { name: "元", period: "1271-1368年", characteristics: "民族融合，技术创新，出现杰出女性科技人才" },
  { name: "明", period: "1368-1644年", characteristics: "文化发达，才女辈出，女性在文学军事领域表现突出" },
  { name: "清", period: "1644-1912年", characteristics: "传统工艺发达，女性在手工艺领域成就显著，近代革命运动中女性开始参与" },
  { name: "近现代", period: "1875-1990年", characteristics: "革命时期，女性开始在军事政治领域发挥重要作用，女权运动兴起" }
];

// 职业列表
export const professions = [
  "皇帝", "皇后", "太后", "公主", "将军", "文学家", "史学家", 
  "纺织家", "工艺师", "统治者", "起义首领", 
  "开国将军", "政治家", "复仇者", "祭司", "造物主", "执政者",
  "宰相", "纵横家", "外交官", "改革家", "艺术家", "考古学家", "军事家",
  "守城战士", "名将", "发明家", "革命家", "妇女运动家", "人道主义者", "教育家",
  "神话人物", "知识传授者"
];
