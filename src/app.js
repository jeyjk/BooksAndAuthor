const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('node:path');
const authRoutes = require('./routes/auth.routes');
const authorRoutes = require('./routes/author.routes');
const bookRoutes = require('./routes/book.routes');
const uploadRoutes = require('./routes/upload.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/upload', uploadRoutes);
// Uploaded processed files are public in this starter. For private images, use authenticated download routes instead.
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads'), { dotfiles: 'deny', index: false, maxAge: '1h' }));
app.use(notFound);
app.use(errorHandler);
module.exports = app;
