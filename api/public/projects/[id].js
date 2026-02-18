const { readDb } = require('../../_db');

module.exports = function handler(req, res) {
  try {
    const { id } = req.query;
    const data = readDb();
    const proj = (data.projects || []).find(p => p.id === id);
    if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(proj);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
