const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = '/tmp/uploads';

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.jfif': 'image/jpeg'
};

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const name = req.query.name;
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) {
    return res.status(400).json({ error: 'Nome inválido' });
  }

  const filePath = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }

  const ext = path.extname(name).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  const fileBuffer = fs.readFileSync(filePath);
  res.send(fileBuffer);
};
