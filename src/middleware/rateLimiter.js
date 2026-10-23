const { redis } = require('../config/redis');

// Fixed-window counter keyed by authenticated user ID. Requires authenticateToken first.
function userRateLimiter({ windowSeconds, maxRequests }) {
  return async (req, res, next) => {
    if (!req.user?.id) return res.status(401).json({ message: 'Authentication required' });
    try {
      const window = Math.floor(Date.now() / (windowSeconds * 1000));
      const key = `rate:${req.user.id}:${window}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSeconds + 2);
      const ttl = await redis.ttl(key);
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - count)));
      res.set('X-RateLimit-Reset-After', String(Math.max(0, ttl)));
      if (count > maxRequests) {
        return res.status(429).json({ message: 'Rate limit exceeded', limit: maxRequests, windowSeconds });
      }
      return next();
    } catch (error) {
      // Fail closed so Redis failure cannot silently bypass the configured protection.
      console.error('Rate limiter failed:', error.message);
      return res.status(503).json({ message: 'Rate limiter temporarily unavailable' });
    }
  };
}

module.exports = { userRateLimiter };
