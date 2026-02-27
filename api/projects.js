const { readDb, writeDb } = require('./_db');
const { verifyAuth } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    // Public + Admin: list projects (no auth required)
    try {
      const data = readDb();
      res.json(data.projects || []);
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else if (req.method === 'POST') {
    // Admin only: create project
    const user = verifyAuth(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });
    try {
      const data = readDb();
      data.projects = data.projects || [];
      const { title, image, media } = req.body || {};
      const id = (title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'projeto-' + Date.now();
      const project = { id, title: title || 'Novo Projeto', image: image || '', media: media || [] };
      data.projects.push(project);
      writeDb(data);
      res.status(201).json(project);
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
