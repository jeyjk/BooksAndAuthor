const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

async function processAndStoreImage(buffer, uploadDir) {
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${crypto.randomUUID()}.webp`;
  const absolutePath = path.resolve(uploadDir, filename);
  const result = await sharp(buffer, { limitInputPixels: 25_000_000 })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(absolutePath);
  return { filename, path: `/uploads/${filename}`, width: result.width, height: result.height, size: result.size, format: result.format };
}
module.exports = { processAndStoreImage };
