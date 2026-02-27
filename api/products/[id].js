const { readDb, writeDb } = require('../_db');
const { verifyAuth } = require('../_auth');

module.exports = function handler(req, res) {
  const user = verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const data = readDb();
      data.products = data.products || [];
      const idx = data.products.findIndex(p => p.id === id);
      if (idx < 0) return res.status(404).json({ error: 'Produto não encontrado' });
      data.products[idx] = { ...data.products[idx], ...req.body };
      writeDb(data);
      res.json(data.products[idx]);
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const data = readDb();
      data.products = (data.products || []).filter(p => p.id !== id);
      writeDb(data);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
