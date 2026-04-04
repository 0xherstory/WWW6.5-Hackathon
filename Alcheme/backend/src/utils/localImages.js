import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_DIR = path.join(__dirname, '../../public/images/cards');
const MEDALS_DIR = path.join(__dirname, '../../public/images/medals');

const CARDS_PREFIX = '/images/cards/';
const MEDALS_PREFIX = '/images/medals/';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

export function getRandomCardImage() {
  try {
    const files = fs.readdirSync(CARDS_DIR).filter(f =>
      IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())
    );
    if (files.length === 0) return null;
    const file = files[Math.floor(Math.random() * files.length)];
    return CARDS_PREFIX + file;
  } catch {
    return null;
  }
}

export function getRandomMedalImage() {
  try {
    const files = fs.readdirSync(MEDALS_DIR).filter(f =>
      IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())
    );
    if (files.length === 0) return null;
    const file = files[Math.floor(Math.random() * files.length)];
    return MEDALS_PREFIX + file;
  } catch {
    return null;
  }
}
