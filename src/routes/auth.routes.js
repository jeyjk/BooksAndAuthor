const router = require('express').Router();
const { register, login } = require('../controllers/auth.controller');
const { rateLimit } = require('express-rate-limit');

const authAttemptLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Too many authentication attempts. Try again later.' } });
router.post('/register', authAttemptLimiter, register);
router.post('/login', authAttemptLimiter, login);
module.exports = router;
