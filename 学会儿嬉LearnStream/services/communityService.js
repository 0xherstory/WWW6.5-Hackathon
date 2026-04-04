const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

const createPost = async (userId, postData) => {
    try {
        const post = CommunityPost.create({
            userId: parseInt(userId),
            activityType: postData.activityType,
            activityTitle: postData.activityTitle,
            tokensEarned: postData.tokensEarned || 0
        });
        
        const user = User.findById(parseInt(userId));
        
        return {
            ...post,
            userId: {
                id: user.id,
                username: user.username,
                avatar: user.avatar
            }
        };
    } catch (err) {
        console.error('Create Post Error:', err);
        throw new Error('Failed to create post');
    }
};

const getPosts = async (limit = 20, offset = 0) => {
    try {
        const posts = CommunityPost.getAll(limit, offset);
        
        return posts.map(post => {
            const user = User.findById(post.userId);
            const likes = CommunityPost.getLikes(post.id);
            const comments = CommunityPost.getComments(post.id);
            
            return {
                _id: post.id,
                userId: {
                    _id: user?.id,
                    username: user?.username || 'Unknown',
                    avatar: user?.avatar || ''
                },
                activityType: post.activityType,
                activityTitle: post.activityTitle,
                tokensEarned: post.tokensEarned,
                likes: likes,
                comments: comments,
                createdAt: post.createdAt
            };
        });
    } catch (err) {
        console.error('Get Posts Error:', err);
        throw new Error('Failed to get posts');
    }
};

const likePost = async (postId, userId) => {
    try {
        const liked = CommunityPost.addLike(parseInt(postId), parseInt(userId));
        
        const post = CommunityPost.findById(parseInt(postId));
        const likeCount = CommunityPost.getLikeCount(parseInt(postId));
        
        return {
            ...post,
            liked: liked,
            likeCount: likeCount
        };
    } catch (err) {
        console.error('Like Post Error:', err);
        throw new Error('Failed to like post');
    }
};

const addComment = async (postId, userId, content) => {
    try {
        CommunityPost.addComment(parseInt(postId), parseInt(userId), content);
        
        const comments = CommunityPost.getComments(parseInt(postId));
        
        return comments;
    } catch (err) {
        console.error('Add Comment Error:', err);
        throw new Error('Failed to add comment');
    }
};

const tipUser = async (postId, fromUserId, amount) => {
    try {
        CommunityPost.addTip(parseInt(postId), parseInt(fromUserId), amount);
        
        const post = CommunityPost.findById(parseInt(postId));
        if (post) {
            User.updateTokens(post.userId, amount);
        }
        
        return post;
    } catch (err) {
        console.error('Tip User Error:', err);
        throw new Error('Failed to tip user');
    }
};

const getLeaderboard = async (limit = 10) => {
    try {
        const users = User.getAll(limit);
        
        return users.map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            tokens: user.tokens,
            learningStreak: user.learningStreak,
            totalLearningTime: user.totalLearningTime
        }));
    } catch (err) {
        console.error('Get Leaderboard Error:', err);
        throw new Error('Failed to get leaderboard');
    }
};

module.exports = {
    createPost,
    getPosts,
    likePost,
    addComment,
    tipUser,
    getLeaderboard
};
