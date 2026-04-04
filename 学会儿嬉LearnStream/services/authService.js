const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (userData) => {
    const { username, email, phone, password, walletAddress } = userData;
    
    const existingUser = User.findByEmailOrPhoneOrWallet(email, phone, walletAddress);
    
    if (existingUser) {
        throw new Error('User already exists');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = User.create({
        username,
        email,
        phone,
        password: hashedPassword,
        walletAddress
    });
    
    const userResponse = { ...user };
    delete userResponse.password;
    
    return userResponse;
};

const loginUser = async (loginData) => {
    const { email, phone, password, walletAddress } = loginData;
    
    let user;
    
    if (walletAddress) {
        user = User.findByWalletAddress(walletAddress);
        if (!user) {
            const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = User.create({
                username: `user_${walletAddress.slice(0, 8)}`,
                email: `${walletAddress.slice(0, 8)}@wallet.temp`,
                password: hashedPassword,
                walletAddress
            });
        }
    } else {
        user = email ? User.findByEmail(email) : User.findByPhone(phone);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
    }
    
    User.update(user.id, { lastLoginAt: new Date().toISOString() });
    
    const userResponse = { ...user };
    delete userResponse.password;
    
    return userResponse;
};

const getUserById = async (userId) => {
    const user = User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const userResponse = { ...user };
    delete userResponse.password;
    return userResponse;
};

const updateUserById = async (userId, updateData) => {
    const user = User.update(userId, updateData);
    if (!user) {
        throw new Error('User not found');
    }
    const userResponse = { ...user };
    delete userResponse.password;
    return userResponse;
};

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    updateUserById
};
