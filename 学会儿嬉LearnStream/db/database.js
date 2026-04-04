const users = new Map();
const learningData = [];
const communityPosts = [];
const postLikes = new Map();
const postComments = new Map();
const postTips = new Map();

let userIdCounter = 1;
let learningIdCounter = 1;
let postIdCounter = 1;

const Database = {
    users: {
        create(data) {
            const user = {
                id: userIdCounter++,
                username: data.username,
                email: data.email,
                phone: data.phone || null,
                password: data.password,
                walletAddress: data.walletAddress || null,
                avatar: data.avatar || '',
                tokens: 0,
                learningStreak: 0,
                totalLearningTime: 0,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
            };
            users.set(user.id, user);
            return user;
        },

        findById(id) {
            return users.get(parseInt(id)) || null;
        },

        findByEmail(email) {
            for (const user of users.values()) {
                if (user.email === email) return user;
            }
            return null;
        },

        findByPhone(phone) {
            for (const user of users.values()) {
                if (user.phone === phone) return user;
            }
            return null;
        },

        findByWalletAddress(address) {
            for (const user of users.values()) {
                if (user.walletAddress === address) return user;
            }
            return null;
        },

        findByEmailOrPhoneOrWallet(email, phone, walletAddress) {
            for (const user of users.values()) {
                if (user.email === email || user.phone === phone || user.walletAddress === walletAddress) {
                    return user;
                }
            }
            return null;
        },

        update(id, data) {
            const user = users.get(parseInt(id));
            if (!user) return null;
            Object.assign(user, data);
            user.lastLoginAt = new Date().toISOString();
            return user;
        },

        updateTokens(id, tokenChange) {
            const user = users.get(parseInt(id));
            if (user) {
                user.tokens += tokenChange;
            }
            return user;
        },

        updateLearningTime(id, duration) {
            const user = users.get(parseInt(id));
            if (user) {
                user.totalLearningTime += duration;
            }
            return user;
        },

        getAll(limit = 10) {
            return Array.from(users.values())
                .sort((a, b) => b.tokens - a.tokens)
                .slice(0, limit);
        }
    },

    learningData: {
        create(data) {
            const learningItem = {
                id: learningIdCounter++,
                userId: parseInt(data.userId),
                ipfsHash: data.ipfsHash || null,
                learningType: data.learningType || 'vocabulary',
                duration: data.duration || 0,
                tokensEarned: data.tokensEarned || 0,
                language: data.language || 'english',
                notes: data.notes || '',
                createdAt: new Date().toISOString()
            };
            learningData.push(learningItem);
            return learningItem;
        },

        findByUserId(userId, limit = 20) {
            return learningData
                .filter(item => item.userId === parseInt(userId))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        },

        getAll(limit = 50) {
            return learningData
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        }
    },

    communityPosts: {
        create(data) {
            const post = {
                id: postIdCounter++,
                userId: parseInt(data.userId),
                activityType: data.activityType,
                activityTitle: data.activityTitle,
                tokensEarned: data.tokensEarned || 0,
                createdAt: new Date().toISOString()
            };
            communityPosts.push(post);
            return post;
        },

        findById(id) {
            return communityPosts.find(post => post.id === parseInt(id)) || null;
        },

        getAll(limit = 20, offset = 0) {
            return communityPosts
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(offset, offset + limit);
        },

        addLike(postId, userId) {
            const key = `${postId}:${userId}`;
            if (postLikes.has(key)) {
                postLikes.delete(key);
                return false;
            } else {
                postLikes.set(key, new Date().toISOString());
                return true;
            }
        },

        getLikes(postId) {
            const likes = [];
            for (const [key, timestamp] of postLikes.entries()) {
                if (key.startsWith(`${postId}:`)) {
                    const userId = parseInt(key.split(':')[1]);
                    likes.push(userId);
                }
            }
            return likes;
        },

        addComment(postId, userId, content) {
            const comments = postComments.get(postId) || [];
            comments.push({
                id: comments.length + 1,
                userId: parseInt(userId),
                content: content,
                createdAt: new Date().toISOString()
            });
            postComments.set(postId, comments);
            return comments;
        },

        getComments(postId) {
            return postComments.get(postId) || [];
        },

        addTip(postId, fromUserId, amount) {
            const tips = postTips.get(postId) || [];
            tips.push({
                id: tips.length + 1,
                fromUserId: parseInt(fromUserId),
                amount: amount,
                createdAt: new Date().toISOString()
            });
            postTips.set(postId, tips);
        },

        getTips(postId) {
            return postTips.get(postId) || [];
        }
    },

    init() {
        console.log('In-memory database initialized');
    }
};

module.exports = Database;
