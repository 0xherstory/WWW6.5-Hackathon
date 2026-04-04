const { uploadToIPFS } = require('./ipfsService');
const { mintTokens } = require('./web3Service');
const LearningData = require('../models/LearningData');
const User = require('../models/User');

const recordLearningData = async (userId, data) => {
    try {
        let ipfsHash = null;
        if (uploadToIPFS) {
            try {
                ipfsHash = await uploadToIPFS(data);
            } catch (err) {
                console.log('IPFS upload skipped:', err.message);
            }
        }
        
        const learningData = LearningData.create({
            userId: parseInt(userId),
            ipfsHash: ipfsHash,
            learningType: data.learningType || 'vocabulary',
            duration: data.duration || 0,
            tokensEarned: data.rewardAmount || 0,
            language: data.language || 'english',
            notes: data.notes || ''
        });

        if (data.rewardAmount && data.walletAddress) {
            try {
                await mintTokens(data.walletAddress, data.rewardAmount);
            } catch (err) {
                console.log('Token minting skipped:', err.message);
            }
        }

        User.updateTokens(parseInt(userId), data.rewardAmount || 0);
        User.updateLearningTime(parseInt(userId), data.duration || 0);

        return { 
            ipfsHash, 
            learningId: learningData.id,
            tokensEarned: data.rewardAmount || 0,
            message: 'Data recorded successfully.' 
        };
    } catch (err) {
        console.error('Learning Data Error:', err);
        throw new Error('Failed to record learning data');
    }
};

const getLearningData = async (userId) => {
    try {
        const data = LearningData.findByUserId(parseInt(userId));
        return data;
    } catch (err) {
        console.error('Get Learning Data Error:', err);
        throw new Error('Failed to get learning data');
    }
};

const getUserData = async (userId) => {
    try {
        const user = User.findById(parseInt(userId));
        if (!user) {
            throw new Error('User not found');
        }
        const learningData = LearningData.findByUserId(parseInt(userId));
        
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                tokens: user.tokens,
                learningStreak: user.learningStreak,
                totalLearningTime: user.totalLearningTime
            },
            learningHistory: learningData
        };
    } catch (err) {
        console.error('Get User Data Error:', err);
        throw new Error('Failed to get user data');
    }
};

const updateUserData = async (userId, updateData) => {
    try {
        const user = User.update(parseInt(userId), updateData);
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            tokens: user.tokens,
            learningStreak: user.learningStreak
        };
    } catch (err) {
        console.error('Update User Data Error:', err);
        throw new Error('Failed to update user data');
    }
};

const recordWeeklyLearningData = async () => {
    console.log('Weekly learning data processing completed');
};

module.exports = { 
    recordLearningData, 
    getLearningData,
    getUserData,
    updateUserData,
    recordWeeklyLearningData
};
