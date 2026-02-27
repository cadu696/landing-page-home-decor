const fs = require('fs');
const path = require('path');
const { verifyAuth } = require('./_auth');

const UPLOAD_DIR = '/tmp/uploads';

function parseMultipart(req) {
  const contentType = req.headers['content-type'] || '';
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/);
  if (!match) return null;
  const boundary = match[1] || match[2];

  // Get body as Buffer
  let body;
  if (Buffer.isBuffer(req.body)) {
    body = req.body;
  } else if (typeof req.body === 'string') {
    body = Buffer.from(req.body, 'binary');
  } else {
    return null;
  }

  const boundaryBuf = Buffer.from('--' + boundary);
  const parts = [];
  let start = 0;

  while (true) {
    const idx = body.indexOf(boundaryBuf, start);
    if (idx === -1) break;
    if (start > 0) {
      // Extract the part between previous boundary end and this boundary
      const partData = body.slice(start, idx - 2); // -2 for \r\n before boundary
      parts.push(partData);
    }
    start = idx + boundaryBuf.length + 2; // +2 for \r\n after boundary
    // Check for end marker --
    if (body[idx + boundaryBuf.length] === 0x2d && body[idx + boundaryBuf.length + 1] === 0x2d) break;
  }

  for (const part of parts) {
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const headers = part.slice(0, headerEnd).toString('utf8');
    const fileContent = part.slice(headerEnd + 4);

    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);

    if (filenameMatch && fileContent.length > 0) {
      return {
        fieldname: nameMatch ? nameMatch[1] : 'file',
        filename: filenameMatch[1],
        buffer: fileContent
      };
    }
  }
  return null;
}

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const file = parseMultipart(req);
    if (!file) return res.status(400).json({ error: 'Nenhum arquivo' });

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const safeName = Date.now() + '-' + (file.filename || 'img');
    const filePath = path.join(UPLOAD_DIR, safeName);
    fs.writeFileSync(filePath, file.buffer);

    const url = '/api/tmp-file?name=' + encodeURIComponent(safeName);
    res.json({ url, filename: safeName });
  } catch (e) {
    res.status(500).json({ error: 'Erro no upload: ' + e.message });
  }
};

module.exports.config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
};
