const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const { verifyAuth } = require('./_auth');

const UPLOAD_DIR = '/tmp/uploads';

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    let fileData = null;

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        fileData = {
          buffer: Buffer.concat(chunks),
          filename: filename || 'upload',
          mimeType
        };
      });
    });

    busboy.on('finish', () => resolve(fileData));
    busboy.on('error', reject);

    // Vercel may have already parsed the body as a Buffer
    if (req.body && Buffer.isBuffer(req.body)) {
      busboy.end(req.body);
    } else if (req.body && typeof req.body === 'string') {
      busboy.end(Buffer.from(req.body));
    } else {
      req.pipe(busboy);
    }
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const file = await parseMultipart(req);
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

// Tell Vercel not to parse the body (we need the raw stream for busboy)
module.exports.config = {
  api: { bodyParser: false }
};
