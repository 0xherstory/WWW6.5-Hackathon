const express = require('express');
const router = express.Router();
const { getUserData, updateUserData } = require('../services/learningService');

router.get('/:userId', async (req, res) => {
    try {
        const userData = await getUserData(req.params.userId);
        res.status(200).json({ success: true, data: userData });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});

router.put('/:userId', async (req, res) => {
    try {
        const updatedData = await updateUserData(req.params.userId, req.body);
        res.status(200).json({ success: true, data: updatedData });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
