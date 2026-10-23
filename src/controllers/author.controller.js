const prisma = require('../config/db');

async function listAuthors(req, res, next) {
  try {
    const authors = await prisma.author.findMany({ include: { books: true }, orderBy: { id: 'asc' } });
    res.json({ data: authors });
  } catch (e) { next(e); }
}
async function getAuthor(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid author ID' });
    const author = await prisma.author.findUnique({ where: { id }, include: { books: true } });
    if (!author) return res.status(404).json({ message: 'Author not found' });
    res.json({ data: author });
  } catch (e) { next(e); }
}
async function createAuthor(req, res, next) {
  try {
    const { name, bio } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 150) return res.status(400).json({ message: 'name is required (max 150 characters)' });
    if (bio != null && typeof bio !== 'string') return res.status(400).json({ message: 'bio must be a string' });
    const author = await prisma.author.create({ data: { name: name.trim(), bio: bio || null } });
    res.status(201).json({ data: author });
  } catch (e) { next(e); }
}
async function updateAuthor(req, res, next) {
  try {
    const id = Number(req.params.id); const { name, bio } = req.body;
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid author ID' });
    const data = {};
    if (name !== undefined) { if (typeof name !== 'string' || !name.trim() || name.trim().length > 150) return res.status(400).json({ message: 'name must be 1–150 characters' }); data.name = name.trim(); }
    if (bio !== undefined) { if (bio !== null && typeof bio !== 'string') return res.status(400).json({ message: 'bio must be a string or null' }); data.bio = bio; }
    if (!Object.keys(data).length) return res.status(400).json({ message: 'Provide name or bio to update' });
    const author = await prisma.author.update({ where: { id }, data });
    res.json({ data: author });
  } catch (e) { next(e); }
}
async function deleteAuthor(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid author ID' });
    await prisma.author.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
}
module.exports = { listAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor };
