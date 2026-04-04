const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    getStoredUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setStoredUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    clearStoredUser() {
        localStorage.removeItem('user');
    },

    isLoggedIn() {
        return !!this.getStoredUser();
    },

    getCurrentUserId() {
        const user = this.getStoredUser();
        return user ? user.id : null;
    },

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
        if (response.success) {
            this.setStoredUser(response.data);
        }
        return response;
    },

    async login(loginData) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: loginData
        });
        if (response.success) {
            this.setStoredUser(response.data);
        }
        return response;
    },

    async walletLogin(walletAddress) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: { walletAddress }
        });
        if (response.success) {
            this.setStoredUser(response.data);
        }
        return response;
    },

    logout() {
        this.clearStoredUser();
        window.location.href = 'login.html';
    },

    async getUserData(userId) {
        return this.request(`/users/${userId}`);
    },

    async updateUserData(userId, updateData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: updateData
        });
    },

    async recordLearning(userId, learningData) {
        return this.request(`/learning/${userId}/record`, {
            method: 'POST',
            body: learningData
        });
    },

    async getLearningData(userId) {
        return this.request(`/learning/${userId}/data`);
    },

    async getCommunityPosts(limit = 20, offset = 0) {
        return this.request(`/community/posts?limit=${limit}&offset=${offset}`);
    },

    async createCommunityPost(userId, postData) {
        return this.request('/community/posts', {
            method: 'POST',
            body: { userId, ...postData }
        });
    },

    async likePost(postId, userId) {
        return this.request(`/community/posts/${postId}/like`, {
            method: 'POST',
            body: { userId }
        });
    },

    async addComment(postId, userId, content) {
        return this.request(`/community/posts/${postId}/comment`, {
            method: 'POST',
            body: { userId, content }
        });
    },

    async tipUser(postId, fromUserId, amount) {
        return this.request(`/community/posts/${postId}/tip`, {
            method: 'POST',
            body: { fromUserId, amount }
        });
    },

    async getLeaderboard(limit = 10) {
        return this.request(`/community/leaderboard?limit=${limit}`);
    },

    checkAuth(redirect = true) {
        if (!this.isLoggedIn()) {
            if (redirect) {
                window.location.href = 'login.html';
            }
            return false;
        }
        return true;
    },

    updateUIWithUserData(user) {
        const tokenElements = document.querySelectorAll('.token-balance');
        tokenElements.forEach(el => {
            el.textContent = `🪙 ${user.tokens || 0}`;
        });

        const avatarElements = document.querySelectorAll('.avatar');
        avatarElements.forEach(el => {
            const username = user.username || 'User';
            el.textContent = username.slice(0, 2).toUpperCase();
        });
    }
};

window.api = api;
