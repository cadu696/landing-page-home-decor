const { readDb, writeDb } = require('./_db');
const { verifyAuth } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    // Authenticated - list leads
    const user = verifyAuth(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });
    try {
      const data = readDb();
      res.json((data.leads || []).slice());
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else if (req.method === 'POST') {
    // Public - create lead
    try {
      const { nome, telefone, mensagem, origem = 'site' } = req.body || {};
      if (!nome || !telefone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }
      const lead = {
        id: Date.now().toString(),
        nome: String(nome).trim(),
        telefone: String(telefone).trim(),
        mensagem: (mensagem || '').trim(),
        origem,
        data: new Date().toISOString()
      };
      const data = readDb();
      data.leads = data.leads || [];
      data.leads.unshift(lead);
      writeDb(data);
      res.status(201).json(lead);
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
