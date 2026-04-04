const express = require('express');
const router = express.Router();
const { 
    createPost, 
    getPosts, 
    likePost, 
    addComment, 
    tipUser, 
    getLeaderboard 
} = require('../services/communityService');

router.get('/posts', async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const posts = await getPosts(parseInt(limit) || 20, parseInt(offset) || 0);
        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});

router.post('/posts', async (req, res) => {
    try {
        const { userId, ...postData } = req.body;
        const post = await createPost(userId, postData);
        res.status(201).json({ success: true, data: post });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.post('/posts/:postId/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await likePost(req.params.postId, userId);
        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.post('/posts/:postId/comment', async (req, res) => {
    try {
        const { userId, content } = req.body;
        const comments = await addComment(req.params.postId, userId, content);
        res.status(200).json({ success: true, data: comments });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.post('/posts/:postId/tip', async (req, res) => {
    try {
        const { fromUserId, amount } = req.body;
        const post = await tipUser(req.params.postId, fromUserId, amount);
        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.get('/leaderboard', async (req, res) => {
    try {
        const { limit } = req.query;
        const leaderboard = await getLeaderboard(parseInt(limit) || 10);
        res.status(200).json({ success: true, data: leaderboard });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});

module.exports = router;
