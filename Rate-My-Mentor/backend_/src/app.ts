// ✅ 第一行：必须先加载环境变量！！！
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import rootRouter from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';

const app = express();

// 🔥 终极修复：固定端口 3000，彻底解决类型报错
const PORT = 3000;

// 健康检查接口（放到最前面，不被任何中间件拦截）
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Rate My Mentor 后端服务运行正常', timestamp: new Date().toISOString() });
});

// 全局中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// 挂载根路由
app.use('/api/v1', rootRouter);

// 全局错误处理
app.use(errorMiddleware);

// 启动服务（标准无错写法）
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 后端服务已启动，运行在端口 ${PORT}`);
  console.log(`📊 健康检查地址：/health`);
});
