function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  if (err.code === 'P2002') return res.status(409).json({ message: 'A record with this unique value already exists' });
  if (err.code === 'P2003' || err.code === 'P2025') return res.status(400).json({ message: 'Related record not found or operation is not allowed' });
  if (err.name === 'MulterError') return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the maximum allowed size' : err.message });
  res.status(err.status || 500).json({ message: err.status && err.status < 500 ? err.message : 'Internal server error' });
}

module.exports = { notFound, errorHandler };
