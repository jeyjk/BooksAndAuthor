require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');
const { connectRedis, redis } = require('./config/redis');

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
  }
  await prisma.$connect();
  await connectRedis();
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

  async function shutdown(signal) {
    console.log(`${signal} received; shutting down...`);
    server.close(async () => {
      try { await prisma.$disconnect(); if (redis.isOpen) await redis.quit(); }
      finally { process.exit(0); }
    });
  }
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch(async (error) => {
  console.error('Failed to start application:', error);
  try { await prisma.$disconnect(); if (redis.isOpen) await redis.quit(); } catch (_) {}
  process.exit(1);
});
