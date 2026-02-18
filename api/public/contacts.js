const { readDb } = require('../_db');

module.exports = function handler(req, res) {
  try {
    const data = readDb();
    const c = data.contacts || {};
    let numbers = c.numbers || [];
    if (numbers.length === 0 && (c.whatsapp1 || c.whatsapp2)) {
      if (c.whatsapp1) numbers.push({ id: '1', number: c.whatsapp1 });
      if (c.whatsapp2) numbers.push({ id: '2', number: c.whatsapp2 });
    }
    res.json({ numbers, sites: data.sites || [] });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
