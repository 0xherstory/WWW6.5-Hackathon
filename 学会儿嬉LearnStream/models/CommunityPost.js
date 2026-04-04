const Database = require('../db/database');

const CommunityPost = {
    create(data) {
        return Database.communityPosts.create(data);
    },

    findById(id) {
        return Database.communityPosts.findById(id);
    },

    getAll(limit = 20, offset = 0) {
        return Database.communityPosts.getAll(limit, offset);
    },

    addLike(postId, userId) {
        return Database.communityPosts.addLike(postId, userId);
    },

    getLikes(postId) {
        return Database.communityPosts.getLikes(postId);
    },

    addComment(postId, userId, content) {
        return Database.communityPosts.addComment(postId, userId, content);
    },

    getComments(postId) {
        return Database.communityPosts.getComments(postId);
    },

    addTip(postId, fromUserId, amount) {
        return Database.communityPosts.addTip(postId, fromUserId, amount);
    },

    getTips(postId) {
        return Database.communityPosts.getTips(postId);
    }
};

module.exports = CommunityPost;
