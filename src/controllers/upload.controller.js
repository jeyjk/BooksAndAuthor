const multer = require('multer');
const sharp = require('sharp');
const path = require('node:path');
const { processAndStoreImage } = require('../services/image.service');

const maxBytes = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (req, file, cb) => {
    // MIME type is only a preliminary check; Sharp validates the actual image content below.
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff'].includes(file.mimetype)) {
      return cb(new Error('Only image files (JPEG, PNG, WebP, GIF, AVIF, TIFF) are allowed'));
    }
    cb(null, true);
  }
});

async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file is required in form field "image"' });
    // Verify that the content is a decodable image, not just a renamed file.
    await sharp(req.file.buffer, { limitInputPixels: 25_000_000 }).metadata();
    const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
    const image = await processAndStoreImage(req.file.buffer, uploadDir);
    res.status(201).json({ message: 'Image uploaded and processed', image, uploadedBy: req.user.id });
  } catch (error) {
    if (error.message?.includes('unsupported image format') || error.message?.includes('Input buffer contains unsupported image format') || error.message?.includes('image file')) {
      return res.status(400).json({ message: 'Uploaded file is not a valid supported image' });
    }
    next(error);
  }
}

module.exports = { upload, uploadImage };
