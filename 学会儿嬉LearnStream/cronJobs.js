const cron = require('node-cron');
const { recordWeeklyLearningData } = require('./services/learningService');

// 每周上传学习数据到 IPFS 并更新合约
const cronJobs = () => {
    cron.schedule('0 0 * * 0', async () => {
        console.log('Starting weekly data processing...');
        try {
            await recordWeeklyLearningData(); // 处理每周学习数据
        } catch (err) {
            console.error('Error in weekly cron job:', err);
        }
    });
};

module.exports = cronJobs;