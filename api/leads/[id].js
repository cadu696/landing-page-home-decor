const { readDb, writeDb } = require('../_db');
const { verifyAuth } = require('../_auth');

module.exports = function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado' });

  const { id } = req.query;

  try {
    const data = readDb();
    data.leads = (data.leads || []).filter(l => l.id !== id);
    writeDb(data);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
