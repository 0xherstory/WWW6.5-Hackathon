const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// 1. 初始化数据库连接（使用本地 SQLite 文件）
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"),
  logging: false, // 设置为 true 可以看到 SQL 语句，方便调试
});

// 2. 定义 Stake 模型
const Stake = sequelize.define("Stake", {
  // 用户钱包地址
  userAddress: {
    type: DataTypes.STRING,
    allowDefault: false,
    set(value) {
      this.setDataValue("userAddress", value.toLowerCase());
    },
  },
  // 【关键字段】用户承诺不买的土狗币合约地址（即原来的 targetAddress）
  targetAddress: {
    type: DataTypes.STRING,
    allowDefault: false,
    set(value) {
      this.setDataValue("targetAddress", value.toLowerCase());
    },
  },
  // 质押金额 (AVAX)
  amount: {
    type: DataTypes.STRING,
    allowDefault: false,
  },
  // 锁定结束时间戳（秒）
  unlockTime: {
    type: DataTypes.INTEGER,
    allowDefault: false,
  },
  /**
   * 状态位设计：
   * 0: 监控中 (Staked/Active)
   * 1: 已安全取回 (Withdrawn/Success) - 如果你们有这个逻辑的话
   * 2: 已罚没 (Slashed/Failed)
   */
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

// 3. 导出模型和连接实例
module.exports = { sequelize, Stake };