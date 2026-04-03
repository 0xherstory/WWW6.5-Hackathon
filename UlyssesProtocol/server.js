const express = require('express');
const { Stake } = require('./db'); // 引入你之前创建的数据库模型
const app = express();
const PORT = 3001; // 这就是你同事截图中提到的端口

// 1. 允许前端跨域访问（联调必备）
const cors = require('cors'); 
app.use(cors()); 

// 2. 提供一个接口：获取所有质押黑名单记录
// 前端访问地址：http://localhost:3001/history
app.get('/history', async (req, res) => {
    try {
        const records = await Stake.findAll();
        res.json(records); // 把数据库里的数据发给前端
    } catch (error) {
        res.status(500).json({ error: "无法获取记录" });
    }
});

// 3. 启动服务
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 后端警察局已开门！`);
    console.log(`🔗 前端请访问: http://localhost:${PORT}/history`);
    console.log(`-----------------------------------------`);
});