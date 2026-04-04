import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const apiBaseUrl = process.env.OPENAI_API_BASE_URL;
const chatModel = process.env.CHAT_MODEL || 'gpt-4o-mini';
const imageModel = process.env.IMAGE_MODEL || 'dall-e-3';
const aiTimeout = parseInt(process.env.AI_TIMEOUT) || 120000;

let openai = null;
if (apiKey) {
  const config = { apiKey, timeout: aiTimeout };
  if (apiBaseUrl) {
    config.baseURL = apiBaseUrl;
  }
  openai = new OpenAI(config);
} else {
  console.warn('OpenAI API key not configured. Using mock responses.');
}

// Mining: Extract ores from user input
export async function extractOres(userInput) {
  if (!openai) {
    // Mock response for development
    const mockOres = [
      {
        id: 1,
        text: userInput.slice(0, 50) + '...',
        dimension: 'Wisdom',
        score: Math.floor(Math.random() * 3) + 3
      }
    ];
    return { ores: mockOres };
  }

  const completion = await openai.chat.completions.create({
    model: chatModel,
    messages: [
      {
        role: 'system',
        content: `你是一位灵魂炼金术士，负责从用户的日常记录中提炼"灵光矿石"。

请从用户的输入中提取核心成就，并按照以下JSON格式输出：
{
  "ores": [
    {
      "id": 1,
      "text": "提炼后的成就描述（精炼、有仪式感）",
      "dimension": "Wisdom|Will|Creation|Connection",
      "score": 1-5
    }
  ]
}

维度说明：
- Wisdom（智慧）：学习、思考、研究类成就
- Will（意志）：健身、习惯、坚持类成就
- Creation（创造）：创作、设计、编码类成就
- Connection（连接）：社交、合作、沟通类成就

请确保：
1. 提取2-5个核心成就
2. 描述要有仪式感，避免平铺直叙
3. 根据内容深度给出1-5的评分`
      },
      {
        role: 'user',
        content: userInput
      }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0].message.content);
}

// Refining: Generate card title and image prompt from ores
export async function refineOres(ores) {
  const oreDescriptions = ores.map(o => o.text || o.refined_data?.text).join('；');

  if (!openai) {
    // Mock response
    return {
      cardTitle: '里程碑达成',
      imagePrompt: 'A magical crystal card with glowing runes',
      description: `凝聚了${ores.length}块矿石的力量`
    };
  }

  const completion = await openai.chat.completions.create({
    model: chatModel,
    messages: [
      {
        role: 'system',
        content: `你是一位灵魂炼金术士，负责将多块"灵光矿石"精炼成一张"里程碑卡片"。

请根据提供的矿石内容，生成：
1. 一个有仪式感的里程碑标题（10字以内）
2. 一段DALL-E生图prompt（英文，描述一张魔法卡片的插画）
3. 一段简短的成就描述（30字以内）

输出JSON格式：
{
  "cardTitle": "里程碑标题",
  "imagePrompt": "DALL-E prompt for the card illustration",
  "description": "简短成就描述"
}`
      },
      {
        role: 'user',
        content: `请精炼以下矿石：${oreDescriptions}`
      }
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0].message.content);
}

// Generate card image using DALL-E
export async function generateCardImage(imagePrompt) {
  if (!openai) {
    // Return placeholder image URL
    return 'https://placehold.co/400x600/1a1a2e/8b5cf6?text=Card';
  }

  const response = await openai.images.generate({
    model: imageModel,
    prompt: `Fantasy alchemy card art style: ${imagePrompt}. Magical, mystical, gem-like quality.`,
    n: 1,
    size: '1024x1024'
  });

  return response.data[0].url;
}

// Awakening: Generate medal title, description and image from cards
export async function awakenMedal(cards, existingMedal = null) {
  const cardDescriptions = cards.map(c => c.title).join('、');
  const context = existingMedal
    ? `已有勋章"${existingMedal.title}"，现在注入新的里程碑：${cardDescriptions}`
    : `首次铸造，里程碑包括：${cardDescriptions}`;

  if (!openai) {
    // Mock response
    return {
      medalTitle: existingMedal ? '进化之证' : '觉醒之证',
      medalDescription: `凝聚了${cards.length}个里程碑的力量`,
      imagePrompt: 'A sacred glowing medal with geometric patterns'
    };
  }

  const completion = await openai.chat.completions.create({
    model: chatModel,
    messages: [
      {
        role: 'system',
        content: `你是一位灵魂炼金术士，负责将多张"里程碑卡片"铸造成"灵魂勋章"（SBT）。

请根据提供的内容，生成：
1. 一个神圣的勋章称号（8字以内）
2. 一段史诗般的成就描述（50字以内）
3. 一段DALL-E生图prompt（英文，描述一枚发光的几何勋章）

输出JSON格式：
{
  "medalTitle": "勋章称号",
  "medalDescription": "史诗成就描述",
  "imagePrompt": "DALL-E prompt for the medal illustration"
}`
      },
      {
        role: 'user',
        content: context
      }
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0].message.content);
}

// Generate medal image using DALL-E
export async function generateMedalImage(imagePrompt) {
  if (!openai) {
    return 'https://placehold.co/400x400/1a1a2e/gold?text=Medal';
  }

  const response = await openai.images.generate({
    model: imageModel,
    prompt: `Sacred geometric medal art style: ${imagePrompt}. Glowing, ethereal, SBT token aesthetic.`,
    n: 1,
    size: '1024x1024'
  });

  return response.data[0].url;
}
