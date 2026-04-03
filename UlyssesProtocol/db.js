const { Sequelize, DataTypes } = require('sequelize');

// 1. 初始化数据库
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false 
});

// 2. 定义质押模型（整合了所有字段的最终版）
const Stake = sequelize.define('Stake', {
    userAddress: { type: DataTypes.STRING, allowNull: false },
    targetAddress: { type: DataTypes.STRING, allowNull: false }, // 用户“禁买”的币种地址
    amount: { type: DataTypes.STRING, allowNull: false },
    unlockTime: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.INTEGER, defaultValue: 0 },       // 0: 监控中, 2: 违约
    violationTxHash: { type: DataTypes.STRING, allowNull: true } // 记录冲动交易的证据 Hash
});

// 3. 导出模型
module.exports = { sequelize, Stake };