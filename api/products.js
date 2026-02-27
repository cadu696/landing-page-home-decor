const { readDb, writeDb } = require('./_db');
const { verifyAuth } = require('./_auth');

module.exports = function handler(req, res) {
  const user = verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });

  if (req.method === 'GET') {
    try {
      const data = readDb();
      res.json(data.products || []);
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else if (req.method === 'POST') {
    try {
      const data = readDb();
      data.products = data.products || [];
      const { title, desc, image, collections } = req.body || {};
      const id = (title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'produto-' + Date.now();
      const product = { id, title: title || 'Novo Produto', desc: desc || '', image: image || '', collections: collections || [] };
      data.products.push(product);
      writeDb(data);
      res.status(201).json(product);
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
