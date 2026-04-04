const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(require('cors')());

console.log(`\n🛡️ HerGuard 后端启动`);
console.log(`通知模式: 📧 邮件\n`);

// 1. 邮件发送配置 (使用 465 稳健端口 + 超时保护)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  connectionTimeout: 10000, // 给它 10 秒连接时间
});

// 2. 邮件发送函数 (整合 Claude 建议的 async/await 写法 + 漂亮模板)
async function sendSOSEmail(recipientEmail, address, mapLink, timestamp, sosDetails) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; border: 1px solid #ddd; }
          .header { background-color: #ff0000; color: white; padding: 15px; border-radius: 5px; text-align: center; }
          .info-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 10px 0; color: #333; }
          .button { display: inline-block; background-color: #007bff; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🚨 紧急 SOS 求救</h1></div>
          <div class="info-box"><strong>📍 位置：</strong> ${address}</div>
          <div class="info-box"><strong>⏰ 时间：</strong> ${timestamp}</div>
          <div class="info-box"><strong>💼 钱包：</strong> ${sosDetails.walletAddress}</div>
          <p style="text-align: center;"><a href="${mapLink}" class="button">在地图上查看位置</a></p>
          <p style="font-size: 12px; color: #999; text-align: center;">HerGuard - 女性安全守护工具</p>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"HerGuard SOS" <${process.env.GMAIL_USER}>`,
    to: recipientEmail,
    subject: `🚨 紧急求救：${address}`,
    html: htmlContent
  };

  // 🌟 使用 Claude 建议的 async/await 写法
  const info = await transporter.sendMail(mailOptions);
  return { messageId: info.messageId };
}

// ============ API 端点 ============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'Email' });
});

app.post('/api/send-sos-sms', async (req, res) => {
  try {
    const { walletAddress, latitude, longitude, address, emergencyContacts } = req.body;

    if (!walletAddress || !latitude || !longitude || !address || !emergencyContacts) {
      return res.status(400).json({ success: false, error: '参数不完整' });
    }

    // 修正后的地图链接
    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const timestamp = new Date().toLocaleString('zh-CN');

    const results = [];
    for (const contact of emergencyContacts) {
      try {
        const result = await sendSOSEmail(contact.email, address, mapLink, timestamp, { walletAddress });
        results.push({ email: contact.email, status: 'success' });
      } catch (err) {
        results.push({ email: contact.email, status: 'failed', error: err.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🛡️ 后端运行在端口 ${PORT}`);
});