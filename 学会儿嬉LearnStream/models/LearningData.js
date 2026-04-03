const Database = require('../db/database');

const LearningData = {
    create(data) {
        return Database.learningData.create(data);
    },

    findByUserId(userId, limit = 20) {
        return Database.learningData.findByUserId(userId, limit);
    },

    getAll(limit = 50) {
        return Database.learningData.getAll(limit);
    }
};

module.exports = LearningData;
