import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import bambooBirdsBg from "@/assets/bamboo-birds-bg.jpg";

export const ProjectIntroDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 font-fangsong">
          <BookOpen className="w-4 h-4 mr-2" />
          项目介绍
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-y-auto ancient-card-dialog relative"
        style={{
          backgroundImage: `url(${bambooBirdsBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 半透明遮罩层确保文字可读性 */}
        <div className="absolute inset-0 bg-white/85 rounded-[20px]"></div>
        <div className="flex gap-6 p-6 relative z-10">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/logo.jpg" 
              alt="娲女计划 Logo" 
              className="w-24 h-24 rounded-lg object-cover border border-border"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-4 text-sm font-fangsong leading-relaxed">
            <p>
              古事，就是人类的通用的经验和记忆的记载，可以是谚语，是民间故事，是英娥传奇，是神话传说。当我们目遇险境，身陷囹圄，我们会回溯自己和古老人类通用的智慧经验，这些古事会在我们的文化意识里发挥巨大的作用。而妗解的含义就是用如今我们的视角发出疑问：在近千年来由男性意志把控的记载中，这个世界大部分留下来的，对女性说的那些经验，真的是在为我们好吗？积腐陈旧的古事，是时候了，是时候该今天的女人重新定义它。娲女计划的由来，就是起源于我想"让我们女人重新构建，重新定义历史"的这种愿望。
            </p>
            
            <p>
              今天的我想要一种可能性：我想要新故事可以给明年的女性，甚至是明天看到这些故事的女性，提供一种生命经验。也就能为她们提供一种全新的人生视角和无限的生命可能。改编古事，是突破也是审视，突破脑子里面既有的刻板文化，审视那些文化中藏在字与字之间的对所有女人的规训。改编好像很容易，同时又很难。
            </p>
            
            <p>
              我很难列举我们要完成各自生命中的哪些出逃，完成对身上枷锁的哪些审视，要多冷峻地看待自己的欲望，要剔除哪些怯懦，要包容哪一部分自我。。。。我相信对每个人来说，课题都不同。
            </p>
            
            <p>
              对我来说，改编最难的部分，就是在这个故事的结局，我无法落笔，我无法确定——这些女人要走向哪里？以前，在我笔下改编或者自创的人物中，我不知道要怎么写下去，我和我故事中的人一起卡在了人生的某一阶段。我有好几年一直认为，这是无解的，是一个娜拉难题。但是在我翻阅其他人写的原创故事中，我越来越得到更多的力量和可能。我在那些近乎真实的，文字创造的世界里找到了答案。
            </p>
            
            <p className="text-primary font-medium text-center">寻找同伴，寻找同伴。</p>
            
            <p>
              我相信现实中，在那些看不见的旧有结构内打转的女性，也拥有着自己的女性母系社会最小单位。而女人，只要她的自我认同也是女人，她就一定会寻找同伴。她也就会开始选择不把自己的人生希望，交付给父权家庭，这个转变非常，非常重要。娲女计划，我想要这个系列一直写下去，我想要不断挖掘女性自己的历史生命，直到我们能够从容地想象，一个完全没有男人的世界🌎。
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};