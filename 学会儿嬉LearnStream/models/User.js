const Database = require('../db/database');

const User = {
    create(data) {
        return Database.users.create(data);
    },

    findById(id) {
        return Database.users.findById(id);
    },

    findByEmail(email) {
        return Database.users.findByEmail(email);
    },

    findByPhone(phone) {
        return Database.users.findByPhone(phone);
    },

    findByWalletAddress(address) {
        return Database.users.findByWalletAddress(address);
    },

    findByEmailOrPhoneOrWallet(email, phone, walletAddress) {
        return Database.users.findByEmailOrPhoneOrWallet(email, phone, walletAddress);
    },

    update(id, data) {
        return Database.users.update(id, data);
    },

    updateTokens(id, tokenChange) {
        return Database.users.updateTokens(id, tokenChange);
    },

    updateLearningTime(id, duration) {
        return Database.users.updateLearningTime(id, duration);
    },

    getAll(limit = 10) {
        return Database.users.getAll(limit);
    }
};

module.exports = User;
