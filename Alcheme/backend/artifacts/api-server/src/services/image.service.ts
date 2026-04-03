import sharp from "sharp";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";

// ─── Sharp SVG 勋章图片生成（用于 IPFS 封面合成）──────────────────────────────

export interface BadgeImageOptions {
  name: string;
  tokenId: string;
  description?: string;
  rarity?: string;
  illustrationBuffer?: Buffer; // DALL-E 生成的插画叠加到勋章背景
}

const RARITY_COLORS: Record<string, string> = {
  legendary: "#FFD700",
  epic: "#9B59B6",
  rare: "#3498DB",
  common: "#2ECC71",
};

/**
 * 生成 SBT 勋章图片
 * 若传入 illustrationBuffer，则将 DALL-E 插画作为背景底图合成
 */
export async function generateBadgeImage(options: BadgeImageOptions): Promise<Buffer> {
  const { name, tokenId, description = "", rarity = "common", illustrationBuffer } = options;
  const color = RARITY_COLORS[rarity] ?? RARITY_COLORS.common;

  const size = 1024;

  // 覆盖层 SVG（文字 + 边框）
  const overlaySvg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- 暗色渐变蒙层 -->
      <rect width="${size}" height="${size}" fill="rgba(10,10,30,0.55)" rx="40"/>
      <!-- 发光边框 -->
      <rect x="16" y="16" width="${size - 32}" height="${size - 32}"
        fill="none" stroke="${color}" stroke-width="4" rx="32" opacity="0.85"/>
      <!-- 稀有度标签 -->
      <rect x="${size / 2 - 80}" y="${size - 180}" width="160" height="36" rx="18" fill="${color}" opacity="0.92"/>
      <text x="${size / 2}" y="${size - 156}" font-family="sans-serif" font-size="18" fill="#000"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold">${rarity.toUpperCase()}</text>
      <!-- 勋章名 -->
      <text x="${size / 2}" y="${size - 108}" font-family="sans-serif" font-size="32" fill="#ffffff"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold">${escapeXml(name)}</text>
      <!-- 描述 -->
      <text x="${size / 2}" y="${size - 64}" font-family="sans-serif" font-size="18" fill="#cccccc"
        text-anchor="middle" dominant-baseline="middle">${escapeXml(description.slice(0, 36))}</text>
      <!-- Token ID -->
      <text x="${size / 2}" y="${size - 28}" font-family="monospace" font-size="13" fill="#888888"
        text-anchor="middle" dominant-baseline="middle">${escapeXml(tokenId)}</text>
    </svg>
  `;

  if (illustrationBuffer) {
    // 将 DALL-E 插画作为底图，叠加文字覆盖层
    const base = sharp(illustrationBuffer).resize(size, size);
    const overlay = Buffer.from(overlaySvg);
    return base.composite([{ input: overlay }]).png().toBuffer();
  }

  // 无插画时使用纯色背景 + 覆盖层
  const bgSvg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f0f23"/>
          <stop offset="100%" style="stop-color:#1a1a3e"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)" rx="40"/>
      <circle cx="${size / 2}" cy="${size / 2 - 80}" r="200" fill="${color}" opacity="0.08"/>
    </svg>
  `;

  return sharp(Buffer.from(bgSvg))
    .composite([{ input: Buffer.from(overlaySvg) }])
    .png()
    .toBuffer();
}

// ─── 卡片专属 DALL-E 生图（竖版，魔法水彩美学）─────────────────────────────

export interface CardIllustrationOptions {
  /** GPT 生成的个性化插图场景描述（英文） */
  illustrationDescription: string;
}

/**
 * 卡片专属提示词 — Visual Style Protocol (Arcane Collectible Card Style)
 * 协议基底固定，[New Assignment] 由 GPT 个性化生成
 */
function buildCardIllustrationPrompt(illustrationDescription: string): string {
  const protocol = [
    `[Visual Style Protocol: Arcane Collectible Card/Medallion Style]`,
    `Core Concept: Detailed, illustrative, fantasy game asset.`,
    `An ornate, 3D-sculpted frame enclosing a themed illustration, presented on a stone surface.`,
    `Each card must be an isolated, high-definition asset.`,
    `Frame Material: Heavily detailed materials with HIGH color saturation and vivid brightness: rich jewel-toned bronze (warm amber-gold), vibrant verdigris copper (bright teal-green), luminous polished marble with saturated color veins (cobalt blue, emerald, crimson, violet), glowing gilded wood. The frame must appear richly colored, vibrant, and visually striking — NOT dull, grey, or desaturated. Enhance highlights on raised filigree with brilliant specular shine.`,
    `The frame shape must be specific (arch-top rectangular) and feature relevant inset symbols (e.g., Tree of Life, gears, constellations, atoms, daggers, a key) and detailed filigree/mechanisms.`,
    `Central Illustration Style: Watercolor and colored pencil, hand-painted feel. Magical aesthetic with a soft, dreamy pastel palette — lavender mist, rose gold shimmer, mint-teal haze, peach-amber warmth, celestial periwinkle — layered over a parchment texture.`,
    `Clear linework, not 3D-rendered. Enchanted atmosphere: drifting arcane mist, floating luminous spell particles, ethereal fairy-dust micro-sparkles, and soft prismatic lens flares emanating from magical focal points.`,
    `Light and Atmosphere: The illustration must radiate its own mystical inner light — soft golden bokeh halos, starlight-connect-dot constellations, gentle arcane glows in purple and teal, and a faint moonlight wash over the entire scene.`,
    `The frame must be realistically lit by soft, cool-warm ambient light that emphasizes its aged material depth and casts gentle magical reflections inward.`,
    `Composition: Single vertical-oriented card. The frame occupies the outer edges, leaving the center for the illustration. Icons and filigree must be integrated seamlessly with a gentle glowing outline.`,
    `CRITICAL: The illustration must be strictly contained within the inner boundary of the frame. Nothing in the illustration — figures, mist, light, particles — may extend beyond or overlap the frame border. The frame acts as a hard clipping boundary.`,
    `If any human figure appears, it must be a young woman with elegant, graceful features, surrounded by soft magical aura and spell-light.`,
    `Presentation: Isolated artifact, no UI elements. Set against a clean, checkered transparent background pattern (for easy post-production cutout).`,
    `Execution: High-quality fantasy asset, focus on material contrast (sculpted stone/metal vs. soft magical watercolor). Evoke a sense of wonder, enchantment, and arcane beauty.`,
    `Maintain the exact thickness and style of the frames and the overall artifact presentation consistently.`,
    `No text, no letters, no numbers in the image.`,
  ].join(" ");

  return `${protocol} [New Assignment]: ${illustrationDescription}`;
}

/**
 * 为卡片生成专属插画，使用竖版比例（1024x1536）适配手机屏幕 80% 宽
 */
export async function generateCardIllustration(
  options: CardIllustrationOptions,
): Promise<Buffer> {
  const prompt = buildCardIllustrationPrompt(options.illustrationDescription);
  const buffer = await generateImageBuffer(prompt, "1024x1536");
  return buffer;
}

// ─── 勋章专属 DALL-E 生图（竖版，进阶感，魔法水彩美学）──────────────────────

export interface BadgeIllustrationOptions {
  /** GPT 生成的进化场景描述（英文） */
  illustrationDescription: string;
}

/**
 * 勋章专属提示词 — Visual Style Protocol (Arcane Medallion Style)
 * 圆形勋章版本，强调进阶/升华感，协议基底固定，[New Assignment] 由 GPT 生成
 */
function buildBadgeIllustrationPrompt(illustrationDescription: string): string {
  const protocol = [
    `[Visual Style Protocol: Arcane Collectible Medallion Style]`,
    `Core Concept: A detailed fantasy game medallion asset.`,
    `An ornate, 3D-sculpted circular frame enclosing a themed illustration, presented as an isolated high-definition artifact.`,
    `Frame Material: Heavily detailed materials with HIGH color saturation and vivid brightness: brilliant sunstone marble glowing in warm amber-gold, richly saturated jewel-toned bronze (deep copper-orange, vivid emerald verdigris, royal violet), luminous polished metal with saturated color veins and gem-like inlays. The frame must appear richly colored, vibrant, and visually striking — NOT dull, grey, or desaturated. Enhance raised relief patterns with brilliant specular highlights.`,
    `The circular frame features inset symbols of achievement, evolution, and ascension (lion, star, wing, flame, spiral, constellation) as well as intricate filigree integrated with the medallion's theme.`,
    `Central Illustration Style: Watercolor and colored pencil, hand-painted feel. Magical aesthetic with a soft, dreamy pastel palette — lavender mist, rose gold shimmer, mint-teal haze, peach-amber warmth, celestial periwinkle — layered over a parchment texture.`,
    `Clear linework, not 3D-rendered. Enchanted atmosphere: drifting arcane mist, floating luminous spell particles, ethereal fairy-dust micro-sparkles, and soft prismatic lens flares emanating from magical focal points.`,
    `Light and Atmosphere: The illustration emits radiant ascending mystical light — soft golden bokeh halos, starlight-connect-dot constellations, gentle arcane glows in purple and teal, upward beams of pearlescent moonlight conveying evolution and breakthrough.`,
    `The frame is realistically lit by cool-warm ambient light creating 3D depth, highlight ridges, rich shadows, and subtle magical reflections inward.`,
    `Composition: Single circular medallion. The ornate frame ring occupies the outer area; the illustration fills the center circle.`,
    `CRITICAL: The illustration must be strictly contained within the inner circular boundary of the frame. Nothing in the illustration — figures, mist, light, particles — may extend beyond or overlap the frame border. The circular frame acts as a hard clipping boundary.`,
    `If any human figure appears, it must be a young woman with elegant, graceful features, surrounded by soft magical aura and ascending spell-light.`,
    `Presentation: Isolated artifact, no UI elements. Set against a clean, checkered transparent background pattern (for easy post-production cutout).`,
    `Execution: High-quality fantasy asset. Focus on material contrast — sculpted metal frame vs. luminous magical watercolor interior. Evoke wonder, enchantment, and arcane beauty.`,
    `Epic sense of progression and power unlocked.`,
    `Maintain the exact thickness and style of the frames and the overall artifact presentation consistently.`,
    `No text, no letters, no numbers in the image.`,
  ].join(" ");

  return `${protocol} [New Assignment]: ${illustrationDescription}`;
}

/**
 * 为勋章生成进化插画，竖版 1024×1536 适配手机屏幕 80% 宽
 */
export async function generateBadgeIllustration(
  options: BadgeIllustrationOptions,
): Promise<Buffer> {
  const prompt = buildBadgeIllustrationPrompt(options.illustrationDescription);
  const buffer = await generateImageBuffer(prompt, "1024x1536");
  return buffer;
}

// ─── Sharp SVG 卡片合成（竖版，金色边框 + 黑曜石底色）────────────────────────

export interface CardImageOptions {
  name: string;
  cardId: number;
  rarity?: string;
  oreCount?: number;
  illustrationBuffer?: Buffer;
}

/**
 * 合成卡片最终图（竖版 1024×1792，适配手机屏幕 80% 宽）
 * 黑曜石底色 + 金色金属浮雕边框 + 卡片信息覆盖层
 */
export async function generateCardImage(options: CardImageOptions): Promise<Buffer> {
  const { name, cardId, rarity = "common", oreCount = 1, illustrationBuffer } = options;

  // 卡片统一使用金色边框（与黑曜石底色搭配）
  const gold = "#C9A84C";
  const goldLight = "#F0D080";

  const w = 1024;
  const h = 1536;
  const br = 56; // border radius

  const overlaySvg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 黑曜石蒙层渐变 -->
        <linearGradient id="obsidian" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(8,6,14,0.30)"/>
          <stop offset="60%" style="stop-color:rgba(8,6,14,0.05)"/>
          <stop offset="100%" style="stop-color:rgba(8,6,14,0.75)"/>
        </linearGradient>
        <!-- 金色边框渐变（模拟浮雕高光） -->
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${goldLight}"/>
          <stop offset="40%" style="stop-color:${gold}"/>
          <stop offset="100%" style="stop-color:#8B6914"/>
        </linearGradient>
      </defs>

      <!-- 全图蒙层 -->
      <rect width="${w}" height="${h}" fill="url(#obsidian)" rx="${br}"/>

      <!-- 外层金色浮雕主边框 -->
      <rect x="12" y="12" width="${w - 24}" height="${h - 24}"
        fill="none" stroke="url(#goldBorder)" stroke-width="6" rx="${br - 4}" opacity="0.95"/>
      <!-- 内层细边框（双线浮雕感） -->
      <rect x="22" y="22" width="${w - 44}" height="${h - 44}"
        fill="none" stroke="${gold}" stroke-width="1.5" rx="${br - 12}" opacity="0.55"/>

      <!-- 顶部装饰线 -->
      <line x1="80" y1="90" x2="${w - 80}" y2="90" stroke="${gold}" stroke-width="1" opacity="0.4"/>

      <!-- 左上：稀有度胶囊 -->
      <rect x="40" y="48" width="140" height="34" rx="17" fill="${gold}" opacity="0.88"/>
      <text x="110" y="65" font-family="serif" font-size="15" fill="#1a0e00"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold" letter-spacing="2">${rarity.toUpperCase()}</text>

      <!-- 右上：矿石数量 -->
      <text x="${w - 44}" y="65" font-family="monospace" font-size="15" fill="${goldLight}"
        text-anchor="end" dominant-baseline="middle" opacity="0.85">⬡ ${oreCount}</text>

      <!-- 底部信息区背景 -->
      <rect x="0" y="${h - 220}" width="${w}" height="220" fill="rgba(8,6,14,0.78)" rx="${br}"/>
      <line x1="60" y1="${h - 218}" x2="${w - 60}" y2="${h - 218}" stroke="${gold}" stroke-width="1" opacity="0.35"/>

      <!-- 卡片名 -->
      <text x="${w / 2}" y="${h - 148}" font-family="serif" font-size="42" fill="#ffffff"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold">${escapeXml(name)}</text>

      <!-- 分割线 -->
      <line x1="${w / 2 - 120}" y1="${h - 108}" x2="${w / 2 + 120}" y2="${h - 108}"
        stroke="${gold}" stroke-width="1" opacity="0.4"/>

      <!-- Card ID -->
      <text x="${w / 2}" y="${h - 68}" font-family="monospace" font-size="18" fill="${gold}"
        text-anchor="middle" dominant-baseline="middle" opacity="0.75">CARD  #${String(cardId).padStart(4, "0")}</text>

      <!-- 底部装饰点 -->
      <circle cx="${w / 2}" cy="${h - 36}" r="4" fill="${gold}" opacity="0.5"/>
      <circle cx="${w / 2 - 20}" cy="${h - 36}" r="2.5" fill="${gold}" opacity="0.3"/>
      <circle cx="${w / 2 + 20}" cy="${h - 36}" r="2.5" fill="${gold}" opacity="0.3"/>
    </svg>
  `;

  if (illustrationBuffer) {
    const base = sharp(illustrationBuffer).resize(w, h, { fit: "cover", position: "centre" });
    return base.composite([{ input: Buffer.from(overlaySvg) }]).png().toBuffer();
  }

  // 无插画时：纯黑曜石底色
  const bgSvg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="obsi" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:#1a1228"/>
          <stop offset="100%" style="stop-color:#06040d"/>
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#obsi)" rx="${br}"/>
    </svg>
  `;

  return sharp(Buffer.from(bgSvg))
    .composite([{ input: Buffer.from(overlaySvg) }])
    .png()
    .toBuffer();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
