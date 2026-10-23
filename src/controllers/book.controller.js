const prisma = require('../config/db');

async function listBooks(req, res, next) {
  try {
    const books = await prisma.book.findMany({ include: { author: { select: { id: true, name: true } } }, orderBy: { id: 'asc' } });
    res.json({ data: books });
  } catch (e) { next(e); }
}
async function getBook(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid book ID' });
    const book = await prisma.book.findUnique({ where: { id }, include: { author: { select: { id: true, name: true } } } });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ data: book });
  } catch (e) { next(e); }
}
async function createBook(req, res, next) {
  try {
    const { title, description, authorId, publishedAt } = req.body;
    const parsedAuthorId = Number(authorId);
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) return res.status(400).json({ message: 'title is required (max 200 characters)' });
    if (!Number.isInteger(parsedAuthorId) || parsedAuthorId < 1) return res.status(400).json({ message: 'authorId must be a positive integer' });
    if (description != null && typeof description !== 'string') return res.status(400).json({ message: 'description must be a string' });
    const data = { title: title.trim(), description: description || null, authorId: parsedAuthorId };
    if (publishedAt) { const date = new Date(publishedAt); if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'publishedAt must be a valid date' }); data.publishedAt = date; }
    const book = await prisma.book.create({ data, include: { author: { select: { id: true, name: true } } } });
    res.status(201).json({ data: book });
  } catch (e) { next(e); }
}
async function updateBook(req, res, next) {
  try {
    const id = Number(req.params.id); const { title, description, authorId, publishedAt } = req.body;
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid book ID' });
    const data = {};
    if (title !== undefined) { if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) return res.status(400).json({ message: 'title must be 1–200 characters' }); data.title = title.trim(); }
    if (description !== undefined) { if (description !== null && typeof description !== 'string') return res.status(400).json({ message: 'description must be a string or null' }); data.description = description; }
    if (authorId !== undefined) { const aid = Number(authorId); if (!Number.isInteger(aid) || aid < 1) return res.status(400).json({ message: 'authorId must be a positive integer' }); data.authorId = aid; }
    if (publishedAt !== undefined) { if (publishedAt === null || publishedAt === '') data.publishedAt = null; else { const date = new Date(publishedAt); if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'publishedAt must be a valid date' }); data.publishedAt = date; } }
    if (!Object.keys(data).length) return res.status(400).json({ message: 'Provide at least one field to update' });
    const book = await prisma.book.update({ where: { id }, data, include: { author: { select: { id: true, name: true } } } });
    res.json({ data: book });
  } catch (e) { next(e); }
}
async function deleteBook(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid book ID' });
    await prisma.book.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
}
module.exports = { listBooks, getBook, createBook, updateBook, deleteBook };
