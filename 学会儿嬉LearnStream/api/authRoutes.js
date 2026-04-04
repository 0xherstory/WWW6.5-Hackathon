const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../services/authService');

router.post('/register', async (req, res) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await loginUser(req.body);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(401).json({ success: false, error: err.message });
    }
});

module.exports = router;
