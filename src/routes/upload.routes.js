const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { userRateLimiter } = require('../middleware/rateLimiter');
const { upload, uploadImage } = require('../controllers/upload.controller');
const limiter = userRateLimiter({ windowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60), maxRequests: Number(process.env.RATE_LIMIT_MAX || 10) });
router.post('/', authenticateToken, limiter, upload.single('image'), uploadImage);
module.exports = router;
