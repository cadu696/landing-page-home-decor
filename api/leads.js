module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
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
    res.status(201).json(lead);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
