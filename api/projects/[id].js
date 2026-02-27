const { readDb, writeDb } = require('../_db');
const { verifyAuth } = require('../_auth');

module.exports = function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Public: get single project (no auth required)
    try {
      const data = readDb();
      const proj = (data.projects || []).find(p => p.id === id);
      if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
      res.json(proj);
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else if (req.method === 'PUT') {
    const user = verifyAuth(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });
    try {
      const data = readDb();
      data.projects = data.projects || [];
      const idx = data.projects.findIndex(p => p.id === id);
      if (idx < 0) return res.status(404).json({ error: 'Projeto não encontrado' });
      data.projects[idx] = { ...data.projects[idx], ...req.body };
      writeDb(data);
      res.json(data.projects[idx]);
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else if (req.method === 'DELETE') {
    const user = verifyAuth(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });
    try {
      const data = readDb();
      data.projects = (data.projects || []).filter(p => p.id !== id);
      writeDb(data);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
