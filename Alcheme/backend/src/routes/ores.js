import { Router } from 'express';
import { db } from '../utils/supabase.js';
import { extractOres } from '../services/openai.js';

const router = Router();

// Analyze user input and extract ores
router.post('/analyze', async (req, res) => {
  try {
    const { walletAddress, input } = req.body;

    if (!walletAddress || !input) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create user
    const user = await db.getOrCreateUser(walletAddress);

    // Extract ores using AI
    const result = await extractOres(input);

    res.json({
      success: true,
      ores: result.ores,
      userId: user.id
    });
  } catch (error) {
    console.error('Error analyzing input:', error);
    res.status(500).json({ error: 'Failed to analyze input' });
  }
});

// Save confirmed ores
router.post('/save', async (req, res) => {
  try {
    const { walletAddress, ores, rawInput } = req.body;

    if (!walletAddress || !ores || !rawInput) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await db.getOrCreateUser(walletAddress);

    // Save each ore
    const savedOres = [];
    for (const ore of ores) {
      const savedOre = await db.createOre(user.id, rawInput, ore);
      savedOres.push(savedOre);
    }

    res.json({
      success: true,
      ores: savedOres
    });
  } catch (error) {
    console.error('Error saving ores:', error);
    res.status(500).json({ error: 'Failed to save ores' });
  }
});

// Get user's ores
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await db.getOrCreateUser(walletAddress);
    const ores = await db.getOresByUser(user.id);

    res.json({
      success: true,
      ores
    });
  } catch (error) {
    console.error('Error fetching ores:', error);
    res.status(500).json({ error: 'Failed to fetch ores' });
  }
});

export default router;
