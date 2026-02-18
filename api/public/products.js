const { readDb } = require('../_db');

module.exports = function handler(req, res) {
  try {
    const data = readDb();
    res.json(data.products || []);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
