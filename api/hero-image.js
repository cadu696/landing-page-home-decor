const { readDb, writeDb } = require('./_db');
const { verifyAuth } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = readDb();
      res.json({ url: data.heroImage || '' });
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else if (req.method === 'PUT') {
    const user = verifyAuth(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });
    try {
      const data = readDb();
      data.heroImage = req.body.url || data.heroImage;
      writeDb(data);
      res.json({ url: data.heroImage });
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
