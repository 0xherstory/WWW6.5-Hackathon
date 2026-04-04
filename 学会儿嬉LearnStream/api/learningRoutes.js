const express = require('express');
const router = express.Router();
const { recordLearningData, getLearningData } = require('../services/learningService');

router.post('/:userId/record', async (req, res) => {
    try {
        const result = await recordLearningData(req.params.userId, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.get('/:userId/data', async (req, res) => {
    try {
        const learningData = await getLearningData(req.params.userId);
        res.status(200).json({ success: true, data: learningData });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});

module.exports = router;
