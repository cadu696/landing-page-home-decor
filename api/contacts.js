const { readDb, writeDb } = require('./_db');
const { verifyAuth } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    const user = verifyAuth(req);
    try {
      const data = readDb();
      const c = data.contacts || {};
      let numbers = c.numbers || [];
      if (numbers.length === 0 && (c.whatsapp1 || c.whatsapp2)) {
        if (c.whatsapp1) numbers.push({ id: '1', number: c.whatsapp1 });
        if (c.whatsapp2) numbers.push({ id: '2', number: c.whatsapp2 });
      }
      if (user) {
        // Admin format: { contacts: { numbers }, sites }
        let sites = data.sites || [];
        if (sites.length === 0 && (c.instagram || c.maps)) {
          if (c.instagram) sites.push({ id: '1', label: 'Instagram', url: c.instagram });
          if (c.maps) sites.push({ id: '2', label: 'Google Maps', url: c.maps });
        }
        res.json({ contacts: { numbers }, sites });
      } else {
        // Public format: { numbers, sites }
        res.json({ numbers, sites: data.sites || [] });
      }
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else if (req.method === 'PUT') {
    const user = verifyAuth(req);
    if (!user) return res.status(401).json({ error: 'Não autorizado' });
    try {
      const data = readDb();
      const { contacts, sites } = req.body || {};
      if (contacts && typeof contacts === 'object') {
        if (Array.isArray(contacts.numbers)) {
          data.contacts = data.contacts || {};
          data.contacts.numbers = contacts.numbers;
        }
      }
      if (Array.isArray(sites)) {
        data.sites = sites;
      }
      writeDb(data);
      res.json({ contacts: data.contacts, sites: data.sites || [] });
    } catch (e) {
      res.status(500).json({ error: 'Erro interno' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
