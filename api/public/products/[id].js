const { readDb } = require('../../_db');

module.exports = function handler(req, res) {
  try {
    const { id } = req.query;
    const data = readDb();
    const prod = (data.products || []).find(p => p.id === id);
    if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(prod);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
