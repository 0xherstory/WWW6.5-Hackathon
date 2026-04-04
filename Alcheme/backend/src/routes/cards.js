import { Router } from 'express';
import { db } from '../utils/supabase.js';
import { refineOres, generateCardImage } from '../services/openai.js';
import { uploadImageToIPFS } from '../utils/ipfs.js';
import { getRandomCardImage } from '../utils/localImages.js';

const USE_AI_IMAGES = process.env.USE_AI_IMAGES !== 'false';

const router = Router();

// Refine ores into a card
router.post('/refine', async (req, res) => {
  try {
    const { walletAddress, oreIds } = req.body;

    if (!walletAddress || !oreIds || oreIds.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await db.getOrCreateUser(walletAddress);

    // Get ore details
    const allOres = await db.getOresByUser(user.id);
    const selectedOres = allOres.filter(o => oreIds.includes(o.id));

    if (selectedOres.length === 0) {
      return res.status(400).json({ error: 'No valid ores found' });
    }

    // Refine ores using AI
    const refinement = await refineOres(selectedOres);

    // Choose image source based on env config
    let imageUrl;
    if (USE_AI_IMAGES) {
      const generatedImageUrl = await generateCardImage(refinement.imagePrompt);
      imageUrl = await uploadImageToIPFS(generatedImageUrl);
    } else {
      imageUrl = getRandomCardImage();
      if (!imageUrl) {
        imageUrl = 'https://placehold.co/400x600/1a1a2e/8b5cf6?text=Card';
      }
    }

    // Create card
    const card = await db.createCard(
      user.id,
      refinement.cardTitle,
      imageUrl,
      oreIds
    );

    // Consume the ores
    await db.consumeOres(oreIds);

    res.json({
      success: true,
      card,
      refinement
    });
  } catch (error) {
    console.error('Error refining ores:', error);
    res.status(500).json({ error: 'Failed to refine ores' });
  }
});

// Get user's cards
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await db.getOrCreateUser(walletAddress);
    const cards = await db.getCardsByUser(user.id);

    res.json({
      success: true,
      cards
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Update card title
router.put('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Missing title' });
    }

    const updatedCard = await db.updateCard(cardId, { title });

    if (!updatedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({
      success: true,
      card: updatedCard
    });
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

export default router;
