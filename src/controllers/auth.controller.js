const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (typeof username !== 'string' || username.trim().length < 2 || username.trim().length > 80) {
      return res.status(400).json({ message: 'username must be 2–80 characters' });
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 255) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: 'password must be 8–72 characters' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ message: 'Email is already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username: username.trim(), email: normalizedEmail, passwordHash },
      select: { id: true, username: true, email: true, role: true, createdAt: true }
    });
    return res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { role: user.role },
      process.env.JWT_SECRET,
      { subject: user.id, expiresIn: process.env.JWT_EXPIRES_IN || '1h', algorithm: 'HS256' }
    );
    return res.json({ message: 'Login successful', token, tokenType: 'Bearer', expiresIn: process.env.JWT_EXPIRES_IN || '1h', user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) { next(error); }
}

module.exports = { register, login };
