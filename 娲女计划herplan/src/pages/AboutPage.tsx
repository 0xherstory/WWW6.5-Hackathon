import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import herstoryLogo from "@/assets/herstory-logo.png";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <img 
            src={herstoryLogo} 
            alt="HerStory Logo" 
            className="w-64 h-auto"
          />
        </div>

        {/* Thank You Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            致谢
          </h1>
          
          <div className="bg-card p-8 rounded-lg border shadow-lg">
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              感谢女性Web3共学营的大力支持与帮助
            </p>
            
            <div className="space-y-4 text-lg text-foreground">
              <p>
                感谢herstory主讲人
                <span className="text-2xl font-bold mx-2 text-primary">bala</span>
              </p>
              
              <p>
                感谢
                <span className="text-2xl font-bold mx-2 text-primary">hesper</span>
                老师
              </p>
              
              <p>
                感谢
                <span className="text-2xl font-bold mx-2 text-primary">每每</span>
                老师
              </p>
              
              <p>
                感谢
                <span className="text-2xl font-bold mx-2 text-primary">大虾</span>
                老师
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-muted/30 rounded-lg">
            <p className="text-base text-muted-foreground italic mb-4">
              "娲女计划" 项目得以完成，离不开各位老师的悉心指导与支持。
              在这个探索女性历史与Web3技术结合的旅程中，我们收获良多。
            </p>
            
            <p className="text-base text-muted-foreground italic">
              感谢各位共学营小伙伴的欢乐和非常好的共学氛围，感受到大家在项目前期愿意听我讲我的项目，所有讨论和大家想法的交流。都是无价之宝！非常感谢！
            </p>
          </div>

          {/* Return to Homepage Button */}
          <div className="mt-12">
            <Link 
              to="/home"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;