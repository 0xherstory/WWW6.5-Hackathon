import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Using mock mode.');
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Mock data storage for development
const mockStorage = {
  users: new Map(),
  ores: new Map(),
  cards: new Map(),
  medals: new Map()
};

export const db = {
  // User operations
  async getOrCreateUser(walletAddress) {
    if (supabase) {
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (existing) return existing;
      
      const { data: newUser } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress })
        .select()
        .single();
      
      return newUser;
    }
    
    // Mock mode
    if (!mockStorage.users.has(walletAddress)) {
      mockStorage.users.set(walletAddress, {
        id: `user_${Date.now()}`,
        wallet_address: walletAddress,
        created_at: new Date().toISOString()
      });
    }
    return mockStorage.users.get(walletAddress);
  },

  // Ore operations
  async createOre(userId, rawData, refinedData) {
    const oreId = `ore_${Date.now()}`;
    const ore = {
      id: oreId,
      user_id: userId,
      raw_input: rawData,
      refined_data: refinedData,
      status: 'active',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data } = await supabase.from('ores').insert(ore).select().single();
      return data;
    }

    mockStorage.ores.set(oreId, ore);
    return ore;
  },

  async getOresByUser(userId) {
    if (supabase) {
      const { data } = await supabase
        .from('ores')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      return data || [];
    }

    return Array.from(mockStorage.ores.values())
      .filter(o => o.user_id === userId && o.status === 'active');
  },

  async consumeOres(oreIds) {
    if (supabase) {
      await supabase
        .from('ores')
        .update({ status: 'consumed' })
        .in('id', oreIds);
      return;
    }

    oreIds.forEach(id => {
      const ore = mockStorage.ores.get(id);
      if (ore) ore.status = 'consumed';
    });
  },

  // Card operations
  async createCard(userId, title, imageUrl, consumedOreIds) {
    const cardId = `card_${Date.now()}`;
    const card = {
      id: cardId,
      user_id: userId,
      title,
      image_url: imageUrl,
      consumed_ore_ids: consumedOreIds,
      status: 'active',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data } = await supabase.from('cards').insert(card).select().single();
      return data;
    }

    mockStorage.cards.set(cardId, card);
    return card;
  },

  async getCardsByUser(userId) {
    if (supabase) {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      return data || [];
    }

    return Array.from(mockStorage.cards.values())
      .filter(c => c.user_id === userId && c.status === 'active');
  },

  async consumeCards(cardIds) {
    if (supabase) {
      await supabase
        .from('cards')
        .update({ status: 'consumed' })
        .in('id', cardIds);
      return;
    }

    cardIds.forEach(id => {
      const card = mockStorage.cards.get(id);
      if (card) card.status = 'consumed';
    });
  },

  async updateCard(cardId, updates) {
    if (supabase) {
      const { data } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single();
      return data;
    }

    const card = mockStorage.cards.get(cardId);
    if (card) {
      Object.assign(card, updates);
      return card;
    }
    return null;
  },

  // Medal operations
  async createMedal(userId, title, description, imageUrl, tokenId, parentIds) {
    const medalId = `medal_${Date.now()}`;
    const medal = {
      id: medalId,
      user_id: userId,
      title,
      description,
      image_url: imageUrl,
      token_id: tokenId,
      parent_ids: parentIds,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data } = await supabase.from('medals').insert(medal).select().single();
      return data;
    }

    mockStorage.medals.set(medalId, medal);
    return medal;
  },

  async getMedalsByUser(userId) {
    if (supabase) {
      const { data } = await supabase
        .from('medals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return data || [];
    }

    return Array.from(mockStorage.medals.values())
      .filter(m => m.user_id === userId);
  },

  async updateMedal(medalId, updates) {
    if (supabase) {
      const { data } = await supabase
        .from('medals')
        .update(updates)
        .eq('id', medalId)
        .select()
        .single();
      return data;
    }

    const medal = mockStorage.medals.get(medalId);
    if (medal) {
      Object.assign(medal, updates);
      return medal;
    }
    return null;
  }
};
